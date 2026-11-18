import * as stylex from '@stylexjs/stylex'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Icon } from '@astryxdesign/core/Icon'
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
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
const PHONE = '@media (max-width: 600px)'
const HOVER = '@media (hover: hover)'
/** The arrow settles with a little overshoot. */
const SPRING = 'cubic-bezier(0.34, 1.5, 0.5, 1)'

/** Sizes the scales have no stop for, built from their stops. */
const SPACE_14 = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`
const SPACE_22 = `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`
const SPACE_3 = `calc(${spacingVars['--spacing-0-5']} + ${borderVars['--border-width']})`
/** 13px: the subtitle on a phone. */
const SUBTITLE_SIZE = `calc(${textSizeVars['--font-size-base']} - ${borderVars['--border-width']})`
/** 23px: the Arabic on a phone. */
const ARABIC_PHONE_SIZE = `calc(${spacingVars['--spacing-6']} - ${borderVars['--border-width']})`
const LIFT = `calc(-1 * ${spacingVars['--spacing-0-5']})`

const RING = `0 0 0 ${borderVars['--border-width']} ${colorVars['--color-border']}`
const SHADOW = `${RING}, 0 ${SPACE_14} ${spacingVars['--spacing-8']} calc(-1 * ${spacingVars['--spacing-5']}) color-mix(in srgb, ${colorVars['--color-text-primary']} 30%, transparent)`
const SHADOW_LIFTED = `${RING}, 0 ${SPACE_22} ${spacingVars['--spacing-11']} calc(-1 * ${SPACE_22}) color-mix(in srgb, ${colorVars['--color-text-primary']} 35%, transparent)`

const fill = stylex.keyframes({
  from: { transform: 'scaleX(0)' },
  to: { transform: 'scaleX(1)' },
})

const styles = stylex.create({
  /** The card: white on the page, held by a faint ring; it lifts under a mouse. */
  card: {
    borderRadius: spacingVars['--spacing-6'],
    boxShadow: {
      default: SHADOW,
      ':hover': { default: null, [HOVER]: SHADOW_LIFTED },
    },
    transform: {
      default: 'none',
      ':hover': { default: null, [HOVER]: `translateY(${LIFT})` },
    },
    transitionProperty: { default: 'box-shadow, transform', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: easeVars['--ease-entrance'],
  },
  body: {
    width: '100%',
    boxSizing: 'border-box',
    rowGap: { default: SPACE_22, [PHONE]: spacingVars['--spacing-4'] },
    paddingBlock: { default: spacingVars['--spacing-7'], [PHONE]: spacingVars['--spacing-5'] },
    paddingInline: { default: spacingVars['--spacing-8'], [PHONE]: spacingVars['--spacing-5'] },
  },
  top: {
    columnGap: { default: spacingVars['--spacing-6'], [PHONE]: spacingVars['--spacing-3'] },
    rowGap: spacingVars['--spacing-4'],
  },
  /** The label, the name and the subtitle sit 4px apart, 3px on a phone. */
  titles: { rowGap: { default: spacingVars['--spacing-1'], [PHONE]: SPACE_3 } },
  label: {
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    lineHeight: 'normal',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-accent'],
  },
  /** The name: 28px on a screen, 24px on a phone. */
  name: {
    fontSize: { default: spacingVars['--spacing-7'], [PHONE]: spacingVars['--spacing-6'] },
    letterSpacing: '-0.01em',
    lineHeight: 'normal',
  },
  subtitle: {
    fontSize: { default: null, [PHONE]: SUBTITLE_SIZE },
    lineHeight: 'normal',
  },
  /**
   * The green pill: it only looks like a button, the whole card is the link.
   * On a phone it is a 44px round button with just the arrow.
   */
  pill: {
    height: spacingVars['--spacing-11'],
    width: { default: null, [PHONE]: spacingVars['--spacing-11'] },
    boxSizing: 'border-box',
    paddingInline: { default: SPACE_18, [PHONE]: 0 },
    columnGap: spacingVars['--spacing-2'],
    justifyContent: { default: null, [PHONE]: 'center' },
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
    flexShrink: 0,
  },
  pillText: {
    display: { default: null, [PHONE]: 'none' },
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 'normal',
  },
  /** The arrow is 16px on a screen, 18px on a phone. */
  arrow: {
    width: { default: null, [PHONE]: SPACE_18 },
    height: { default: null, [PHONE]: SPACE_18 },
  },
  /** The arrow leans toward where the card goes, when the card is hovered. */
  go: {
    transform: {
      default: 'none',
      ':is([data-astryx-clickable-card]:hover *)': { default: null, [HOVER]: 'translateX(3px)' },
    },
    transitionProperty: { default: 'transform', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: SPRING,
  },
  arabic: {
    fontSize: { default: spacingVars['--spacing-7'], [PHONE]: ARABIC_PHONE_SIZE },
    lineHeight: 1.9,
  },
  progress: { columnGap: { default: SPACE_14, [PHONE]: spacingVars['--spacing-3'] } },
  track: {
    flexGrow: 1,
    height: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 8%, transparent)`,
    overflow: 'hidden',
  },
  /** The bar fills from the start when the card opens. */
  fill: (percent: number) => ({
    width: `${percent}%`,
    height: '100%',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent'],
    transformOrigin: 'left',
    animationName: { default: fill, [REDUCED_MOTION]: 'none' },
    animationDuration: '1.1s',
    animationTimingFunction: easeVars['--ease-entrance'],
    animationDelay: '450ms',
    animationFillMode: 'backwards',
  }),
  count: { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', lineHeight: 'normal' },
})

