import * as stylex from '@stylexjs/stylex'
import { useEffect, useRef } from 'react'
import { colorVars, radiusVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Button } from '@astryxdesign/core/Button'
import { Popover } from '@astryxdesign/core/Popover'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import ArabicText from '~/components/quran/arabic_text'
import { useWordPopovers } from '~/components/quran/word_popovers'

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
   * The one "selected Word" style: the Word whose popover is open, by the
   * reader or by the Recitation.
   */
  selected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  /** The Transliteration of the Recited Word: this is what you hear. */
  recited: {
    backgroundColor: colorVars['--color-accent-muted'],
    borderRadius: radiusVars['--radius-element'],
    paddingInline: spacingVars['--spacing-1'],
  },
})

/**
 * One Word of an Ayah. Clicking it, or Enter/Space when it has focus, opens a
 * popover with its Arabic, Transliteration and Word Translation; Escape or a
 * click outside closes it and focus returns to the Word.
 *
 * While a Recitation plays, the popover opens on its own on the Recited Word,
 * without taking focus, and its Transliteration is highlighted.
 */
export default function WordButton({ word }: { word: Data.Word }) {
  const { shown, onOpenChange } = useWordPopovers()
  const isOpen = shown?.location === word.location
  const isRecited = isOpen && shown.by === 'recitation'
  const anchorRef = useRef<HTMLButtonElement>(null)

  /**
   * Keeps the Recited Word on screen: scrolls only when it has left the view.
   */
  useEffect(() => {
    const element = anchorRef.current
    if (!isRecited || !element) return
    const rect = element.getBoundingClientRect()
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [isRecited])

  return (
    <Popover
      label={`Word ${word.location}`}
      placement="below"
      alignment="center"
      isOpen={isOpen}
      onOpenChange={(open) => {
        // The popover reports its controlled opening too; only a change is the reader's.
        if (open !== isOpen) onOpenChange(word.location, open)
      }}
      hasAutoFocus={!isRecited}
      isModal={!isRecited}
      hasLightDismiss={!isRecited}
      content={
        <VStack gap={1}>
          <ArabicText>{word.arabic}</ArabicText>
          <Text type="body" color="secondary" xstyle={isRecited && wordStyles.recited}>
            {word.transliteration}
          </Text>
          <Text type="body" color="primary">
            {word.translation}
          </Text>
        </VStack>
      }
    >
      <Button
        ref={anchorRef}
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
