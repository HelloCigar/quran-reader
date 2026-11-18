import * as stylex from '@stylexjs/stylex'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon } from '@heroicons/react/20/solid'
import { colorVars, durationVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu'
import { Icon } from '@astryxdesign/core/Icon'
import type { Data } from '@generated/data'

const triggerId = (bookmarkId: number) => `bookmark-menu-${bookmarkId}`

/** The menu is 180px wide: `spacing-12` is 48px, so four of them less one. */
const MENU_WIDTH = `calc(${spacingVars['--spacing-12']} * 3.75)`

const styles = stylex.create({
  /** The mark is the accent colour, and tints its button while the menu is open. */
  trigger: {
    color: colorVars['--color-icon-accent'],
    backgroundColor: {
      default: null,
      ':is([aria-expanded="true"])': `color-mix(in srgb, ${colorVars['--color-accent']} 10%, transparent)`,
    },
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
  },
})

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
        xstyle: styles.trigger,
      }}
      hasChevron={false}
      alignment="end"
      menuWidth={MENU_WIDTH}
      items={[
        { label: 'Edit note', icon: PencilIcon, onClick: onEditNote },
        { label: 'Remove', icon: TrashIcon, variant: 'destructive', onClick: onRemove },
      ]}
    />
  )
}