/**
 * The dashboard's main card. It opens the reader at the Reading Position, or
 * where a new reader starts: it names the Surah and the Ayah, shows the Ayah's
 * Arabic, and how far into the Surah the reader is.
 */
export default function ContinueReadingCard({
  continueReading,
}: {
  continueReading: Data.ReadingPosition.Variants['forContinuing']
}) {
  const { progress } = continueReading

  return (
    <ClickableCard
      label={continueReading.label}
      href={urlFor(
        'surahs.show',
        { number: continueReading.surahNumber },
        { qs: { ayah: continueReading.ayahNumber } }
      )}
      padding={0}
      xstyle={[styles.card, entranceStyles.fadeUp, ENTRANCE_DELAYS[2]]}
    >
      <VStack xstyle={styles.body}>
        <HStack hAlign="between" vAlign="start" wrap="wrap" xstyle={styles.top}>
          <VStack xstyle={styles.titles}>
            <Text type="supporting" as="p" xstyle={styles.label}>
              {continueReading.heading}
            </Text>
            <Heading level={2} weight="medium" xstyle={styles.name}>
              {continueReading.surahName}
            </Heading>
            <Text type="body" color="secondary" xstyle={styles.subtitle}>
              {continueReading.subtitle}
            </Text>
          </VStack>
          <HStack vAlign="center" xstyle={styles.pill}>
            <Text type="body" color="inherit" xstyle={styles.pillText}>
              {continueReading.heading === 'Start reading' ? 'Start' : 'Continue'}
            </Text>
            <Icon icon={ArrowRightIcon} size="sm" xstyle={[styles.arrow, styles.go]} />
          </HStack>
        </HStack>
        {continueReading.arabic && (
          <ArabicText xstyle={styles.arabic}>{continueReading.arabic}</ArabicText>
        )}
        {progress && (
          <HStack vAlign="center" xstyle={styles.progress}>
            <Stack aria-hidden="true" xstyle={styles.track}>
              <Stack xstyle={styles.fill(progress.percent)} />
            </Stack>
            <Text type="supporting" color="secondary" xstyle={styles.count}>
              {progress.label}
            </Text>
          </HStack>
        )}
      </VStack>
    </ClickableCard>
  )
}
