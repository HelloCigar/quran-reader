import * as stylex from '@stylexjs/stylex'
import { type ReactNode } from 'react'
import { colorVars, spacingVars, typographyVars } from '@astryxdesign/core/theme/tokens.stylex'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { Stack } from '@astryxdesign/core/Stack'
import { Icon } from '@astryxdesign/core/Icon'
import { Link } from '@astryxdesign/core/Link'
import { Text } from '@astryxdesign/core/Text'
import { urlFor } from '~/client'
import { QuranMark } from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'
import PasskeySignals from '~/components/auth/passkey_signals'
import { entranceStyles, ENTRANCE_DELAYS } from '~/components/quran/entrance_styles'

/** Phone: the auth pages' phone treatment applies up to 600px wide. */
const PHONE = '@media (max-width: 600px)'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** Sizes the spacing scale has no stop for, built from its stops. */
const SPACE_10 = `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`
const SPACE_26 = `calc(${spacingVars['--spacing-6']} + ${spacingVars['--spacing-0-5']})`
const SPACE_30 = `calc(${spacingVars['--spacing-7']} + ${spacingVars['--spacing-0-5']})`
/** The least a touch target is, 44px. */
const TOUCH_TARGET = '2.75rem'

/** The widest the form is, 380px. */
const FORM_WIDTH = 380
/** The widest the aside's text runs, 460px. */
const ASIDE_TEXT_WIDTH = 460

const turn = stylex.keyframes({
  to: { transform: 'rotate(360deg)' },
})

