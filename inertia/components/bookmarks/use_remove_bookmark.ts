import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from '@adonisjs/inertia/react'
import type { Data } from '@generated/data'
import { focusBookmarkTrigger } from '~/components/bookmarks/bookmarked_menu'

/**
 * Removes a bookmark. One without a note goes at once; one with a note waits
 * for the reader to confirm, because the note is lost with it. Keeping it puts
 * focus back on its menu. Render `RemoveBookmarkDialog` with `pending`,
 * `confirm` and `cancel`.
 */
export function useRemoveBookmark() {
  const router = useRouter()
  /** `useRouter` returns a new router on every render; `remove` reads the latest. */
  const routerRef = useRef(router)
  useLayoutEffect(() => {
    routerRef.current = router
  })
  const [pending, setPending] = useState<Data.Bookmark | null>(null)

  const destroy = useCallback((bookmark: Data.Bookmark) => {
    routerRef.current.delete(
      { route: 'bookmarks.destroy', routeParams: { id: bookmark.id } },
      // Only the bookmarks change, so the Ayahs loaded so far stay.
      { preserveScroll: true, preserveState: true, only: ['bookmarks'] }
    )
  }, [])

  /** Stable, so a memoized row that takes it does not re-render. */
  const remove = useCallback(
    (bookmark: Data.Bookmark) => {
      if (bookmark.note === null) {
        destroy(bookmark)
      } else {
        setPending(bookmark)
      }
    },
    [destroy]
  )

  function confirm() {
    if (pending) destroy(pending)
    setPending(null)
  }

  function cancel() {
    if (pending) focusBookmarkTrigger(pending.id)
    setPending(null)
  }

  return { remove, pending, confirm, cancel }
}
