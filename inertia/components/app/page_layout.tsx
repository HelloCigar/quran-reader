import * as stylex from '@stylexjs/stylex'
import { type ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'

/**
 * The inset every page shares (`LayoutContent padding`): 16px, the content
 * line of the top bar, the settings header and the reader's footer.
 */
export const PAGE_INSET = 4

/** The width a column of reading text or a list is capped at. */
export const PAGE_WIDTH = 720

const styles = stylex.create({
  /** A phone keeps the 16px inset; a wider screen has room for more air above and below. */
  page: {
    paddingBlock: {
      'default': spacingVars['--spacing-2'],
      '@media (min-width: 769px)': spacingVars['--spacing-6'],
    },
  },
})

/**
 * The frame of a single-column page inside the app layout: one column capped
 * at `PAGE_WIDTH`, the page's `h1` with an optional description and actions,
 * and the content beneath. It also sets the document title.
 */
export default function PageLayout({
  title,
  heading = title,
  description,
  actions,
  children,
}: {
  /** The document title. */
  title: string
  /** The page's `h1`, when it differs from the title. */
  heading?: string
  description?: string
  /** Buttons under the heading; they wrap on a narrow screen. */
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Layout
      height="auto"
      contentWidth={PAGE_WIDTH}
      content={
        <LayoutContent padding={PAGE_INSET}>
          <Head title={title} />
          <VStack gap={6} xstyle={styles.page}>
            <VStack gap={3}>
              <VStack gap={1}>
                <Heading level={1}>{heading}</Heading>
                {description && (
                  <Text type="supporting" color="secondary">
                    {description}
                  </Text>
                )}
              </VStack>
              {actions && (
                <HStack gap={2} wrap="wrap">
                  {actions}
                </HStack>
              )}
            </VStack>
            {children}
          </VStack>
        </LayoutContent>
      }
    />
  )
}
