import { ListItem } from '@astryxdesign/core/List'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Text } from '@astryxdesign/core/Text'
import { Link } from '@astryxdesign/core/Link'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import ArabicText from '~/components/quran/arabic_text'
import BookmarkedMenu from '~/components/bookmarks/bookmarked_menu'

/**
 * One bookmark in the bookmarks list: "2:255 · Al-Baqarah" linking to the
 * ayah, its Arabic and English (or a line saying the text couldn't be loaded),
 * and the note. As on an Ayah of the reading page, the bookmark's menu shares
 * the reference's row, so the text below takes the full width.
 */
export default function BookmarkListItem({
  bookmark,
  onEditNote,
  onRemove,
}: {
  bookmark: Data.Bookmark.Variants['forList']
  onEditNote: () => void
  onRemove: () => void
}) {
  return (
    <ListItem
      label={
        <HStack hAlign="between" vAlign="center" gap={2}>
          <Link
            href={urlFor(
              'surahs.show',
              { number: bookmark.surahNumber },
              { qs: { ayah: bookmark.ayahNumber } }
            )}
          >
            {bookmark.title}
          </Link>
          <BookmarkedMenu bookmark={bookmark} onEditNote={onEditNote} onRemove={onRemove} />
        </HStack>
      }
      description={
        <VStack gap={4} paddingBlockStart={1}>
          {bookmark.text ? (
            <>
              <ArabicText>{bookmark.text.arabic}</ArabicText>
              <Text type="body" color="primary">
                {bookmark.text.english}
              </Text>
            </>
          ) : (
            <Text type="supporting" color="secondary">
              The ayah text couldn&apos;t be loaded right now.
            </Text>
          )}
          {bookmark.note !== null && (
            <Text type="body" color="secondary">
              {bookmark.note}
            </Text>
          )}
        </VStack>
      }
    />
  )
}
