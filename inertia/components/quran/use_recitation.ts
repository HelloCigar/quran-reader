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
 * Plays a Surah's Recitation and keeps the open Word popover on the Recited
 * Word. The Recitation is loaded by a partial reload on the first Play.
 *
 * - Between Words, and over Words with no timing, the popover stays on the
 *   last Recited Word.
 * - Opening or closing a popover by hand pauses the Recitation; Play resumes
 *   where it paused.
 * - At the end of the Surah it stops and closes the popover.
 */
export function useRecitation(recitation: Data.Recitation | null | undefined) {
  const router = useRouter()
  const showToast = useToast()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  /** Where playback last started from: Words before it are not recited. */
  const originMsRef = useRef(0)
  /** The Ayah to start from once the Recitation has loaded. */
  const pendingRef = useRef<number | null>(null)
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

  const start = useCallback(
    (fromAyah: number | null) => {
      if (!recitation) return
      const element = audio()
      if (element.src !== recitation.audioUrl) element.src = recitation.audioUrl

      if (fromAyah !== null) {
        const ayah = recitation.ayahs.find(({ number }) => number === fromAyah)
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
    [audio, recitation]
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  /**
   * Plays from the start of `fromAyah`, or resumes where it paused (from the
   * first Ayah when it has not started).
   */
  const play = useCallback(
    (fromAyah?: number) => {
      const hasStarted = Boolean(audioRef.current?.src) && recitedAyah !== null
      const from = fromAyah ?? (hasStarted ? null : 1)

      if (recitation) {
        start(from)
        return
      }

      pendingRef.current = from ?? 1
      setIsLoading(true)
      router.visit(
        { href: window.location.href },
        { only: ['recitation'], preserveState: true, preserveScroll: true, replace: true }
      )
    },
    [recitation, recitedAyah, router, start]
  )

  /**
   * Starts the Recitation once the partial reload has brought it, or says it
   * is unavailable.
   */
  useEffect(() => {
    if (pendingRef.current === null || recitation === undefined) return
    const from = pendingRef.current
    pendingRef.current = null
    setIsLoading(false)

    if (recitation === null) {
      showToast({ body: 'Recitation is unavailable right now.', type: 'error' })
      return
    }
    start(from)
  }, [recitation, showToast, start])

  useEffect(() => {
    const element = audio()
    const onEnded = () => {
      setIsPlaying(false)
      setShown(null)
      setRecitedAyah(null)
      originMsRef.current = 0
    }
    element.addEventListener('ended', onEnded)
    return () => {
      element.removeEventListener('ended', onEnded)
      element.pause()
    }
  }, [audio])

  /**
   * The reader opens or closes a Word's popover by hand: the Recitation
   * pauses.
   */
  const openByReader = useCallback(
    (location: string, isOpen: boolean) => {
      pause()
      setShown(isOpen ? { location, by: 'reader' } : null)
    },
    [pause]
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
