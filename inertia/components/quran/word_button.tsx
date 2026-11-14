import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { colorVars, radiusVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Button } from '@astryxdesign/core/Button'
import { Popover } from '@astryxdesign/core/Popover'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import ArabicText from '~/components/quran/arabic_text'

export const wordStyles = stylex.create({
  /** A Word reads as part of the Arabic line, not as a button. */
  word: {
    font: 'inherit',
    color: 'inherit',
    height: 'auto',
    minHeight: 0,
    paddingBlock: spacingVars['--spacing-0'],
    paddingInline: spacingVars['--spacing-0-5'],
    borderRadius: radiusVars['--radius-element'],
    verticalAlign: 'baseline',
  },
  /**
   * The one "selected Word" style: the Word whose popover is open, and later
   * the Word being recited.
   */
  selected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
})

/**
 * One Word of an Ayah. Clicking it, or Enter/Space when it has focus, opens a
 * popover with its Arabic, Transliteration and Word Translation; Escape or a
 * click outside closes it and focus returns to the Word.
 */
export default function WordButton({ word }: { word: Data.Word }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      label={`Word ${word.location}`}
      placement="below"
      alignment="center"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      content={
        <VStack gap={1}>
          <ArabicText>{word.arabic}</ArabicText>
          <Text type="body" color="secondary">
            {word.transliteration}
          </Text>
          <Text type="body" color="primary">
            {word.translation}
          </Text>
        </VStack>
      }
    >
      <Button
        variant="ghost"
        label={word.arabic}
        aria-expanded={isOpen}
        data-word-location={word.location}
        xstyle={[wordStyles.word, isOpen && wordStyles.selected]}
      >
        <Text type="inherit" color="inherit">
          {word.arabic}
        </Text>
      </Button>
    </Popover>
  )
}
