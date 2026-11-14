import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import { useToast } from '@astryxdesign/core/Toast'
import type { Data } from '@generated/data'

/**
 * The Word whose popover is open, and who opened it: the Recitation as it
 * reaches the Word, or the reader by hand.
 */
export type ShownWord = { location: string; by: 'recitation' | 'reader' } | null

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
 * Word. The Recitation is loaded by a partial reload on the first Play.
 *
 * - Between Words, and over Words with no timing, the popover stays on the
 *   last Recited Word.
 * - Opening or closing a popover by hand pauses the Recitation; Play resumes
 *   where it paused.
 * - Opening a Word's popover by hand plays that Word alone, from its start to
 *   its end, on an audio element of its own, so the Recitation keeps its place.
 * - At the end of the Surah it stops and closes the popover.
 *
 * `firstAyahInView` names the Ayah the first Play starts from when no Ayah is
 * chosen, so a reader who opened the Surah at 2:255 isn't sent back to 2:1.
 */
export function useRecitation(
  recitation: Data.Recitation | null | undefined,
  firstAyahInView: () => number
) {
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shown, setShown] = useState<ShownWord>(null)
  const [recitedAyah, setRecitedAyah] = useState<number | null>(null)

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
        setRecitedAyah(word.ayah)
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

  const start = useCallback(
    (loaded: Data.Recitation, fromAyah: number | null) => {
      stopWord()
      const element = audio()
      if (element.src !== loaded.audioUrl) element.src = loaded.audioUrl

      if (fromAyah !== null) {
        const ayah = loaded.ayahs.find(({ number }) => number === fromAyah)
        // A first Word can begin a little before its Ayah: start from whichever is first.
        const fromMs = Math.min(ayah?.startMs ?? 0, ayah?.words[0]?.startMs ?? Infinity)
        originMsRef.current = fromMs
        element.currentTime = fromMs / 1000
        setShown(null)
      }

      element.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      )
    },
    [audio, stopWord]
  )

  /**
   * Loads the Recitation, then plays whatever `pendingRef` holds by then:
   * pausing empties it, and a later request replaces it. `element` is the audio
   * element that will play: it plays a moment of silence during this click (see
   * SILENCE). Every attempt ends here, so a failed, cancelled or repeated
   * unavailable load never leaves Play stuck loading.
   */
  const load = useCallback(
    (element: HTMLAudioElement, then: (loaded: Data.Recitation) => void) => {
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
          preserveState: true,
          preserveScroll: true,
          replace: true,
          onSuccess: (page) => {
            const loaded = (page.props as { recitation?: Data.Recitation | null }).recitation
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
   * Plays from the start of `fromAyah`, or resumes where it paused (from the
   * first Ayah in view when it has not started).
   */
  const play = useCallback(
    (fromAyah?: number) => {
      const hasStarted = Boolean(audioRef.current?.src) && recitedAyah !== null
      const from = fromAyah ?? (hasStarted ? null : firstAyahInView())

      if (recitation) {
        start(recitation, from)
        return
      }

      // Starting the Surah's file replaces the silence and rejects its play().
      load(audio(), (loaded) => start(loaded, from ?? 1))
    },
    [audio, firstAyahInView, load, recitation, recitedAyah, start]
  )

  useEffect(() => {
    const element = audio()
    const onEnded = () => {
      // The silence played while the Recitation loads is not the end of the Surah.
      if (element.src === SILENCE) return
      setIsPlaying(false)
      setShown(null)
      setRecitedAyah(null)
      originMsRef.current = 0
    }
    element.addEventListener('ended', onEnded)
    return () => {
      element.removeEventListener('ended', onEnded)
      element.pause()
      stopWord()
    }
  }, [audio, stopWord])

  /**
   * The reader opens or closes a Word's popover by hand: the Recitation
   * pauses, and an opened Word plays alone. The first such Word loads the
   * Recitation; once it is known to be unavailable, Words open silently.
   */
  const openByReader = useCallback(
    (location: string, isOpen: boolean) => {
      pause()
      stopWord()
      setShown(isOpen ? { location, by: 'reader' } : null)
      if (!isOpen) return
      if (recitation) playWord(recitation, location)
      else if (recitation === undefined) {
        load(wordAudio(), (loaded) => playWord(loaded, location))
      }
    },
    [load, pause, playWord, recitation, stopWord, wordAudio]
  )

  return {
    isPlaying,
    isLoading,
    shown,
    recitedAyah,
    play,
    pause,
    openByReader,
  }
}
