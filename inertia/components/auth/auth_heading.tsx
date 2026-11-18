import * as stylex from '@stylexjs/stylex'
import { type ReactNode } from 'react'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { entranceStyles, ENTRANCE_DELAYS } from '~/components/quran/entrance_styles'

/** Phone: the auth pages' phone treatment applies up to 600px wide. */
const PHONE = '@media (max-width: 600px)'

const styles = stylex.create({
  /** The title is 32px, a step under the aside's, and a little tight; on a phone it is 26px. */
  title: {
    fontSize: { default: '2rem', [PHONE]: '1.625rem' },
    letterSpacing: { default: '-0.01em', [PHONE]: 'normal' },
    lineHeight: { default: null, [PHONE]: 'normal' },
  },
  /** On a phone the lines under the title are 14px. */
  line: {
    fontSize: { default: null, [PHONE]: '0.875rem' },
    lineHeight: { default: null, [PHONE]: 'normal' },
    // The link inside the line takes the font's own line too.
    '--text-body-leading': { default: null, [PHONE]: 'normal' },
  },
  /** The title and its lines stand 6px apart, or 4px on a phone. */
  heading: {
    rowGap: { default: null, [PHONE]: spacingVars['--spacing-1'] },
  },
})

/**
 * The top of an auth form: the page's `h1`, a line that says what the page is
 * for, and a line that sends the reader to the page next door (sign in or
 * create an account). It fades up first of the form's parts.
 */
export default function AuthHeading({
  title,
  description,
  children,
}: {
  title: string
  description?: ReactNode
  /** The line that links to the neighbouring page. */
  children?: ReactNode
}) {
  return (
    <VStack gap={1.5} xstyle={[styles.heading, entranceStyles.fadeUp, ENTRANCE_DELAYS[1]]}>
      <Heading level={1} type="display-2" weight="medium" xstyle={styles.title}>
        {title}
      </Heading>
      {description && (
        <Text as="p" type="body" color="secondary" xstyle={styles.line}>
          {description}
        </Text>
      )}
      {children && (
        <Text as="p" type="body" color="secondary" xstyle={styles.line}>
          {children}
        </Text>
      )}
    </VStack>
  )
}
