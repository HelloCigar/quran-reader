import { Fragment } from 'react'
import { PlayIcon } from '@heroicons/react/24/outline'
import { ListItem } from '@astryxdesign/core/List'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import ArabicText from '~/components/quran/arabic_text'
import WordButton from '~/components/quran/word_button'
import AyahBookmarkAction from '~/components/bookmarks/ayah_bookmark_action'

/**
 * One ayah: its reference ("2:255"), the Arabic as its Words (each opens its
 * meaning) and the ayah-end marker, reading right to left, and the English
 * translation beneath it, with its "play from this Ayah" and bookmark actions.
 * `#ayah-<number>` anchors it.
 */
export default function AyahItem({
  surahNumber,
  ayah,
  bookmark,
  onEditNote,
  onRemove,
  onPlayFrom,
}: {
  surahNumber: number
  ayah: Data.Ayah
  bookmark: Data.Bookmark | null
  onEditNote: (bookmark: Data.Bookmark) => void
  onRemove: (bookmark: Data.Bookmark) => void
  onPlayFrom: (ayah: number) => void
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
          <ArabicText>
            {ayah.words.map((word) => (
              <Fragment key={word.location}>
                <WordButton word={word} />{' '}
              </Fragment>
            ))}
            <Text type="inherit" color="inherit" data-testid="ayah-end">
              {ayah.endMarker}
            </Text>
          </ArabicText>
          <Text type="body" color="primary">
            {ayah.english}
          </Text>
        </VStack>
      }
      endContent={
        <HStack gap={1} vAlign="center">
          <Button
            label={`Play from ${ayah.reference}`}
            variant="ghost"
            isIconOnly
            icon={<Icon icon={PlayIcon} />}
            onClick={() => onPlayFrom(ayah.number)}
          />
          <AyahBookmarkAction
            surah={surahNumber}
            ayah={ayah.number}
            bookmark={bookmark}
            onEditNote={onEditNote}
            onRemove={onRemove}
          />
        </HStack>
      }
    />
  )
}
