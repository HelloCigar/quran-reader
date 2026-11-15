import * as stylex from '@stylexjs/stylex'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { StackItem } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { colorVars, radiusVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import type { PasswordCheckResult } from '@adonisplus/persona/password_policy/types'

const LABELS = ['Very weak', 'Weak', 'Medium', 'Strong', 'Very strong'] as const

const styles = stylex.create({
  segment: {
    height: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-track'],
  },
  weakFill: { backgroundColor: colorVars['--color-error'] },
  fairFill: { backgroundColor: colorVars['--color-warning'] },
  acceptableFill: { backgroundColor: colorVars['--color-success'] },
  weakText: { color: colorVars['--color-text-error'] },
  fairText: { color: colorVars['--color-text-warning'] },
  acceptableText: { color: colorVars['--color-text-success'] },
})

const FILL = { weak: styles.weakFill, fair: styles.fairFill, acceptable: styles.acceptableFill }
const TEXT = { weak: styles.weakText, fair: styles.fairText, acceptable: styles.acceptableText }

type Props = Pick<PasswordCheckResult, 'score' | 'valid'> & { isEmpty: boolean }

/**
 * Four segments that fill one per score point, and the strength label. Both
 * turn green together once the whole policy is met (`valid`), never from the
 * score alone; before that a low score is red and a middling one amber.
 */
export default function PasswordMeter({ score, valid, isEmpty }: Props) {
  const tone = isEmpty ? null : valid ? 'acceptable' : score <= 1 ? 'weak' : 'fair'

  return (
    <VStack gap={1} hAlign="stretch" data-acceptable={valid} data-score={score}>
      <HStack
        gap={1}
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={LABELS[score]}
      >
        {[1, 2, 3, 4].map((step) => {
          const filled = !isEmpty && score >= step
          return (
            <StackItem
              key={step}
              size="fill"
              data-filled={filled}
              xstyle={[styles.segment, filled && tone && FILL[tone]]}
            />
          )
        })}
      </HStack>
      <Text type="supporting" as="p" aria-live="polite" xstyle={tone ? TEXT[tone] : undefined}>
        {LABELS[score]}
      </Text>
    </VStack>
  )
}
