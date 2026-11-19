import { useCallback, useEffect, useEffectEvent, useRef, type RefObject } from 'react'
import { ayahsInView, regionView, scrollRegion } from '~/components/quran/ayahs_in_view'
import type { ShownWord } from '~/components/quran/recitation'

/**
 * How long (in ms) after the reader's last wheel, touch or key a scroll still
 * counts as theirs, where the browser can't say when a scroll has ended.
 */
const READER_SCROLL_MS = 1000

/** Keys that scroll the page when nothing focused takes them. */
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

/**
 * Keeps the Recited Word in view on the page of the Surah being recited, so
 * the reader can follow along without touching the page. `shown` is the Word
 * whose popover shows on this page, which is the Recited Word when the
 * Recitation opened it, and `recitedAyah` the Recited Ayah while it is one of
 * this Surah's, `null` otherwise.
 *
 * - The page scrolls only when the Recited Word has left the view: the region
 *   the Ayahs scroll in, not the window, since a Word under the Recitation bar
 *   or the top nav is inside the window but hidden.
 * - A scroll by the reader's hand that leaves the Recited Ayah out of view
 *   stops the following; one that brings it back into view starts it again,
 *   as does the Recitation reaching the Ayahs the reader scrolled ahead to.
 *   Only a scroll that follows the reader's wheel, touch, key or scrollbar
 *   counts: the page's own scrolls, and Infinite scroll keeping its place as
 *   a block loads above, never do.
 * - `follow` starts it again, for a move the reader makes from the page or
 *   the Recitation bar. With no Recited Ayah on this page, it starts again on
 *   its own.
 *
 * Scrolling by hand never moves the Recitation.
 */
export function useFollowRecitation({
  listRef,
  shown,
  recitedAyah,
}: {
  listRef: RefObject<HTMLElement | null>
  shown: ShownWord
  recitedAyah: number | null
}) {
  const isFollowingRef = useRef(true)
  const recitedWord = shown?.by === 'recitation' ? shown.location : null
  const follow = useCallback(() => {
    isFollowingRef.current = true
  }, [])

  useEffect(() => {
    if (recitedAyah === null) isFollowingRef.current = true
  }, [recitedAyah])

  /** Whether the Recited Ayah shows in the region the Ayahs scroll in. */
  const isRecitedAyahInView = useEffectEvent(() => {
    const inView = ayahsInView(listRef.current)
    return inView !== null && recitedAyah !== null
      ? recitedAyah >= inView.first && recitedAyah <= inView.last
      : false
  })

  useEffect(() => {
    if (recitedWord === null) return
    // The Recitation has reached the Ayahs the reader scrolled ahead to.
    if (!isFollowingRef.current && isRecitedAyahInView()) isFollowingRef.current = true
    if (!isFollowingRef.current) return
    const element = listRef.current?.querySelector<HTMLElement>(
      `[data-word-location="${recitedWord}"]`
    )
    if (!element) return
    const view = regionView(scrollRegion(element))
    const rect = element.getBoundingClientRect()
    if (rect.top < view.top || rect.bottom > view.bottom) {
      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [recitedWord, listRef])

  /** Where the reader's scroll has left the Recited Ayah decides whether the page follows it. */
  const measure = useEffectEvent(() => {
    if (ayahsInView(listRef.current) === null) return
    isFollowingRef.current = isRecitedAyahInView()
  })

  const isRecitedHere = recitedAyah !== null
  // The cleanup clears the timer `byReader` keeps, as well as the frame and the listeners.
  // oxlint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    if (!isRecitedHere) return
    let isReaderScrolling = false
    let idle: number | undefined
    let frame = 0

    const byReader = () => {
      isReaderScrolling = true
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        isReaderScrolling = false
      }, READER_SCROLL_MS)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) byReader()
    }
    // A press on a scrollbar lands on the element that scrolls, not on anything inside it.
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target && target === scrollRegion(listRef.current)) byReader()
    }
    const onScroll = () => {
      if (!isReaderScrolling) return
      byReader()
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          measure()
        })
      }
    }
    const onScrollEnd = () => {
      if (!isReaderScrolling) return
      isReaderScrolling = false
      window.clearTimeout(idle)
      measure()
    }

    const options = { capture: true, passive: true }
    document.addEventListener('wheel', byReader, options)
    document.addEventListener('touchmove', byReader, options)
    document.addEventListener('keydown', onKeyDown, options)
    document.addEventListener('pointerdown', onPointerDown, options)
    // The Ayahs scroll in a region of the page: scroll events reach the document only while captured.
    document.addEventListener('scroll', onScroll, options)
    document.addEventListener('scrollend', onScrollEnd, options)
    return () => {
      document.removeEventListener('wheel', byReader, { capture: true })
      document.removeEventListener('touchmove', byReader, { capture: true })
      document.removeEventListener('keydown', onKeyDown, { capture: true })
      document.removeEventListener('pointerdown', onPointerDown, { capture: true })
      document.removeEventListener('scroll', onScroll, { capture: true })
      document.removeEventListener('scrollend', onScrollEnd, { capture: true })
      cancelAnimationFrame(frame)
      window.clearTimeout(idle)
    }
  }, [isRecitedHere, listRef])

  return follow
}
