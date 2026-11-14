import { Fragment, memo } from 'react'
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
 * translation beneath it. Its "play from this Ayah" and bookmark actions share
 * the reference's row, so the text below takes the full width.
 * `#ayah-<number>` anchors it.
 *
 * Memoized, with stable callbacks from the page: a long Surah re-renders no
 * Ayah when the open Word or the Recited Ayah changes.
 */
export default memo(function AyahItem({
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
      label={
        <HStack hAlign="between" vAlign="center" gap={2}>
          <Text type="supporting" color="secondary">
            {ayah.reference}
          </Text>
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
        </HStack>
      }
      description={
        <VStack gap={4} paddingBlockStart={1}>
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
    />
  )
})
