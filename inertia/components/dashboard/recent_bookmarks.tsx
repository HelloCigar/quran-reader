import { BookmarkIcon } from '@heroicons/react/24/outline'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Link } from '@astryxdesign/core/Link'
import { List, ListItem } from '@astryxdesign/core/List'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '@astryxdesign/core/Icon'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'

/**
 * The reader's newest Bookmarks, each linking to its Ayah with its note, and
 * a "See all" link to the bookmarks list. With none, it explains how to
 * bookmark an Ayah.
 */
export default function RecentBookmarks({
  bookmarks,
}: {
  bookmarks: Data.Bookmark.Variants['forRecent'][]
}) {
  return (
    <VStack gap={3}>
      <HStack gap={3} justify="between" align="center">
        <Heading level={2}>Recent bookmarks</Heading>
        {bookmarks.length > 0 && <Link href={urlFor('bookmarks.index')}>See all</Link>}
      </HStack>
      {bookmarks.length === 0 ? (
        <EmptyState
          headingLevel={3}
          icon={<Icon icon={BookmarkIcon} size="lg" />}
          title="No bookmarks yet"
          description="While you read, select the bookmark button beside an Ayah's reference to keep it here, with a note if you like."
        />
      ) : (
        <List hasDividers edge="flush" aria-label="Recent bookmarks">
          {bookmarks.map((bookmark) => (
            <ListItem
              key={bookmark.id}
              label={bookmark.title}
              description={bookmark.note ?? undefined}
              href={urlFor(
                'surahs.show',
                { number: bookmark.surahNumber },
                { qs: { ayah: bookmark.ayahNumber } }
              )}
            />
          ))}
        </List>
      )}
    </VStack>
  )
}
