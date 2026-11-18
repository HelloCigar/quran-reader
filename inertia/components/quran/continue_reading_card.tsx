import * as stylex from '@stylexjs/stylex'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { Text } from '@astryxdesign/core/Text'
import { VStack } from '@astryxdesign/core/VStack'
import {
  borderVars,
  fontWeightVars,
  spacingVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

/** Sizes the scales have no stop for, built from their stops. */
const SPACE_14 = `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`
const SPACE_18 = `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`
const TITLE_SIZE = `calc(${textSizeVars['--font-size-base']} + ${borderVars['--border-width']})`

const styles = stylex.create({
  /** The card: the whole width of the column, with a little air at each end. */
  card: {
    width: '100%',
    height: 'auto',
    minHeight: 0,
    justifyContent: 'space-between',
    marginInline: spacingVars['--spacing-1'],
    paddingBlock: SPACE_14,
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: SPACE_18,
    textAlign: 'start',
  },
  label: {
    lineHeight: 'normal',
    fontWeight: fontWeightVars['--font-weight-medium'],
    opacity: 0.85,
  },
  title: {
    lineHeight: 'normal',
    fontSize: TITLE_SIZE,
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
})

/**
 * The phone's "Continue reading": a green card that names the Surah and the
 * Ayah the reader left at and takes them back to it. A wider screen has the
 * "Continue at" button in the page's heading instead.
 */
export default function ContinueReadingCard({
  surahName,
  reference,
  href,
  xstyle,
}: {
  surahName: string
  reference: string
  href: string
  /** Where the card shows: the page hides it from a wide screen. */
  xstyle?: stylex.StyleXStyles
}) {
  return (
    <Button
      label={`Continue reading ${surahName} · ${reference}`}
      variant="primary"
      href={href}
      endContent={<Icon icon={ArrowRightIcon} size="sm" />}
      xstyle={[styles.card, xstyle]}
    >
      <VStack gap={0.5} hAlign="start">
        <Text type="supporting" color="inherit" xstyle={styles.label}>
          Continue reading
        </Text>
        <Text type="body" color="inherit" xstyle={styles.title}>
          {`${surahName} · ${reference}`}
        </Text>
      </VStack>
    </Button>
  )
}
