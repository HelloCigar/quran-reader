import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import { useToast } from '@astryxdesign/core/Toast'
import type { Data } from '@generated/data'
import {
  ReadingPositionSaver,
  useHeardReadingPosition,
} from '~/components/quran/use_reading_position'

/**
 * The Word whose popover is open, and who opened it: the Recitation as it
 * reaches the Word, or the reader by hand.
 */
export type ShownWord = { location: string; by: 'recitation' | 'reader' } | null

/** The Recited Ayah, and the Recitation it is heard in. */
export type Recited = { recitation: Data.Recitation; ayah: number }

/**
 * What a Surah's page gives the Recitation bar while it is open: its Surah,
 * and the Ayah a first Play starts from.
 */
export type ReadingPage = {
  surahNumber: number
  /** How many Ayahs its Surah has. */
  ayahCount: number
  /** The first Ayah the reader can see. */
  firstAyahInView: () => number
  /** Shows the start of an Ayah of its Surah, loading its block when it isn't loaded. */
  showAyah: (ayah: number) => void
}

type TimedWord = { location: string; ayah: number; startMs: number }

/**
 * 10 ms of silence, played during the click on Play while the Recitation
 * loads. Browsers that let audio start only from a click (Safari, Firefox)
 * unlock the audio element once it plays during one, so the Surah's file can
 * still start after a load that outlasts the click.
 */
const SILENCE =
  'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='

/**
 * Plays a Surah's Recitation and keeps the open Word popover on the Recited
 * Word. It lives in the app layout, so the Recitation keeps playing while the
 * reader goes to other pages; a full reload starts with none.
 *
 * A Surah's Recitation is loaded by a partial reload of that Surah's page, on
 * its first Play or the first Word opened there, and kept from then on.
 *
 * - Between Words, and over Words with no timing, the popover stays on the
 *   last Recited Word.
 * - Opening or closing a popover by hand pauses the Recitation; resuming
 *   carries on where it paused.
 * - Opening a Word's popover by hand plays that Word alone, from its start to
 *   its end, on an audio element of its own, so the Recitation keeps its place.
 * - At the end of the Surah, or when the reader closes it, the Recitation is
 *   over: nothing is recited and its place is forgotten.
 */
