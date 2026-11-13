import { usePage } from '@inertiajs/react'
import type { Data } from '@generated/data'
import BookmarkButton from '~/components/bookmarks/bookmark_button'
import BookmarkedMenu from '~/components/bookmarks/bookmarked_menu'

/**
 * Chooses an ayah's bookmark action: the marked menu when the reader has
 * bookmarked it, otherwise the bookmark button.
 */
export default function AyahBookmarkAction({
  surah,
  ayah,
  bookmark,
  onEditNote,
  onRemove,
}: {
  surah: number
  ayah: number
  bookmark: Data.Bookmark | null
  onEditNote: (bookmark: Data.Bookmark) => void
  onRemove: (bookmark: Data.Bookmark) => void
}) {
  const { user } = usePage().props

  if (bookmark) {
    return (
      <BookmarkedMenu
        bookmark={bookmark}
        onEditNote={() => onEditNote(bookmark)}
        onRemove={() => onRemove(bookmark)}
      />
    )
  }

  return <BookmarkButton surah={surah} ayah={ayah} isSignedIn={Boolean(user)} />
}
