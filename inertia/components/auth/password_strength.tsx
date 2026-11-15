import { type ReactNode } from 'react'
import { VStack } from '@astryxdesign/core/VStack'
import { checkPassword } from '@adonisplus/persona/password_policy'
import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import PasswordMeter from '~/components/auth/password_meter'
import PasswordRequirements from '~/components/auth/password_requirements'

type Props = { policy: PasswordPolicy; password: string; children: ReactNode }

/**
 * Wraps a new-password field with a live strength meter and the policy's
 * checklist. It checks the typed password with the same `checkPassword` the
 * server's validator uses, so the screen and the server never disagree.
 */
export default function PasswordStrength({ policy, password, children }: Props) {
  const result = checkPassword(password, policy)

  return (
    <VStack gap={2} hAlign="stretch">
      {children}
      <PasswordMeter score={result.score} valid={result.valid} isEmpty={password === ''} />
      <PasswordRequirements requirements={result.requirements} />
    </VStack>
  )
}
