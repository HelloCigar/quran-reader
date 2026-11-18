import * as stylex from '@stylexjs/stylex'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Link } from '@astryxdesign/core/Link'
import { List, ListItem } from '@astryxdesign/core/List'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '@astryxdesign/core/Icon'
import { Text } from '@astryxdesign/core/Text'
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  shadowVars,
  spacingVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import ArabicText from '~/components/quran/arabic_text'
import { ENTRANCE_DELAYS, entranceStyles } from '~/components/quran/entrance_styles'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const PHONE = '@media (max-width: 600px)'
const HOVER = '@media (hover: hover)'

/** Sizes the scales have no stop for, built from their stops. */
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`
const SPACE_3 = `calc(${spacingVars['--spacing-0-5']} + ${borderVars['--border-width']})`
const TITLE_SIZE = `calc(${textSizeVars['--font-size-base']} + ${borderVars['--border-width']})`
const ARABIC_SIZE = `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`
/** 19px: the Arabic on a phone. */
const ARABIC_PHONE_SIZE = `calc(${spacingVars['--spacing-5']} - ${borderVars['--border-width']})`
/** 13px: the note on a phone. */
const LINE_PHONE_SIZE = `calc(${textSizeVars['--font-size-base']} - ${borderVars['--border-width']})`
/** 170px: the widest the Arabic grows on a phone. */
const ARABIC_PHONE_WIDTH = `calc(3 * ${spacingVars['--spacing-12']} + ${spacingVars['--spacing-5']} + ${spacingVars['--spacing-1']} + ${spacingVars['--spacing-0-5']})`

const styles = stylex.create({
  /** The section's head sits a little in from the column. */
  head: {
    alignItems: { default: 'baseline', [PHONE]: 'center' },
    paddingInline: { default: spacingVars['--spacing-1'], [PHONE]: spacingVars['--spacing-2'] },
  },
  /** The section sits 12px under its head, 6px on a phone. */
  section: {
    rowGap: { default: spacingVars['--spacing-3'], [PHONE]: spacingVars['--spacing-1-5'] },
  },
  /** The title is 24px on a screen, 20px on a phone. */
  title: {
    fontSize: { default: spacingVars['--spacing-6'], [PHONE]: spacingVars['--spacing-5'] },
    lineHeight: 'normal',
  },
  /** "View all" is a 44px-tall target on a phone. */
  viewAll: {
    textDecoration: 'none',
    display: { default: null, [PHONE]: 'inline-flex' },
    alignItems: { default: null, [PHONE]: 'center' },
    minHeight: { default: null, [PHONE]: spacingVars['--spacing-11'] },
  },
  /** The rows sit 4px apart, 2px on a phone. */
  list: { rowGap: { default: spacingVars['--spacing-1'], [PHONE]: spacingVars['--spacing-0-5'] } },
  /** A row turns into a white card under a mouse. */
  row: {
    paddingBlock: { default: SPACE_18, [PHONE]: spacingVars['--spacing-3'] },
    paddingInline: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-3'] },
    borderRadius: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-4'] },
    columnGap: spacingVars['--spacing-6'],
    backgroundColor: {
      default: 'transparent',
      ':hover': { default: null, [HOVER]: colorVars['--color-background-card'] },
    },
    boxShadow: {
      default: 'none',
      ':hover': { default: null, [HOVER]: shadowVars['--shadow-low'] },
    },
    transitionProperty: { default: 'background-color, box-shadow', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: easeVars['--ease-entrance'],
  },
  /**
   * The reference and the note sit in one column with the Arabic beside them,
   * centered on both; on a phone the Arabic shares the reference's line and
   * the note runs the full width under both.
   */
  inner: {
    display: 'grid',
    width: '100%',
    alignItems: 'center',
    gridTemplateColumns: 'minmax(0, 1fr) fit-content(50%)',
    columnGap: { default: spacingVars['--spacing-6'], [PHONE]: spacingVars['--spacing-3'] },
    rowGap: { default: SPACE_3, [PHONE]: spacingVars['--spacing-1-5'] },
  },
  reference: {
    gridColumn: '1',
    gridRow: '1',
    minWidth: 0,
    fontSize: { default: TITLE_SIZE, [PHONE]: textSizeVars['--font-size-base'] },
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 'normal',
  },
  line: {
    gridColumn: { default: '1', [PHONE]: '1 / -1' },
    gridRow: '2',
    minWidth: 0,
    fontSize: { default: null, [PHONE]: LINE_PHONE_SIZE },
    display: 'block',
    lineHeight: 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  /** The Arabic keeps to one line, and is smaller on a phone. */
  arabic: {
    fontSize: { default: ARABIC_SIZE, [PHONE]: ARABIC_PHONE_SIZE },
    lineHeight: { default: 1.6, [PHONE]: 1.5 },
    whiteSpace: 'nowrap',
    display: 'block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  /** A long Ayah gives the title at most half the row's width. */
  arabicBox: {
    display: 'block',
    gridColumn: '2',
    gridRow: { default: '1 / span 2', [PHONE]: '1' },
    minWidth: 0,
    maxWidth: { default: '100%', [PHONE]: ARABIC_PHONE_WIDTH },
    overflow: 'hidden',
  },
})

/**
 * The reader's newest Bookmarks, each linking to its Ayah with its note (or
 * its translation) and its Arabic, and a "View all" link to the bookmarks
 * list. With none, it explains how to bookmark an Ayah.
 */
export default function RecentBookmarks({
  bookmarks,
}: {
  bookmarks: Data.Bookmark.Variants['forRow'][]
}) {
  return (
    <VStack xstyle={[styles.section, entranceStyles.fadeUp, ENTRANCE_DELAYS[3]]}>
      <HStack gap={3} hAlign="between" xstyle={styles.head}>
        <Heading level={2} weight="medium" xstyle={styles.title}>
          Recent bookmarks
        </Heading>
        {bookmarks.length > 0 && (
          <Link href={urlFor('bookmarks.index')} weight="medium" xstyle={styles.viewAll}>
            View all
          </Link>
        )}
      </HStack>
      {bookmarks.length === 0 ? (
        <EmptyState
          headingLevel={3}
          icon={<Icon icon={BookmarkIcon} size="lg" />}
          title="No bookmarks yet"
          description="While you read, select the bookmark button beside an Ayah's reference to keep it here, with a note if you like."
        />
      ) : (
        <List edge="flush" aria-label="Recent bookmarks" xstyle={styles.list}>
          {bookmarks.map((bookmark) => {
            const line = bookmark.note ?? bookmark.text?.english

            return (
              <ListItem
                key={bookmark.id}
                xstyle={styles.row}
                label={
                  <Stack xstyle={styles.inner}>
                    <Text type="body" xstyle={styles.reference}>
                      {bookmark.title}
                    </Text>
                    {line && (
                      <Text type="body" color="secondary" xstyle={styles.line}>
                        {line}
                      </Text>
                    )}
                    {bookmark.text && (
                      <Stack xstyle={styles.arabicBox}>
                        <ArabicText xstyle={styles.arabic}>{bookmark.text.arabic}</ArabicText>
                      </Stack>
                    )}
                  </Stack>
                }
                href={urlFor(
                  'surahs.show',
                  { number: bookmark.surahNumber },
                  { qs: { ayah: bookmark.ayahNumber } }
                )}
              />
            )
          })}
        </List>
      )}
    </VStack>
  )
}