function useRecitationPlayer() {
  const router = useRouter()
  const showToast = useToast()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  /** Plays one Word on its own, apart from the Recitation. */
  const wordAudioRef = useRef<HTMLAudioElement | null>(null)
  /** Stops the Word playing on its own, if one is. */
  const stopWordRef = useRef<(() => void) | null>(null)
  /** Where playback last started from: Words before it are not recited. */
  const originMsRef = useRef(0)
  /** What to play once the Recitation has loaded: from an Ayah, or one Word. */
  const pendingRef = useRef<((loaded: Data.Recitation) => void) | null>(null)
  const isLoadingRef = useRef(false)
  /** Each Surah's Recitation once loaded; `null` when it was unavailable. */
  const loadedRef = useRef(new Map<number, Data.Recitation | null>())
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shown, setShown] = useState<ShownWord>(null)
  const [recited, setRecited] = useState<Recited | null>(null)
  const [readingPage, setReadingPage] = useState<ReadingPage | null>(null)
  const recitation = recited?.recitation

  const words = useMemo<TimedWord[]>(
    () =>
      (recitation?.ayahs ?? []).flatMap((ayah) =>
        ayah.words.map((word) => ({
          location: word.location,
          ayah: ayah.number,
          startMs: word.startMs,
        }))
      ),
    [recitation]
  )

  /**
   * The Recited Word at `ms`: the last timed Word that has started, counting
   * only Words from where playback last started.
   */
  const recitedAt = useCallback(
    (ms: number) => {
      let found: TimedWord | null = null
      for (const word of words) {
        if (word.startMs > ms) break
        if (word.startMs >= originMsRef.current) found = word
      }
      return found
    },
    [words]
  )

  /**
   * While playing, follows the audio every frame and moves the popover to the
   * Recited Word.
   */
  useEffect(() => {
    const element = audioRef.current
    if (!isPlaying || !element) return

    let frame = 0
    const follow = () => {
      const word = recitedAt(element.currentTime * 1000)
      if (word) {
        setShown((current) =>
          current?.location === word.location && current.by === 'recitation'
            ? current
            : { location: word.location, by: 'recitation' }
        )
        setRecited((current) =>
          current && current.ayah !== word.ayah ? { ...current, ayah: word.ayah } : current
        )
      }
      frame = requestAnimationFrame(follow)
    }
    frame = requestAnimationFrame(follow)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, recitedAt])

  const audio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
    }
    return audioRef.current
  }, [])

  const wordAudio = useCallback(() => {
    if (!wordAudioRef.current) {
      wordAudioRef.current = new Audio()
      wordAudioRef.current.preload = 'auto'
    }
    return wordAudioRef.current
  }, [])

  const stopWord = useCallback(() => {
    stopWordRef.current?.()
    stopWordRef.current = null
  }, [])

  /**
   * Plays the Word at `location` alone: from its start, pausing at its end. A
   * Word with no timing plays nothing.
   */
  const playWord = useCallback(
    (loaded: Data.Recitation, location: string) => {
      stopWord()
      const word = loaded.ayahs
        .flatMap((ayah) => ayah.words)
        .find((timed) => timed.location === location)
      if (!word) return

      const element = wordAudio()
      if (element.src !== loaded.audioUrl) element.src = loaded.audioUrl
      element.currentTime = word.startMs / 1000

      /**
       * Animation frames stop the Word on time, but a hidden page or a locked
       * phone suspends them while the audio plays on. `timeupdate` keeps
       * firing there (a few times a second), so the Word still stops near its
       * end instead of running on through the Surah.
       */
      const { endMs } = word
      let frame = 0
      const check = () => {
        if (element.currentTime * 1000 >= endMs) stop()
      }
      const stop = () => {
        cancelAnimationFrame(frame)
        element.removeEventListener('timeupdate', check)
        element.pause()
      }
      const watch = () => {
        if (element.paused) return
        check()
        if (!element.paused) frame = requestAnimationFrame(watch)
      }
      element.addEventListener('timeupdate', check)
      element.play().then(
        () => {
          frame = requestAnimationFrame(watch)
        },
        () => {}
      )
      stopWordRef.current = stop
    },
    [stopWord, wordAudio]
  )

  /**
   * Puts the audio at the start of `toAyah` of `loaded`, which becomes the
   * Recited Ayah, without playing or pausing it; or, with `atMs`, at the
   * start of the Word of that Ayah which begins then.
   */
  const seek = useCallback(
    (element: HTMLAudioElement, loaded: Data.Recitation, toAyah: number, atMs?: number) => {
      const ayah = loaded.ayahs.find(({ number }) => number === toAyah)
      // A first Word can begin a little before its Ayah: start from whichever is first.
      const fromMs = atMs ?? Math.min(ayah?.startMs ?? 0, ayah?.words[0]?.startMs ?? Infinity)
      originMsRef.current = fromMs
      element.currentTime = fromMs / 1000
      setShown((current) => (current?.by === 'recitation' ? null : current))
      setRecited({ recitation: loaded, ayah: toAyah })
    },
    []
  )

  /**
   * Plays `loaded` from the start of `fromAyah`, which becomes the Recited
   * Ayah, or with `atMs` from the Word of that Ayah which begins then; or,
   * with no Ayah, carries on where the audio is.
   */
  const start = useCallback(
    (loaded: Data.Recitation, fromAyah: number | null, atMs?: number) => {
      stopWord()
      const element = audio()
      if (element.src !== loaded.audioUrl) element.src = loaded.audioUrl
      if (fromAyah !== null) {
        seek(element, loaded, fromAyah, atMs)
        setShown(null)
      }

      element.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      )
    },
    [audio, seek, stopWord]
  )

  /**
   * Loads the Recitation of the Surah whose page is open, then plays whatever
   * `pendingRef` holds by then: pausing empties it, and a later request
   * replaces it. `element` is the audio element that will play: it plays a
   * moment of silence during this click (see SILENCE). Every attempt ends
   * here, so a failed, cancelled or repeated unavailable load never leaves
   * Play stuck loading. The load runs in the background (`async`): it is not
   * a visit, so it shows no page progress and the sidebar's drawer ignores it.
   */
  const load = useCallback(
    (element: HTMLAudioElement, surahNumber: number, then: (loaded: Data.Recitation) => void) => {
      element.src = SILENCE
      element.play().catch(() => {})
      pendingRef.current = then
      // One load at a time: the one in flight plays the latest request.
      if (isLoadingRef.current) return

      isLoadingRef.current = true
      setIsLoading(true)
      router.visit(
        { href: window.location.href },
        {
          only: ['recitation'],
          async: true,
          preserveState: true,
          preserveScroll: true,
          replace: true,
          onSuccess: (page) => {
            const loaded = (page.props as { recitation?: Data.Recitation | null }).recitation
            loadedRef.current.set(surahNumber, loaded ?? null)
            if (!loaded) {
              showToast({ body: 'Recitation is unavailable right now.', type: 'error' })
              return
            }
            pendingRef.current?.(loaded)
          },
          onFinish: () => {
            pendingRef.current = null
            isLoadingRef.current = false
            setIsLoading(false)
          },
        }
      )
    },
    [router, showToast]
  )

  /**
   * Pauses the Recitation, and cancels a Play still waiting for it to load.
   */
  const pause = useCallback(() => {
    pendingRef.current = null
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  /**
   * Starts the Recitation of the Surah whose page is open, from the start of
   * `fromAyah`. It takes the place of any other Recitation.
   */
  const play = useCallback(
    (surahNumber: number, fromAyah: number) => {
      const loaded = loadedRef.current.get(surahNumber)
      if (loaded) {
        start(loaded, fromAyah)
        return
      }

      pause()
      // Starting the Surah's file replaces the silence and rejects its play().
      load(audio(), surahNumber, (fresh) => start(fresh, fromAyah))
    },
    [audio, load, pause, start]
  )

  /**
   * Carries on where the Recitation paused. When its audio element has since
   * been used to load another Surah, its place in the file is gone, and it
   * carries on from the start of the Recited Ayah.
   */
  const resume = useCallback(() => {
    if (!recited) return
    const hasLostPlace = audio().src !== recited.recitation.audioUrl
    start(recited.recitation, hasLostPlace ? recited.ayah : null)
  }, [audio, recited, start])

  /**
   * Moves the Recitation to the start of `toAyah` of its Surah. Playing, it
   * plays on from there; paused, it stays paused and Play carries on from
   * there. It cancels a Play still waiting for another Surah's Recitation to
   * load, which would otherwise replace the Ayah moved to.
   */
  const moveTo = useCallback(
    (toAyah: number) => {
      if (!recited) return
      pendingRef.current = null
      if (isPlaying) {
        start(recited.recitation, toAyah)
        return
      }
      const element = audio()
      if (element.src === recited.recitation.audioUrl) seek(element, recited.recitation, toAyah)
      // Its place in the file is gone: Play carries on from the start of the Recited Ayah.
      else setRecited({ recitation: recited.recitation, ayah: toAyah })
    },
    [audio, isPlaying, recited, seek, start]
  )

  /**
   * Plays the Recitation from the start of `fromAyah` of its Surah, whether
   * it was playing or paused. Like `moveTo`, it cancels a Play still waiting
   * for another Surah's Recitation to load.
   */
  const playAt = useCallback(
    (fromAyah: number) => {
      if (!recited) return
      pendingRef.current = null
      start(recited.recitation, fromAyah)
    },
    [recited, start]
  )

  /**
   * Plays the Recitation from the start of the Word at `location`, whose
   * Ayah becomes the Recited Ayah. A Word with no timing plays nothing.
   */
  const playAtWord = useCallback(
    (location: string) => {
      const word = words.find((timed) => timed.location === location)
      if (!recited || !word) return
      pendingRef.current = null
      start(recited.recitation, word.ayah, word.startMs)
    },
    [recited, start, words]
  )

  /**
   * How far the Recitation has got: the time in its Surah's audio file, in
   * ms (see ADR 0002). When its audio element has since been used to load
   * another Surah, that is the start of the Recited Ayah, where Play carries
   * on from.
   */
  const positionMs = useCallback(() => {
    if (!recited) return 0
    const element = audioRef.current
    if (element && element.src === recited.recitation.audioUrl) return element.currentTime * 1000
    return recited.recitation.ayahs.find(({ number }) => number === recited.ayah)?.startMs ?? 0
  }, [recited])

  /**
   * Stops the Recitation, forgets its place and closes the Recited Word's
   * popover.
   */
  const close = useCallback(() => {
    pendingRef.current = null
    const element = audioRef.current
    if (element) {
      element.pause()
      element.removeAttribute('src')
      element.load()
    }
    originMsRef.current = 0
    setIsPlaying(false)
    setRecited(null)
    setShown((current) => (current?.by === 'recitation' ? null : current))
  }, [])

  useEffect(() => {
    const element = audio()
    const onEnded = () => {
      // The silence played while the Recitation loads is not the end of the Surah.
      if (element.src === SILENCE) return
      close()
    }
    element.addEventListener('ended', onEnded)
    return () => {
      element.removeEventListener('ended', onEnded)
      element.pause()
      stopWord()
    }
  }, [audio, close, stopWord])

  /**
   * The reader opens or closes the popover of a Word of the Surah whose page
   * is open: the Recitation pauses, and an opened Word plays alone. The first
   * such Word loads that Surah's Recitation; once it is known to be
   * unavailable, Words open silently.
   */
  const openWord = useCallback(
    (surahNumber: number, location: string, isOpen: boolean) => {
      pause()
      stopWord()
      setShown(isOpen ? { location, by: 'reader' } : null)
      if (!isOpen) return
      const loaded = loadedRef.current.get(surahNumber)
      if (loaded) playWord(loaded, location)
      else if (loaded === undefined) {
        load(wordAudio(), surahNumber, (fresh) => playWord(fresh, location))
      }
    },
    [load, pause, playWord, stopWord, wordAudio]
  )

  /**
   * A popover the reader opened belongs to the Surah page it is on. Leaving
   * that page closes it and stops its Word, so it isn't open again when the
   * reader comes back.
   */
  const pageSurahNumber = readingPage?.surahNumber
  useEffect(() => {
    if (pageSurahNumber === undefined) return
    return () => {
      stopWord()
      setShown((current) => (current?.by === 'reader' ? null : current))
    }
  }, [pageSurahNumber, stopWord])

  return useMemo(
    () => ({
      isPlaying,
      isLoading,
      shown,
      /** `null` until a Recitation starts, and again once it ends or is closed. */
      recited,
      /** The Surah page that is open, if one is. */
      readingPage,
      setReadingPage,
      play,
      resume,
      pause,
      close,
      moveTo,
      playAt,
      playAtWord,
      positionMs,
      openWord,
    }),
    [
      isPlaying,
      isLoading,
      shown,
      recited,
      readingPage,
      play,
      resume,
      pause,
      close,
      moveTo,
      playAt,
      playAtWord,
      positionMs,
      openWord,
    ]
  )
}

type Recitation = ReturnType<typeof useRecitationPlayer> & {
  /**
   * Saves the signed-in reader's Reading Position, for the Ayahs heard and
   * for the reading page; `null` for a signed-out reader.
   */
  readingPositionSaver: ReadingPositionSaver | null
}

const RecitationContext = createContext<Recitation | null>(null)

/**
 * Holds the one Recitation for every page inside the app layout, and moves
 * the signed-in reader's Reading Position to each Ayah heard. `readerId` is
 * that reader's id, absent for a signed-out reader.
 */
export function RecitationProvider({
  readerId,
  children,
}: {
  readerId: number | undefined
  children: ReactNode
}) {
  const player = useRecitationPlayer()
  /**
   * One saver per reader: it remembers the last position it saved, which must
   * not carry over to the next reader to sign in on this tab.
   */
  const saver = useMemo(
    () => (readerId === undefined ? null : new ReadingPositionSaver()),
    [readerId]
  )
  const { recited } = player
  useHeardReadingPosition({
    surahNumber: recited?.recitation.surahNumber ?? null,
    ayah: recited?.ayah ?? null,
    saver,
  })
  const recitation = useMemo(() => ({ ...player, readingPositionSaver: saver }), [player, saver])

  return <RecitationContext value={recitation}>{children}</RecitationContext>
}

/** The Recitation, inside the app layout. */
export function useRecitation() {
  const recitation = use(RecitationContext)
  if (!recitation) throw new Error('useRecitation needs a RecitationProvider')
  return recitation
}

/**
 * Tells the Recitation bar that a Surah's page is open, for as long as it is.
 * `firstAyahInView` and `showAyah` must be stable (`useCallback`).
 */
export function useReadingPage({ surahNumber, ayahCount, firstAyahInView, showAyah }: ReadingPage) {
  const { setReadingPage } = useRecitation()

  // Before the page is painted, so the bar is there from the first frame.
  useLayoutEffect(() => {
    setReadingPage({ surahNumber, ayahCount, firstAyahInView, showAyah })
    return () => setReadingPage(null)
  }, [surahNumber, ayahCount, firstAyahInView, showAyah, setReadingPage])
}

/**
 * How far the Recitation has got, in ms of its Surah's audio file, read
 * every frame while it plays and once after each move while it is paused.
 *
 * `read` reads it at once. A caller that has just moved the Recitation calls
 * it, so nothing shows the place it left for the frame before the next read.
 */
export function useRecitationPosition() {
  const { isPlaying, positionMs } = useRecitation()
  const [ms, setMs] = useState(positionMs)
  const read = useCallback(() => setMs(positionMs()), [positionMs])

  useEffect(() => {
    let frame = requestAnimationFrame(function readFrame() {
      setMs(positionMs())
      if (isPlaying) frame = requestAnimationFrame(readFrame)
    })
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, positionMs])

  return [ms, read] as const
}
