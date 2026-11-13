import { ListItem } from '@astryxdesign/core/List'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import ArabicText from '~/components/quran/arabic_text'
import AyahBookmarkAction from '~/components/bookmarks/ayah_bookmark_action'

/**
 * One ayah: its reference ("2:255"), the Arabic exactly as given, reading right
 * to left, and the English translation beneath it, with its bookmark action.
 * `#ayah-<number>` anchors it.
 */
export default function AyahItem({
  surahNumber,
  ayah,
  bookmark,
  onEditNote,
  onRemove,
}: {
  surahNumber: number
  ayah: Data.Ayah
  bookmark: Data.Bookmark | null
  onEditNote: (bookmark: Data.Bookmark) => void
  onRemove: (bookmark: Data.Bookmark) => void
}) {
  return (
    <ListItem
      id={`ayah-${ayah.number}`}
      align="start"
      label={
        <Text type="supporting" color="secondary">
          {ayah.reference}
        </Text>
      }
      description={
        <VStack gap={3}>
          <ArabicText>{ayah.arabic}</ArabicText>
          <Text type="body" color="primary">
            {ayah.english}
          </Text>
        </VStack>
      }
      endContent={
        <AyahBookmarkAction
          surah={surahNumber}
          ayah={ayah.number}
          bookmark={bookmark}
          onEditNote={onEditNote}
          onRemove={onRemove}
        />
      }
    />
  )
}
