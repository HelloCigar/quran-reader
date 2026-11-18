import { useEffect, useState } from 'react'

/** How long a removed row takes to leave: its exit animation, in milliseconds (`LEAVE` in `bookmark_list_item.tsx`). */
const LEAVE_MS = 380

export type LeavingRow<T> = { item: T; leaving: boolean }

function stays<T>(item: T): LeavingRow<T> {
  return { item, leaving: false }
}

/**
 * Whether the reader asked for less motion, which leaves a removed row no
 * exit to play.
 */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * The rows of a list that gives a removed row time to leave. When the items of
 * the same `page` shrink, each one that is gone stays, marked `leaving`, in
 * its place for `LEAVE_MS` and then goes; opening another page replaces the
 * rows at once. Render a `leaving` row with its exit animation.
 */
export function useLeavingRows<T extends { id: number }>(
  items: T[],
  page: number
): LeavingRow<T>[] {
  const [rows, setRows] = useState<LeavingRow<T>[]>(() => items.map(stays))
  const [seen, setSeen] = useState({ items, page })

  // Derived while rendering, so a removed row is never painted missing first.
  if (seen.items !== items) {
    setSeen({ items, page })
    const next = items.map(stays)
    if (page === seen.page && !prefersReducedMotion()) {
      rows.forEach((row, index) => {
        if (!items.some((item) => item.id === row.item.id)) {
          next.splice(Math.min(index, next.length), 0, { item: row.item, leaving: true })
        }
      })
    }
    setRows(next)
  }

  const anyLeaving = rows.some((row) => row.leaving)
  useEffect(() => {
    if (!anyLeaving) return
    const timer = window.setTimeout(
      () => setRows((current) => current.filter((row) => !row.leaving)),
      LEAVE_MS
    )
    return () => window.clearTimeout(timer)
  }, [anyLeaving, rows])

  return rows
}
