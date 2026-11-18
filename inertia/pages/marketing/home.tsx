import { useState, type ComponentProps } from 'react'
import * as stylex from '@stylexjs/stylex'
import { Head } from '@inertiajs/react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import {
  borderVars,
  colorVars,
  durationVars,
  radiusVars,
  spacingVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Tooltip } from '@astryxdesign/core/Tooltip'
import { urlFor } from '~/client'
import AppLayout from '~/components/app/app_layout'
import QuranCredit from '~/components/quran/quran_credit'
import useIsPhone from '~/components/navigation/use_is_phone'
import { entranceStyles } from '~/components/quran/entrance_styles'

/** The widest the page is, 1040px. */
const PAGE_MAX_WIDTH = 1040
/** The widest the headline and its text run, 720px. */
const HERO_MAX_WIDTH = 720
/** The widest the sample Ayah card is, 760px. */
const CARD_MAX_WIDTH = 760

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
/** The phone breakpoint the other pages use (`page_layout.tsx`). */
const PHONE = '@media (max-width: 600px)'

/** Sizes the spacing scale has no stop for, built from its stops. */
const SPACE_56 = `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-2']})`
const SPACE_52 = `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-1']})`
const SPACE_22 = `calc(${spacingVars['--spacing-5']} + ${spacingVars['--spacing-0-5']})`
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`
const SPACE_14 = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
/** The 18px icon of a phone's button, drawn 1.8px thick. */
const STROKE = `calc(1.8 * ${borderVars['--border-width']})`

/** A hairline ring in the text colour, the way the secondary button is outlined. */
const ring = (percent: number) =>
  `0 0 0 ${borderVars['--border-width']} color-mix(in srgb, ${colorVars['--color-text-primary']} ${percent}%, transparent)`

/** The first Ayah of the Quran, word by word, as the reading page shows it. */
const SAMPLE_WORDS = [
  { arabic: 'بِسْمِ', meaning: 'In (the) name', transliteration: 'bismi' },
  { arabic: 'ٱللَّهِ', meaning: '(of) Allah', transliteration: 'allāhi' },
  { arabic: 'ٱلرَّحْمَٰنِ', meaning: 'the Most Gracious', transliteration: 'l-raḥmāni' },
  { arabic: 'ٱلرَّحِيمِ', meaning: 'the Most Merciful', transliteration: 'l-raḥīmi' },
]

/** The Word a phone's card has selected when it opens. */
const FIRST_SELECTED_WORD = 1

const styles = stylex.create({
  /**
   * One centred column, with plenty of air above the headline and below the
   * card: 88px above and 56px between on a screen. On a phone it is left
   * aligned, fills the screen under the bar, and has 36px above (92px from the
   * screen's top), 32px below, 20px to each side and 14px between its parts,
   * which the card and the buttons set further apart by their own margins.
   */
  page: {
    marginInline: 'auto',
    boxSizing: 'border-box',
    alignItems: { default: 'center', [PHONE]: 'stretch' },
    minHeight: { default: null, [PHONE]: `calc(100dvh - ${SPACE_56})` },
    paddingBlockStart: { default: '5.5rem', [PHONE]: spacingVars['--spacing-9'] },
    paddingBlockEnd: { default: '6rem', [PHONE]: spacingVars['--spacing-8'] },
    paddingInline: { default: spacingVars['--spacing-6'], [PHONE]: spacingVars['--spacing-5'] },
    textAlign: { default: 'center', [PHONE]: 'start' },
    rowGap: { default: '3.5rem', [PHONE]: SPACE_14 },
  },
  /**
   * On a phone the hero's parts are the page's own, so the buttons can leave
   * it and drop to the foot of the screen.
   */
  hero: {
    display: { default: null, [PHONE]: 'contents' },
  },
  eyebrow: {
    fontWeight: 600,
    letterSpacing: '0.08em',
    lineHeight: 'normal',
    textTransform: 'uppercase',
    animationDelay: { default: '120ms', [PHONE]: '80ms' },
  },
  /** 64px on a screen; 40px on a phone, the same step down as the other pages' titles. */
  headline: {
    fontSize: { default: '4rem', [PHONE]: '2.5rem' },
    lineHeight: { default: 1.05, [PHONE]: 1.08 },
    letterSpacing: '-0.03em',
    animationDelay: { default: '180ms', [PHONE]: '140ms' },
  },
  lead: {
    fontSize: { default: '1.125rem', [PHONE]: '1rem' },
    lineHeight: { default: 1.6, [PHONE]: 1.55 },
    animationDelay: { default: '240ms', [PHONE]: '200ms' },
  },
  /**
   * 10px between the buttons, beside each other or, when they wrap, one above
   * the other. On a phone they are one column, across the width, at the
   * screen's foot, after the credit.
   */
  actions: {
    columnGap: '0.625rem',
    rowGap: '0.625rem',
    marginBlockStart: { default: spacingVars['--spacing-2'], [PHONE]: 'auto' },
    flexDirection: { default: null, [PHONE]: 'column' },
    alignItems: { default: null, [PHONE]: 'stretch' },
    order: { default: null, [PHONE]: 2 },
    animationDelay: { default: '300ms', [PHONE]: '400ms' },
  },
  /** A pill button: it dims up on hover and gives a little under a press. */
  button: {
    height: { default: '3rem', [PHONE]: SPACE_52 },
    minHeight: { default: '3rem', [PHONE]: SPACE_52 },
    borderRadius: radiusVars['--radius-full'],
    paddingInline: { default: '1.375rem', [PHONE]: spacingVars['--spacing-0'] },
    fontSize: { default: null, [PHONE]: '1rem' },
    fontWeight: { default: null, [PHONE]: 600 },
    transform: {
      default: 'scale(1)',
      ':active': { default: 'scale(0.97)', [REDUCED_MOTION]: 'scale(1)' },
    },
    transitionProperty: { default: 'transform, filter', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
    filter: { default: 'none', ':hover': 'brightness(1.06)' },
  },
  /** The secondary pill is white with a ring. */
  buttonSecondary: {
    backgroundColor: colorVars['--color-background-card'],
    boxShadow: { default: ring(12), [PHONE]: ring(10) },
  },
  /** The icon in a phone's button is 18px, drawn with a 1.8px stroke. */
  buttonIcon: {
    width: { default: null, [PHONE]: SPACE_18 },
    height: { default: null, [PHONE]: SPACE_18 },
    strokeWidth: { default: null, [PHONE]: STROKE },
  },
  /** The sample card: white, rounded, ringed, with a long soft shadow under it. */
  card: {
    boxSizing: 'border-box',
    rowGap: { default: '0.875rem', [PHONE]: spacingVars['--spacing-3'] },
    marginBlockStart: { default: 0, [PHONE]: SPACE_18 },
    marginBlockEnd: 0,
    marginInline: 0,
    paddingBlockStart: { default: spacingVars['--spacing-10'], [PHONE]: SPACE_22 },
    paddingBlockEnd: { default: spacingVars['--spacing-8'], [PHONE]: SPACE_18 },
    paddingInline: { default: spacingVars['--spacing-8'], [PHONE]: spacingVars['--spacing-4'] },
    borderRadius: { default: '1.75rem', [PHONE]: '1.5rem' },
    backgroundColor: colorVars['--color-background-card'],
    boxShadow:
      `0 0 0 ${borderVars['--border-width']} color-mix(in srgb, ${colorVars['--color-text-primary']} 5%, transparent), ` +
      `0 1.5rem 3.5rem -2rem color-mix(in srgb, ${colorVars['--color-text-primary']} 35%, transparent)`,
    animationDelay: { default: '420ms', [PHONE]: '300ms' },
  },
  /**
   * The Words run right to left, wrapping with 6px between lines and 10px
   * between Words; on a phone, 2px and 4px.
   */
  words: {
    columnGap: { default: '0.625rem', [PHONE]: spacingVars['--spacing-1'] },
    rowGap: { default: '0.375rem', [PHONE]: spacingVars['--spacing-0-5'] },
  },
  word: {
    font: 'inherit',
    color: {
      default: colorVars['--color-text-primary'],
      ':hover': colorVars['--color-text-accent'],
      ':focus-visible': colorVars['--color-text-accent'],
    },
    height: 'auto',
    minHeight: 0,
    paddingBlock: spacingVars['--spacing-0'],
    paddingInline: { default: '0.625rem', [PHONE]: spacingVars['--spacing-2'] },
    borderRadius: { default: '0.875rem', [PHONE]: '0.75rem' },
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${colorVars['--color-accent']} 8%, transparent)`,
      ':focus-visible': `color-mix(in srgb, ${colorVars['--color-accent']} 8%, transparent)`,
    },
    transitionProperty: { default: 'color, background-color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
  },
  /** The Word a phone's card has selected is tinted and green. */
  wordSelected: {
    color: colorVars['--color-text-accent'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-accent']} 10%, transparent)`,
  },
  /** 40px on a screen, 30px on a phone. */
  arabic: {
    fontSize: {
      default: '2.5rem',
      [PHONE]: `calc(${spacingVars['--spacing-8']} - ${spacingVars['--spacing-0-5']})`,
    },
    lineHeight: 1.8,
  },
  caption: {
    lineHeight: { default: null, [PHONE]: 1.5 },
  },
  sampleRef: { color: colorVars['--color-text-accent'] },
  tipTitle: { fontWeight: 600 },
  tipTranslit: { fontStyle: 'italic' },
  /** What a phone shows in place of a Word's tooltip: the selected Word's meaning, in a green-tinted box. */
  status: {
    justifyContent: 'space-between',
    columnGap: spacingVars['--spacing-3'],
    paddingBlock: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
    paddingInline: SPACE_14,
    borderRadius: SPACE_14,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-accent']} 7%, transparent)`,
    textAlign: 'start',
  },
  statusLines: { rowGap: borderVars['--border-width'] },
  statusMeaning: { fontSize: SPACE_14, fontWeight: 600, lineHeight: 'normal' },
  statusTranslit: {
    fontSize: `calc((${textSizeVars['--font-size-sm']} + ${textSizeVars['--font-size-base']}) / 2)`,
    fontStyle: 'italic',
    lineHeight: 'normal',
  },
  statusHint: { fontSize: spacingVars['--spacing-3'], lineHeight: 'normal' },
  /** The credit sits under the card on a phone, with the buttons 32px below it. */
  credit: {
    order: { default: null, [PHONE]: 1 },
    marginBlockEnd: { default: null, [PHONE]: SPACE_18 },
  },
})

