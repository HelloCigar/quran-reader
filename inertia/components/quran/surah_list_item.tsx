import * as stylex from '@stylexjs/stylex'
import { ListItem } from '@astryxdesign/core/List'
import { HStack } from '@astryxdesign/core/HStack'
import { Stack } from '@astryxdesign/core/Stack'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import {
  colorVars,
  durationVars,
  easeVars,
  borderVars,
  fontWeightVars,
  shadowVars,
  spacingVars,
  textSizeVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import ArabicText from '~/components/quran/arabic_text'
import { ENTRANCE_DELAYS, entranceStyles } from '~/components/quran/entrance_styles'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const PHONE = '@media (max-width: 600px)'
/** The star and the chevron settle with a little overshoot. */
const SPRING = 'cubic-bezier(0.34, 1.4, 0.5, 1)'
const SPRING_FIRM = 'cubic-bezier(0.34, 1.5, 0.5, 1)'

/** Sizes the scales have no stop for, built from their stops. */
const SPACE_10 = `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`
const SPACE_14 = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
const LIFT = `calc(-1 * ${borderVars['--border-width']})`
const NAME_SIZE = `calc(${textSizeVars['--font-size-lg']} + ${spacingVars['--spacing-0-5']})`
const DETAIL_SIZE = `calc((${textSizeVars['--font-size-sm']} + ${textSizeVars['--font-size-base']}) / 2)`

const styles = stylex.create({
  /**
   * A row is a roomy target: on hover it turns into a card, lifts a pixel,
   * the star turns and goes green and the chevron slides in. The row sets the
   * variables that its star and chevron read, so one `:hover` drives all of
   * them. Only colours, shadow and transforms change: the row keeps its size.
   */
  row: {
    paddingBlock: { default: spacingVars['--spacing-4'], [PHONE]: SPACE_10 },
    paddingInline: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-3'] },
    borderRadius: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-4'] },
    columnGap: { default: spacingVars['--spacing-5'], [PHONE]: SPACE_14 },
    backgroundColor: {
      default: 'transparent',
      ':hover': { default: null, '@media (hover: hover)': colorVars['--color-background-card'] },
    },
    boxShadow: {
      default: 'none',
      ':hover': { default: null, '@media (hover: hover)': shadowVars['--shadow-low'] },
    },
    transform: {
      default: 'none',
      ':hover': { default: null, '@media (hover: hover)': `translateY(${LIFT})` },
    },
    transitionProperty: {
      default: 'background-color, box-shadow, transform',
      [REDUCED_MOTION]: 'none',
    },
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: easeVars['--ease-entrance'],
    '--surah-star-color': {
      default: `color-mix(in srgb, ${colorVars['--color-text-primary']} 22%, transparent)`,
      ':hover': { default: null, '@media (hover: hover)': colorVars['--color-text-accent'] },
    },
    '--surah-star-turn': {
      default: '0deg',
      ':hover': { default: null, '@media (hover: hover)': '22.5deg' },
    },
    '--surah-chevron-opacity': {
      default: 0,
      ':hover': { default: null, '@media (hover: hover)': 1 },
    },
    '--surah-chevron-shift': {
      default: `calc(-1 * ${spacingVars['--spacing-1-5']})`,
      ':hover': { default: null, '@media (hover: hover)': '0px' },
    },
  },
  /** The 8-point star behind the number: 44px, 36px on a phone. */
  badge: {
    position: 'relative',
    width: { default: spacingVars['--spacing-11'], [PHONE]: spacingVars['--spacing-9'] },
    height: { default: spacingVars['--spacing-11'], [PHONE]: spacingVars['--spacing-9'] },
    flexShrink: 0,
  },
  star: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    color: 'var(--surah-star-color)',
    transform: 'rotate(var(--surah-star-turn))',
    transitionProperty: { default: 'color, transform', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: SPRING,
  },
  number: {
    position: 'relative',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontVariantNumeric: 'tabular-nums',
  },
  name: {
    fontFamily: typographyVars['--font-family-heading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    fontSize: { default: NAME_SIZE, [PHONE]: spacingVars['--spacing-4'] },
    lineHeight: 'normal',
  },
  /** The line under the name: it gives way to the Arabic name on a phone, with an ellipsis. */
  texts: {
    rowGap: { default: spacingVars['--spacing-0-5'], [PHONE]: borderVars['--border-width'] },
    minWidth: 0,
  },
  detail: {
    display: 'block',
    fontSize: { default: DETAIL_SIZE, [PHONE]: textSizeVars['--font-size-sm'] },
    lineHeight: 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevron: {
    opacity: 'var(--surah-chevron-opacity)',
    transform: 'translateX(var(--surah-chevron-shift))',
    color: colorVars['--color-text-accent'],
    transitionProperty: { default: 'opacity, transform', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: SPRING_FIRM,
    display: { default: 'inline-flex', [PHONE]: 'none' },
  },
  /** Where a Surah was revealed is left out on a phone, to leave room for the name. */
  revelation: { display: { default: null, [PHONE]: 'none' } },
  /** The Arabic name keeps a line of its own height, so it does not stretch the row; it is smaller on a phone. */
  arabic: {
    lineHeight: 1.4,
    fontSize: { default: null, [PHONE]: textSizeVars['--font-size-xl'] },
  },
})

/** The eight-point star behind a surah's number. */
function Star() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      {...stylex.props(styles.star)}
    >
      <path d="M12 2.1 14.9 5H19v4.1l2.9 2.9-2.9 2.9V19h-4.1L12 21.9 9.1 19H5v-4.1L2.1 12 5 9.1V5h4.1z" />
    </svg>
  )
}

/**
 * One surah row in the surah list: its number on a star, its name, its
 * meaning, where it was revealed and its ayah count, and its Arabic name,
 * linking to the surah. `entranceOrder` is the row's place in the staggered
 * entrance of the first screenful, `null` for a row that has none.
 */
export default function SurahListItem({
  surah,
  entranceOrder = null,
}: {
  surah: Data.Surah.Variants['forIndex']
  entranceOrder?: number | null
}) {
  return (
    <ListItem
      xstyle={[
        styles.row,
        entranceOrder !== null && ENTRANCE_DELAYS[entranceOrder] && entranceStyles.fadeUp,
        entranceOrder !== null && ENTRANCE_DELAYS[entranceOrder],
      ]}
      startContent={
        <Stack hAlign="center" vAlign="center" xstyle={styles.badge}>
          <Star />
          <Text type="supporting" color="primary" xstyle={styles.number}>
            {surah.number}
          </Text>
        </Stack>
      }
      label={
        <VStack xstyle={styles.texts}>
          <Text type="large" xstyle={styles.name}>
            {surah.name}
          </Text>
          <Text type="supporting" xstyle={styles.detail}>
            {surah.meaning}
            <Text type="inherit" color="inherit" xstyle={styles.revelation}>
              {` · ${surah.revelation}`}
            </Text>
            {` · ${surah.ayahCount.formatted}`}
          </Text>
        </VStack>
      }
      endContent={
        <HStack vAlign="center" gap={5}>
          <ArabicText xstyle={styles.arabic}>{surah.arabicName}</ArabicText>
          <Icon icon={ChevronRightIcon} size="md" xstyle={styles.chevron} />
        </HStack>
      }
      href={urlFor('surahs.show', { number: surah.number })}
    />
  )
}
