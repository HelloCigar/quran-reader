import { useEffect, useRef, useState, type RefObject } from 'react'
import { urlFor } from '~/client'
import { ayahsInView } from '~/components/quran/ayahs_in_view'

/**
 * How long (in ms) an Ayah stays first in view before the reader counts as
 * staying on it. A quick look is shorter.
 */
const STAY_MS = 3000

type Position = { surah: number; ayah: number }

/**
 * Saves the signed-in reader's Reading Position in the background, one
 * request at a time and in order: while one is on its way, only the latest
 * position waits behind it. Requests use `keepalive`, so a save started just
 * before the reader closes the tab still arrives.
 */
class ReadingPositionSaver {
  #latest: string | null = null
  #waiting: Position | null = null
  #isSending = false

  save(position: Position) {
    const key = `${position.surah}:${position.ayah}`
    if (key === this.#latest) return
    this.#latest = key
    this.#waiting = position
    this.#sendNext()
  }

  /**
   * Sends the waiting position now, as the reader leaves the page.
   */
  flush() {
    if (!this.#waiting) return
    void this.#send(this.#waiting).catch(() => {})
    this.#waiting = null
  }

  #sendNext() {
    if (this.#isSending || !this.#waiting) return
    const position = this.#waiting
    this.#waiting = null
    this.#isSending = true
    this.#send(position)
      .catch(() => {})
      .finally(() => {
        this.#isSending = false
        this.#sendNext()
      })
  }

  /**
   * A plain `fetch`, since only it can outlive the page (`keepalive`). It
   * sends the CSRF token as Inertia's own requests do.
   */
  #send(position: Position) {
    const token = /(?:^|;\s*)XSRF-TOKEN=([^;]*)/.exec(document.cookie)?.[1]
    return fetch(urlFor('reading_position.update'), {
      method: 'PUT',
      keepalive: true,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
      },
      body: JSON.stringify(position),
    })
  }
}

/**
 * Keeps the signed-in reader's Reading Position as they read the Surah whose
 * Ayahs `listRef` lists. It moves to an Ayah when the reader:
 *
 * - scrolls past it: it leaves the top of the view while they scroll. A jump
 *   (opening at an Ayah, Go to Ayah) passes over Ayahs that were never in
 *   view, and those don't count.
 * - stays on it: it stays first in view for STAY_MS.
 * - hears it: it is the Recited Ayah. While a Recitation plays, scrolling
 *   doesn't move the position.
 *
 * Signed-out readers have none, and nothing is kept for them.
 */
export function useReadingPosition({
  surahNumber,
  listRef,
  recitedAyah,
  isPlaying,
  isSignedIn,
}: {
  surahNumber: number
  listRef: RefObject<HTMLElement | null>
  recitedAyah: number | null
  isPlaying: boolean
  isSignedIn: boolean
}) {
  const [saver] = useState(() => new ReadingPositionSaver())
  const isPlayingRef = useRef(isPlaying)

  useEffect(() => {
    if (!isSignedIn) return
    const flush = () => saver.flush()
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [isSignedIn, saver])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    if (!isSignedIn || recitedAyah === null) return
    saver.save({ surah: surahNumber, ayah: recitedAyah })
  }, [isSignedIn, recitedAyah, saver, surahNumber])

  // The cleanup clears the stay timer `stayOn` keeps, as well as the frame and the listener.
  // oxlint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    if (!isSignedIn) return
    let stay: number | undefined
    const stayOn = (ayah: number) => {
      window.clearTimeout(stay)
      stay = window.setTimeout(() => {
        // The Recitation moves the position while it plays; a stay begun before Play doesn't count.
        if (!isPlayingRef.current) saver.save({ surah: surahNumber, ayah })
      }, STAY_MS)
    }

    let before = ayahsInView(listRef.current)
    if (before && !isPlayingRef.current) stayOn(before.first)

    let frame = 0
    const measure = () => {
      frame = 0
      const now = ayahsInView(listRef.current)
      if (!now) return
      const previous = before
      before = now
      if (isPlayingRef.current || now.first === previous?.first) return

      const passed = now.first - 1
      if (previous && now.first > previous.first && passed <= previous.last) {
        saver.save({ surah: surahNumber, ayah: passed })
      }
      stayOn(now.first)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    // The Ayahs scroll in a region of the page: scroll events reach the document only while captured.
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true })
      cancelAnimationFrame(frame)
      window.clearTimeout(stay)
    }
  }, [isSignedIn, listRef, saver, surahNumber])
}