/** A pill of the home page: primary (green) or secondary (white), 48px tall, 52px across a phone. */
function HomeButton({
  variant = 'primary',
  ...props
}: Omit<ComponentProps<typeof Button>, 'size' | 'xstyle' | 'variant'> & {
  variant?: 'primary' | 'secondary'
}) {
  return (
    <Button
      size="lg"
      variant={variant}
      xstyle={[styles.button, variant === 'secondary' && styles.buttonSecondary]}
      {...props}
    />
  )
}

/**
 * The home page for a signed-out visitor: a headline, the two ways in, and
 * a sample card with the first Ayah, word by word, to show what the reader
 * does. It sits in the app layout, whose bar shows the signed-out actions.
 *
 * Responsive contract. Wide: the text is centred, the buttons sit under it,
 * and a Word shows its meaning in a tooltip. Phone (up to 600px): the text is
 * left aligned and fills the screen; a tap selects a Word, whose meaning shows
 * in a box under the Words in place of the tooltip; the card is followed by
 * the credit, and the two buttons fill the width at the foot of the screen.
 */
export default function Home() {
  const isPhone = useIsPhone()
  const [selected, setSelected] = useState(FIRST_SELECTED_WORD)
  const word = SAMPLE_WORDS[selected]

  return (
    <Layout
      height="auto"
      content={
        <LayoutContent padding={0}>
          <Head title="Welcome" />
          <VStack maxWidth={PAGE_MAX_WIDTH} xstyle={styles.page}>
            <VStack gap={5} hAlign="center" maxWidth={HERO_MAX_WIDTH} xstyle={styles.hero}>
              <Text
                as="p"
                type="supporting"
                size="sm"
                color="accent"
                xstyle={[styles.eyebrow, entranceStyles.fadeUp]}
              >
                Quran Reader
              </Text>
              <Heading
                level={1}
                type="display-1"
                weight="medium"
                xstyle={[styles.headline, entranceStyles.fadeUp]}
              >
                Read the Quran, word by word.
              </Heading>
              <Text
                as="p"
                type="body"
                color="secondary"
                xstyle={[styles.lead, entranceStyles.fadeUp]}
              >
                Every Ayah in Arabic with its English translation. {isPhone ? 'Tap' : 'Open'} any
                word for its meaning, listen as the recitation follows the text, and keep your place
                with bookmarks and notes.
              </Text>
              <HStack wrap="wrap" hAlign="center" xstyle={[styles.actions, entranceStyles.fadeUp]}>
                <HomeButton
                  label="Read the Quran"
                  href={urlFor('surahs.index')}
                  icon={
                    <Icon
                      icon={BookOpenIcon}
                      size="sm"
                      color="inherit"
                      xstyle={styles.buttonIcon}
                    />
                  }
                />
                <HomeButton
                  label="Create an account"
                  href={urlFor('new_account.create')}
                  variant="secondary"
                />
              </HStack>
            </VStack>

            <VStack
              as="figure"
              hAlign="stretch"
              width="100%"
              maxWidth={CARD_MAX_WIDTH}
              xstyle={[styles.card, entranceStyles.fadeUp]}
            >
              <HStack dir="rtl" wrap="wrap" hAlign="center" xstyle={styles.words}>
                {SAMPLE_WORDS.map((sample, index) => (
                  <Tooltip
                    key={sample.arabic}
                    delay={0}
                    hasHoverIndication={false}
                    isEnabled={!isPhone}
                    content={
                      <VStack gap={0.5}>
                        <Text type="supporting" color="inherit" xstyle={styles.tipTitle}>
                          {sample.meaning}
                        </Text>
                        <Text type="supporting" color="inherit" xstyle={styles.tipTranslit}>
                          {sample.transliteration}
                        </Text>
                      </VStack>
                    }
                  >
                    <Button
                      variant="ghost"
                      label={sample.arabic}
                      aria-pressed={isPhone ? index === selected : undefined}
                      onClick={() => setSelected(index)}
                      xstyle={[styles.word, isPhone && index === selected && styles.wordSelected]}
                    >
                      <Text type="arabic" color="inherit" xstyle={styles.arabic}>
                        <span lang="ar">{sample.arabic}</span>
                      </Text>
                    </Button>
                  </Tooltip>
                ))}
              </HStack>
              {isPhone && (
                <HStack role="status" vAlign="center" xstyle={styles.status}>
                  <VStack xstyle={styles.statusLines}>
                    <Text as="span" type="supporting" xstyle={styles.statusMeaning}>
                      {word.meaning}
                    </Text>
                    <Text
                      as="span"
                      type="supporting"
                      color="secondary"
                      xstyle={styles.statusTranslit}
                    >
                      {word.transliteration}
                    </Text>
                  </VStack>
                  <Text as="span" type="supporting" color="secondary" xstyle={styles.statusHint}>
                    Tap a word
                  </Text>
                </HStack>
              )}
              <Text as="p" type="body" color="secondary" xstyle={styles.caption}>
                In the name of Allah, the Entirely Merciful, the Especially Merciful.{' '}
                <Text weight="semibold" color="inherit" xstyle={styles.sampleRef}>
                  1:1
                </Text>
              </Text>
            </VStack>

            <Stack xstyle={styles.credit}>
              <QuranCredit align="center" />
            </Stack>
          </VStack>
        </LayoutContent>
      }
    />
  )
}

Home.layout = [AppLayout]
