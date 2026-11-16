import { useCallback, useState } from 'react'
import { usePage } from '@inertiajs/react'
import type { Data } from '@generated/data'
import { useNavigationEvent } from '~/components/navigation/navigation_events'

/**
 * The note prompt of a Surah's page: which Bookmark's note is open, out of
 * `bookmarksByAyah`. The server asks for it once, with the `noteFor` flash:
 * as the page opens after a sign-in that bookmarked an Ayah, or in place
 * after the reader bookmarks one here. Render `NoteDialog` with `bookmark`
 * and `close`.
 */
export function useNotePrompt(bookmarksByAyah: Map<number, Data.Bookmark>) {
  const { flash } = usePage()
  const [ayah, setAyah] = useState(flash.noteFor)
  useNavigationEvent('flash', (event) => setAyah((open) => event.detail.flash.noteFor ?? open))

  /** Stable, so a memoized row that takes it does not re-render. */
  const edit = useCallback((bookmark: Data.Bookmark) => setAyah(bookmark.ayahNumber), [])
  const close = useCallback(() => setAyah(undefined), [])
  const bookmark = ayah === undefined ? undefined : bookmarksByAyah.get(ayah)

  return { bookmark, edit, close }
}
