import * as stylex from '@stylexjs/stylex'
import { Fragment, memo } from 'react'
import { PlayIcon } from '@heroicons/react/24/outline'
import { ListItem } from '@astryxdesign/core/List'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  shadowVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import type { Data } from '@generated/data'
import ArabicText from '~/components/quran/arabic_text'
import WordButton from '~/components/quran/word_button'
import AyahBookmarkAction from '~/components/bookmarks/ayah_bookmark_action'
import { ENTRANCE_DELAYS, entranceStyles } from '~/components/quran/entrance_styles'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

const styles = stylex.create({
  /**
   * An Ayah's row: a faint tint under a mouse, and the tint of the Recited
   * Ayah. Both ease in and out, so the tint glides from one Ayah to the next
   * as the Recitation moves on. Only colours change: the row keeps its size.
   */
  row: {
    backgroundColor: {
      default: 'transparent',
      ':hover': { default: null, '@media (hover: hover)': colorVars['--color-overlay-hover'] },
    },
    borderRadius: radiusVars['--radius-page'],
    boxShadow: 'none',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: { default: durationVars['--duration-medium'], [REDUCED_MOTION]: '0s' },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  /** The Recited Ayah lifts into a card. */
  recited: {
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: shadowVars['--shadow-low'],
  },
  /** The reference takes the accent colour on the Recited Ayah, at the row's pace. */
  reference: {
    transitionProperty: 'color',
    transitionDuration: { default: durationVars['--duration-medium'], [REDUCED_MOTION]: '0s' },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
})

/**
 * One ayah: its reference ("2:255"), the Arabic as its Words (each opens its
 * meaning) and the ayah-end marker, reading right to left, and the English
 * translation beneath it. Its "play from this Ayah" and bookmark actions share
 * the reference's row, so the text below takes the full width.
 * `#ayah-<number>` anchors it.
 *
 * `isRecited` tints the Recited Ayah. `entranceOrder` is the Ayah's place in
 * the staggered entrance of the first screenful (`entrance_styles.ts`), `null`
 * for an Ayah that has none. The entrance is on what is inside the row, so
 * the row itself, which the page measures, never moves.
 *
 * Memoized, with stable callbacks from the page: a long Surah re-renders no
 * Ayah when the open Word changes, and only the Ayah left and the Ayah reached
 * when the Recited Ayah changes.
 */
export default memo(function AyahItem({
  surahNumber,
  ayah,
  bookmark,
  isSignedIn,
  isRecited,
  entranceOrder,
  onEditNote,
  onRemove,
  onPlayFrom,
}: {
  surahNumber: number
  ayah: Data.Ayah
  bookmark: Data.Bookmark | null
  isSignedIn: boolean
  isRecited: boolean
  entranceOrder: number | null
  onEditNote: (bookmark: Data.Bookmark) => void
  onRemove: (bookmark: Data.Bookmark) => void
  onPlayFrom: (ayah: number) => void
}) {
  const entrance = entranceOrder !== null && [entranceStyles.fadeUp, ENTRANCE_DELAYS[entranceOrder]]

  return (
    <ListItem
      id={`ayah-${ayah.number}`}
      xstyle={[styles.row, isRecited && styles.recited]}
      label={
        <HStack hAlign="between" vAlign="center" gap={2} xstyle={entrance}>
          <Text
            type="supporting"
            color={isRecited ? 'accent' : 'secondary'}
            xstyle={styles.reference}
          >
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
              isSignedIn={isSignedIn}
              onEditNote={onEditNote}
              onRemove={onRemove}
            />
          </HStack>
        </HStack>
      }
      description={
        <VStack gap={4} paddingBlockStart={1} xstyle={entrance}>
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
