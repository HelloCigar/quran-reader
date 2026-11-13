import { BookmarkIcon } from '@heroicons/react/20/solid'
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu'
import { Icon } from '@astryxdesign/core/Icon'
import type { Data } from '@generated/data'

const triggerId = (bookmarkId: number) => `bookmark-menu-${bookmarkId}`

/**
 * Puts keyboard focus back on a bookmark's menu trigger, so closing a note or
 * remove dialog leaves the reader where they were. Waits a frame so it runs
 * after the dialog has finished closing.
 */
export function focusBookmarkTrigger(bookmarkId: number) {
  requestAnimationFrame(() => document.getElementById(triggerId(bookmarkId))?.focus())
}

/**
 * The "bookmarked" action: a marked menu to edit the note or remove the
 * bookmark. Shared by the surah page and the bookmarks list.
 */
export default function BookmarkedMenu({
  bookmark,
  onEditNote,
  onRemove,
}: {
  bookmark: Data.Bookmark
  onEditNote: () => void
  onRemove: () => void
}) {
  return (
    <DropdownMenu
      button={{
        id: triggerId(bookmark.id),
        label: `Bookmarked ${bookmark.reference}`,
        tooltip: 'Bookmarked',
        icon: <Icon icon={BookmarkIcon} />,
        variant: 'ghost',
        isIconOnly: true,
      }}
      hasChevron={false}
      alignment="end"
      items={[
        { label: 'Edit note', onClick: onEditNote },
        { label: 'Remove', onClick: onRemove },
      ]}
    />
  )
}
