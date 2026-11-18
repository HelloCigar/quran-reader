import * as stylex from '@stylexjs/stylex'
import { useRef, type RefObject } from 'react'
import { colorVars, radiusVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Button } from '@astryxdesign/core/Button'
import { Popover } from '@astryxdesign/core/Popover'
import { VStack } from '@astryxdesign/core/VStack'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import { useWordPopover } from '~/components/quran/word_popovers'

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
    color: colorVars['--color-text-accent'],
    backgroundColor: { default: 'transparent', ':hover': 'transparent' },
  },
  /**
   * The Transliteration is how the Word is read aloud, the main thing the
   * popover gives, so it stands out from the Word Translation above it.
   */
  transliteration: {
    fontStyle: 'italic',
    lineHeight: 1.9,
  },
  /** The popover is wider than the theme's padding makes it: more room beside its text. */
  popover: {
    paddingInline: spacingVars['--spacing-4'],
  },
  /** The Word Translation sits a step under the body text. */
  translation: {
    fontSize: '0.8125rem',
    lineHeight: 1.9,
  },
  /** The Transliteration of the Recited Word: this is what you hear. */
  recited: {
    textDecorationLine: 'underline',
    textUnderlineOffset: spacingVars['--spacing-1'],
  },
})

/**
 * One Word of an Ayah. Clicking it, or Enter/Space when it has focus, opens a
 * popover above it with its Word Translation and, beneath that, its
 * Transliteration; Escape or a click outside closes it and focus returns to the
 * Word. The Word itself is the Arabic, so the popover does not repeat it.
 *
 * While a Recitation plays, the popover opens on its own on the Recited Word,
 * without taking focus, and its Transliteration is underlined. The Surah's
 * page keeps it in view (`useFollowRecitation`).
 */
export default function WordButton({ word }: { word: Data.Word }) {
  const { openedBy, onOpenChange } = useWordPopover(word.location)
  const isOpen = openedBy !== null
  const isRecited = openedBy === 'recitation'
  const anchorRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Button
        ref={anchorRef}
        variant="ghost"
        label={word.arabic}
        aria-expanded={isOpen}
        data-word-location={word.location}
        xstyle={[wordStyles.word, isOpen && wordStyles.selected]}
        // While open, the popover handles clicks on its anchor.
        onClick={isOpen ? undefined : () => onOpenChange(word.location, true)}
      >
        <Text type="inherit" color="inherit">
          {word.arabic}
        </Text>
      </Button>
      {/* Only the open Word mounts a popover: a long Surah has thousands of Words. */}
      {isOpen && (
        <Popover
          // Astryx types the anchor as never null; it is set before the Word can open.
          anchorRef={anchorRef as RefObject<HTMLElement>}
          label={`Word ${word.location}`}
          placement="above"
          alignment="center"
          isOpen
          onOpenChange={(open) => {
            // The popover reports its controlled opening too; only a close is the reader's.
            if (!open) onOpenChange(word.location, false)
          }}
          xstyle={wordStyles.popover}
          hasAutoFocus={!isRecited}
          isModal={!isRecited}
          hasLightDismiss={!isRecited}
          content={
            <VStack gap={1} hAlign="center">
              <Text
                type="supporting"
                color="secondary"
                justify="center"
                xstyle={wordStyles.translation}
              >
                {word.translation}
              </Text>
              <Text
                type="large"
                weight="semibold"
                color="accent"
                justify="center"
                xstyle={[wordStyles.transliteration, isRecited && wordStyles.recited]}
              >
                {word.transliteration}
              </Text>
            </VStack>
          }
        />
      )}
    </>
  )
}