const styles = stylex.create({
  /** A standalone page has no app shell, so it paints the body itself. Wide: the aside and the form side by side; narrow: stacked. */
  page: {
    minHeight: '100dvh',
    backgroundColor: colorVars['--color-background-body'],
    flexDirection: { default: null, [PHONE]: 'column' },
    flexWrap: { default: null, [PHONE]: 'nowrap' },
  },
  /** The green aside: half the page wide, and at least 320px tall once it stacks above the form. */
  aside: {
    position: 'relative',
    flex: { default: '1 1 26.25rem', [PHONE]: '0 0 auto' },
    minHeight: { default: '20rem', [PHONE]: 0 },
    overflow: 'hidden',
    boxSizing: 'border-box',
    paddingBlockStart: { default: spacingVars['--spacing-10'], [PHONE]: SPACE_18 },
    paddingBlockEnd: { default: spacingVars['--spacing-10'], [PHONE]: SPACE_30 },
    paddingInline: { default: spacingVars['--spacing-12'], [PHONE]: spacingVars['--spacing-6'] },
    rowGap: { default: spacingVars['--spacing-10'], [PHONE]: spacingVars['--spacing-7'] },
    borderEndStartRadius: { default: null, [PHONE]: spacingVars['--spacing-7'] },
    borderEndEndRadius: { default: null, [PHONE]: spacingVars['--spacing-7'] },
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  /** The ornament sits off the bottom-right corner, 720px across (420px on a phone), and turns once every 90s. */
  ornament: {
    position: 'absolute',
    insetInlineEnd: { default: '-13.75rem', [PHONE]: '-10.625rem' },
    insetBlockEnd: { default: '-13.75rem', [PHONE]: '-11.875rem' },
    width: { default: '45rem', [PHONE]: '26.25rem' },
    height: { default: '45rem', [PHONE]: '26.25rem' },
    strokeWidth: { default: '0.12', [PHONE]: '0.14' },
    pointerEvents: 'none',
    color: `color-mix(in srgb, ${colorVars['--color-on-accent']} 12%, transparent)`,
    animationName: { default: turn, [REDUCED_MOTION]: 'none' },
    animationDuration: '90s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  /** Everything but the ornament sits above it. */
  above: {
    position: 'relative',
  },
  brand: {
    color: colorVars['--color-on-accent'],
    textDecoration: 'none',
  },
  /** The logo link is a touch target 44px tall on a phone. */
  brandLink: {
    display: { default: null, [PHONE]: 'flex' },
    alignItems: { default: null, [PHONE]: 'center' },
    minHeight: { default: null, [PHONE]: TOUCH_TARGET },
  },
  brandName: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: { default: '1.125rem', [PHONE]: '1.0625rem' },
    fontWeight: 600,
  },
  /** The Ayah, the headline and the copy stand 10px apart on a phone. */
  text: {
    rowGap: { default: spacingVars['--spacing-4'], [PHONE]: SPACE_10 },
  },
  ayah: {
    color: colorVars['--color-on-accent'],
    fontSize: { default: '2.125rem', [PHONE]: '1.625rem' },
    lineHeight: 1.8,
  },
  headline: {
    fontFamily: typographyVars['--font-family-heading'],
    fontWeight: 500,
    fontSize: { default: '2.5rem', [PHONE]: '1.875rem' },
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: colorVars['--color-on-accent'],
  },
  copy: {
    fontSize: { default: '1rem', [PHONE]: '0.875rem' },
    lineHeight: { default: 1.6, [PHONE]: 1.55 },
    color: {
      default: `color-mix(in srgb, ${colorVars['--color-on-accent']} 85%, transparent)`,
      [PHONE]: `color-mix(in srgb, ${colorVars['--color-on-accent']} 88%, transparent)`,
    },
  },
  /** The form column: the form is centred in it, and the theme toggle sits in its corner. */
  main: {
    position: 'relative',
    flex: { default: '1 1 26.25rem', [PHONE]: '1 1 auto' },
    boxSizing: 'border-box',
    paddingBlockStart: { default: spacingVars['--spacing-12'], [PHONE]: SPACE_26 },
    paddingBlockEnd: { default: spacingVars['--spacing-12'], [PHONE]: spacingVars['--spacing-7'] },
    paddingInline: spacingVars['--spacing-6'],
  },
  /** The form fills the column on a phone, so its buttons can rest at the bottom of the screen. */
  formColumn: {
    flexGrow: { default: null, [PHONE]: 1 },
    rowGap: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-4'] },
  },
  /** On a wide screen the theme toggle sits in the corner of the form column. */
  toggle: {
    position: 'absolute',
    insetBlockStart: spacingVars['--spacing-4'],
    insetInlineEnd: spacingVars['--spacing-4'],
    display: { default: null, [PHONE]: 'none' },
  },
  /** On a phone it sits in the header, at the end of the logo row: 44px, white on the green. */
  toggleOnPhone: {
    display: { default: 'none', [PHONE]: 'inline-flex' },
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    color: colorVars['--color-on-accent'],
  },
})

/**
 * Frame for the sign-in and sign-up pages and the account pages that follow
 * them (forgot and reset password, verify email): a green aside with the
 * logo, a slowly turning star, an Ayah and a line about what an account adds,
 * beside the column that holds the page's form. They stack on a narrow
 * screen, the aside above; on a phone the aside is a header block with the
 * theme toggle in its logo row, and the form's buttons rest at the screen's
 * bottom.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Stack direction="horizontal" wrap="wrap" xstyle={styles.page}>
      <VStack as="aside" justify="between" xstyle={styles.aside}>
        <Stack aria-hidden xstyle={styles.ornament}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="100%" height="100%">
            <path d="M12 2.1 14.9 5H19v4.1l2.9 2.9-2.9 2.9V19h-4.1L12 21.9 9.1 19H5v-4.1L2.1 12 5 9.1V5h4.1z" />
            <path d="M12 5.6 13.9 7.5h2.6v2.6L18.4 12l-1.9 1.9v2.6h-2.6L12 18.4l-1.9-1.9H7.5v-2.6L5.6 12l1.9-1.9V7.5h2.6z" />
          </svg>
        </Stack>

        <HStack justify="between" vAlign="center" xstyle={styles.above}>
          <Link
            href={urlFor('home')}
            label="Quran Reader home"
            xstyle={[styles.brand, styles.brandLink, entranceStyles.fadeUp, ENTRANCE_DELAYS[0]]}
          >
            <HStack gap={2} vAlign="center">
              <Icon icon={QuranMark} size="md" color="inherit" />
              <Text type="body" color="inherit" xstyle={styles.brandName}>
                Quran Reader
              </Text>
            </HStack>
          </Link>
          <ThemeToggle xstyle={styles.toggleOnPhone} />
        </HStack>

        <VStack
          maxWidth={ASIDE_TEXT_WIDTH}
          xstyle={[styles.above, styles.text, entranceStyles.fadeUp, ENTRANCE_DELAYS[2]]}
        >
          <VStack dir="rtl">
            <Text type="arabic" color="inherit" xstyle={styles.ayah}>
              <span lang="ar">أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ</span>
            </Text>
          </VStack>
          <Text as="p" type="body" xstyle={styles.headline}>
            Keep your place in the Quran.
          </Text>
          <Text as="p" type="body" xstyle={styles.copy}>
            Sign in to bookmark ayahs, add a note to each, and come back to them from any device.
          </Text>
        </VStack>
      </VStack>

      <VStack as="main" hAlign="center" vAlign="center" xstyle={styles.main}>
        <ThemeToggle xstyle={styles.toggle} />
        <VStack hAlign="stretch" width="100%" maxWidth={FORM_WIDTH} xstyle={styles.formColumn}>
          {children}
        </VStack>
      </VStack>

      <FlashToasts />
      <PasskeySignals />
    </Stack>
  )
}
