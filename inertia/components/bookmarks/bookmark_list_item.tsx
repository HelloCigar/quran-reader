import * as stylex from '@stylexjs/stylex'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ListItem } from '@astryxdesign/core/List'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Text } from '@astryxdesign/core/Text'
import { Link } from '@astryxdesign/core/Link'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import {
  borderVars,
  colorVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import ArabicText from '~/components/quran/arabic_text'
import { ENTRANCE_DELAYS, entranceStyles } from '~/components/quran/entrance_styles'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const HOVER = '@media (hover: hover)'
const PHONE = '@media (max-width: 600px)'
/** The actions spring back with a little overshoot. */
const SPRING = 'cubic-bezier(0.34, 1.5, 0.5, 1)'

/** Sizes the scales have no stop for, built from their stops. */
const SPACE_14 = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
const REF_SIZE = `calc(${textSizeVars['--font-size-base']} + ${borderVars['--border-width']})`
const ACTION_SIZE = `calc(${textSizeVars['--font-size-base']} - ${borderVars['--border-width']})`
const ARABIC_SIZE = `calc(${spacingVars['--spacing-6']} + ${spacingVars['--spacing-0-5']})`
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`
const SPACE_10 = `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`
/** 22px: the Arabic on a phone. */
const ARABIC_PHONE_SIZE = `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`
/** 13px: the note on a phone. */
const NOTE_PHONE_SIZE = `calc(${textSizeVars['--font-size-base']} - ${borderVars['--border-width']})`
/** How long the exit takes: `LEAVE_MS` of `use_leaving_rows.ts`, which StyleX cannot import. */
const LEAVE = '380ms'
const GAP = spacingVars['--spacing-3']
/** The cards sit 10px apart on a phone (`styles.list` of the bookmarks page). */
const GAP_PHONE = SPACE_10

const RING = `0 0 0 ${borderVars['--border-width']} ${colorVars['--color-border']}`
const LIFTED = `${RING}, 0 ${spacingVars['--spacing-4']} ${spacingVars['--spacing-9']} calc(-1 * ${spacingVars['--spacing-5']} - ${borderVars['--border-width']}) color-mix(in srgb, ${colorVars['--color-text-primary']} 32%, transparent)`

/** 420px: taller than any card, so a card's height can ease from it to nothing as it leaves. */
const LEAVE_FROM_HEIGHT = `calc(105 * ${spacingVars['--spacing-1']})`

const leave = stylex.keyframes({
  from: { opacity: 1, transform: 'none', maxHeight: LEAVE_FROM_HEIGHT },
  to: {
    opacity: 0,
    transform: `translateX(${spacingVars['--spacing-6']}) scale(0.98)`,
    maxHeight: 0,
    paddingBlock: 0,
    marginBlockStart: `calc(-1 * ${GAP})`,
  },
})

const leavePhone = stylex.keyframes({
  from: { opacity: 1, transform: 'none', maxHeight: LEAVE_FROM_HEIGHT },
  to: {
    opacity: 0,
    transform: `translateX(${spacingVars['--spacing-6']}) scale(0.98)`,
    maxHeight: 0,
    paddingBlock: 0,
    marginBlockStart: `calc(-1 * ${GAP_PHONE})`,
  },
})

const styles = stylex.create({
  /** A bookmark is a white card on the page, held by a faint ring; its shadow deepens under a mouse. */
  card: {
    paddingBlockStart: { default: spacingVars['--spacing-6'], [PHONE]: SPACE_14 },
    paddingBlockEnd: { default: spacingVars['--spacing-6'], [PHONE]: spacingVars['--spacing-4'] },
    paddingInline: { default: spacingVars['--spacing-7'], [PHONE]: spacingVars['--spacing-4'] },
    borderRadius: { default: spacingVars['--spacing-6'], [PHONE]: spacingVars['--spacing-5'] },
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: {
      default: RING,
      ':hover': { default: null, [HOVER]: LIFTED },
    },
    transitionProperty: { default: 'box-shadow', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium-min'],
  },
  /** A removed bookmark slides off and folds away, and the cards below close up. */
  leaving: {
    overflow: 'hidden',
    pointerEvents: 'none',
    animationName: {
      default: leave,
      [PHONE]: leavePhone,
      [REDUCED_MOTION]: 'none',
    },
    animationDuration: LEAVE,
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationFillMode: 'both',
  },
  body: { width: '100%', rowGap: { default: spacingVars['--spacing-4'], [PHONE]: SPACE_10 } },
  header: {
    columnGap: { default: spacingVars['--spacing-4'], [PHONE]: spacingVars['--spacing-2'] },
    rowGap: spacingVars['--spacing-2'],
  },
  reference: {
    fontSize: { default: REF_SIZE, [PHONE]: textSizeVars['--font-size-base'] },
    lineHeight: 'normal',
    textDecoration: 'none',
  },
  /** On a phone the 44px actions pull 8px into the card's padding, so their icons line up with its text. */
  actions: {
    columnGap: { default: spacingVars['--spacing-1'], [PHONE]: 0 },
    marginInlineEnd: { default: null, [PHONE]: `calc(-1 * ${spacingVars['--spacing-2']})` },
  },
  /** The icon is 16px on a screen, 18px on a phone. */
  actionIcon: {
    width: { default: null, [PHONE]: SPACE_18 },
    height: { default: null, [PHONE]: SPACE_18 },
  },
  /** An action's text is hidden on a phone, where the button is just its icon. */
  actionLabel: { display: { default: null, [PHONE]: 'none' } },
  /**
   * A quiet 36px pill: it tints under a mouse and gives under a press. On a
   * phone it is a 44px round icon button.
   */
  action: {
    height: { default: spacingVars['--spacing-9'], [PHONE]: spacingVars['--spacing-11'] },
    minHeight: { default: spacingVars['--spacing-9'], [PHONE]: spacingVars['--spacing-11'] },
    width: { default: null, [PHONE]: spacingVars['--spacing-11'] },
    paddingInline: { default: spacingVars['--spacing-3'], [PHONE]: 0 },
    columnGap: { default: spacingVars['--spacing-1-5'], [PHONE]: 0 },
    borderRadius: radiusVars['--radius-full'],
    fontSize: ACTION_SIZE,
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover': { default: null, [HOVER]: colorVars['--color-text-primary'] },
    },
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        default: null,
        [HOVER]: `color-mix(in srgb, ${colorVars['--color-text-primary']} 6%, transparent)`,
      },
    },
    transform: { default: 'none', ':active': { default: 'scale(0.94)', [PHONE]: 'scale(0.86)' } },
    transitionProperty: {
      default: 'background-color, color, transform',
      [REDUCED_MOTION]: 'none',
    },
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: SPRING,
  },
  arabic: {
    fontSize: { default: ARABIC_SIZE, [PHONE]: ARABIC_PHONE_SIZE },
    lineHeight: { default: 2, [PHONE]: 1.9 },
  },
  english: {
    fontSize: { default: REF_SIZE, [PHONE]: textSizeVars['--font-size-base'] },
    lineHeight: { default: 1.6, [PHONE]: 1.55 },
  },
  /** The note sits in a green-tinted box. */
  note: {
    paddingBlock: { default: spacingVars['--spacing-3'], [PHONE]: SPACE_10 },
    paddingInline: { default: spacingVars['--spacing-4'], [PHONE]: spacingVars['--spacing-3'] },
    borderRadius: { default: SPACE_14, [PHONE]: spacingVars['--spacing-3'] },
    fontSize: { default: null, [PHONE]: NOTE_PHONE_SIZE },
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-accent']} 7%, transparent)`,
    lineHeight: 1.5,
  },
})

