import * as stylex from '@stylexjs/stylex'
import { type ReactNode } from 'react'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Center } from '@astryxdesign/core/Center'
import { Card } from '@astryxdesign/core/Card'
import { Grid } from '@astryxdesign/core/Grid'
import { Section } from '@astryxdesign/core/Section'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { StackItem } from '@astryxdesign/core/Layout'
import { Icon } from '@astryxdesign/core/Icon'
import { Link } from '@astryxdesign/core/Link'
import { Text } from '@astryxdesign/core/Text'
import { urlFor } from '~/client'
import { QuranMark } from '~/components/brand/logo'
import ThemeToggle from '~/components/theme/theme_toggle'
import FlashToasts from '~/components/feedback/flash_toasts'

/**
 * Grid emits minmax(MIN, 1fr), so MIN plus the insets must fit the narrowest
 * phone: 320 − 2×24 (page) − 2×16 (stacked inset) = 240. Below
 * 2×MIN + 32 (gap) = 512px the two columns stack.
 */
const COLUMN_MIN_WIDTH = 240
const STACKED = '@container auth-split (max-width: 511px)'

const styles = stylex.create({
  /** A standalone page has no app shell, so it paints the body itself. */
  page: {
    minHeight: '100dvh',
    backgroundColor: colorVars['--color-background-body'],
  },
  /**
   * The card is the container the stacked layout is keyed to, so the inset
   * tightens with the card's own width. It has to sit above the grid: a
   * container query only matches an ancestor, never the element itself.
   */
  card: {
    containerType: 'inline-size',
    containerName: 'auth-split',
  },
  /** Pad the grid, not the Card, and tighten the inset once the columns stack. */
  grid: {
    padding: {
      default: spacingVars['--spacing-8'],
      [STACKED]: spacingVars['--spacing-4'],
    },
  },
})

/**
 * Frame for the sign-in and sign-up pages, from Astryx's `login-split`
 * template: a card with the form column (brand, the page's form, theme
 * toggle) beside a muted column about what signing in adds.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Center axis="both" padding={6} xstyle={styles.page}>
      <Card padding={0} width="100%" maxWidth={1000} xstyle={styles.card}>
        <Grid
          columns={{ minWidth: COLUMN_MIN_WIDTH, repeat: 'fit' }}
          gap={8}
          align="stretch"
          xstyle={styles.grid}
        >
          <Section variant="transparent" padding={0} height="100%">
            <VStack gap={4} height="100%">
              <HStack gap={2} vAlign="center" justify="between">
                <Link href={urlFor('home')} label="Quran Reader home" color="primary">
                  <HStack gap={2} vAlign="center">
                    <Icon icon={QuranMark} />
                    <Text type="body" weight="bold">
                      Quran Reader
                    </Text>
                  </HStack>
                </Link>
                <ThemeToggle />
              </HStack>
              <StackItem size="fill">
                <Center axis="vertical" height="100%">
                  {children}
                </Center>
              </StackItem>
            </VStack>
          </Section>

          <Card variant="muted" padding={8}>
            <VStack gap={6} justify="between" height="100%">
              <Text type="large" weight="medium" textWrap="balance">
                Keep your place in the Quran.
              </Text>
              <Text type="supporting" color="secondary">
                Sign in to bookmark ayahs, add a note to each, and come back to them from any
                device.
              </Text>
            </VStack>
          </Card>
        </Grid>
      </Card>
      <FlashToasts />
    </Center>
  )
}
