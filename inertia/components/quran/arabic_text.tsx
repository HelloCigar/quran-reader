import type { ReactNode } from 'react'
import type { StyleXStyles } from '@stylexjs/stylex'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'

/**
 * Quran Arabic, exactly as given (text, or an Ayah's Words): right to left, in the theme's `arabic` text
 * style, and marked `lang="ar"` so screen readers pronounce it as Arabic
 * (WCAG 3.1.2). Use it for every piece of Arabic the app shows.
 */
export default function ArabicText({
  children,
  align = 'start',
  color = 'primary',
  xstyle,
  'data-testid': testId,
}: {
  children: ReactNode
  align?: 'start' | 'center'
  /** `accent` for a name set apart, such as a Surah's in its heading; `secondary` for one beside its English name. */
  color?: 'primary' | 'secondary' | 'accent'
  /** Styles for the text itself, such as a tighter line height in a list row. */
  xstyle?: StyleXStyles
  'data-testid'?: string
}) {
  return (
    <VStack dir="rtl" hAlign={align} data-testid={testId}>
      <Text type="arabic" color={color} justify={align} xstyle={xstyle}>
        {/* Astryx components omit `lang` from their props (BaseProps), so a
            native span is the only place the language can be declared. */}
        <span lang="ar">{children}</span>
      </Text>
    </VStack>
  )
}