/**
 * One bookmark in the bookmarks list, as a card: "2:255 · Al-Baqarah" linking
 * to the ayah, with its note and remove actions on the same row, then its
 * Arabic and English (or a line saying the text couldn't be loaded) and the
 * note. `entranceOrder` is the card's place in the staggered entrance of the
 * first cards, `null` for one that has none; a `leaving` card plays its exit.
 */
export default function BookmarkListItem({
  bookmark,
  entranceOrder = null,
  leaving = false,
  onEditNote,
  onRemove,
}: {
  bookmark: Data.Bookmark.Variants['forRow']
  entranceOrder?: number | null
  leaving?: boolean
  onEditNote: () => void
  onRemove: () => void
}) {
  const hasNote = bookmark.note !== null
  const delay = entranceOrder === null ? undefined : ENTRANCE_DELAYS[entranceOrder + 1]

  return (
    <ListItem
      aria-hidden={leaving || undefined}
      xstyle={[styles.card, delay && entranceStyles.fadeUp, delay, leaving && styles.leaving]}
      label={
        <VStack xstyle={styles.body}>
          <HStack hAlign="between" vAlign="center" wrap="wrap" xstyle={styles.header}>
            <Link
              href={urlFor(
                'surahs.show',
                { number: bookmark.surahNumber },
                { qs: { ayah: bookmark.ayahNumber } }
              )}
              weight="semibold"
              color="primary"
              xstyle={styles.reference}
            >
              {bookmark.title}
            </Link>
            <HStack xstyle={styles.actions}>
              {/* The note dialog and the remove confirmation return focus to the element with this id. */}
              <Button
                id={`bookmark-menu-${bookmark.id}`}
                label={`${hasNote ? 'Edit note' : 'Add note'} on ${bookmark.reference}`}
                variant="ghost"
                icon={<Icon icon={PencilIcon} xstyle={styles.actionIcon} />}
                xstyle={styles.action}
                onClick={onEditNote}
              >
                <Text type="body" color="inherit" xstyle={styles.actionLabel}>
                  {hasNote ? 'Edit note' : 'Add note'}
                </Text>
              </Button>
              <Button
                label={`Remove bookmark ${bookmark.reference}`}
                variant="ghost"
                icon={<Icon icon={TrashIcon} xstyle={styles.actionIcon} />}
                xstyle={styles.action}
                onClick={onRemove}
              >
                <Text type="body" color="inherit" xstyle={styles.actionLabel}>
                  Remove
                </Text>
              </Button>
            </HStack>
          </HStack>
          {bookmark.text ? (
            <>
              <ArabicText xstyle={styles.arabic}>{bookmark.text.arabic}</ArabicText>
              <Text type="body" color="secondary" xstyle={styles.english}>
                {bookmark.text.english}
              </Text>
            </>
          ) : (
            <Text type="supporting" color="secondary">
              The ayah text couldn&apos;t be loaded right now.
            </Text>
          )}
          {hasNote && (
            <Text type="body" color="primary" xstyle={styles.note}>
              {bookmark.note}
            </Text>
          )}
        </VStack>
      }
    />
  )
}
