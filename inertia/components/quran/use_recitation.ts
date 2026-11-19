import { createContext, use, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { Data } from '@generated/data'
import type { Recitation } from '~/components/quran/recitation'

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
  /** Its Surah's transliterated name, which the bar shows before a Recitation starts. */
  surahName: string
  /** How many Ayahs its Surah has. */
  ayahCount: number
  /** The first Ayah the reader can see. */
  firstAyahInView: () => number
  /** Shows the start of an Ayah of its Surah, loading its block when it isn't loaded. */
  showAyah: (ayah: number) => void
}

/**
 * The one Recitation of the app layout. `RecitationProvider`
 * (`recitation.tsx`) holds it; the hooks here read it. They live apart from
 * the provider so that file exports only a component, which React Fast
 * Refresh can swap in place.
 */
export const RecitationContext = createContext<Recitation | null>(null)

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
export function useReadingPage({
  surahNumber,
  surahName,
  ayahCount,
  firstAyahInView,
  showAyah,
}: ReadingPage) {
  const { setReadingPage } = useRecitation()

  // Before the page is painted, so the bar is there from the first frame.
  useLayoutEffect(() => {
    setReadingPage({ surahNumber, surahName, ayahCount, firstAyahInView, showAyah })
    return () => setReadingPage(null)
  }, [surahNumber, surahName, ayahCount, firstAyahInView, showAyah, setReadingPage])
}

/**
 * How far the Recitation has got, in ms of its Surah's audio file, to the
 * nearest `stepMs` below. It is read every frame while it plays and once
 * after each move while it is paused, but the caller renders only when it
 * crosses a step: a clock that shows seconds asks for 1000.
 *
 * `read` reads it at once. A caller that has just moved the Recitation calls
 * it, so nothing shows the place it left for the frame before the next read.
 */
export function useRecitationPosition(stepMs: number) {
  const { isPlaying, positionMs } = useRecitation()
  const steppedMs = useCallback(
    () => Math.floor(positionMs() / stepMs) * stepMs,
    [positionMs, stepMs]
  )
  const [ms, setMs] = useState(steppedMs)
  const read = useCallback(() => setMs(steppedMs()), [steppedMs])

  useEffect(() => {
    let frame = requestAnimationFrame(function readFrame() {
      setMs(steppedMs())
      if (isPlaying) frame = requestAnimationFrame(readFrame)
    })
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, steppedMs])

  return [ms, read] as const
}
