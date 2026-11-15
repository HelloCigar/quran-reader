import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Button } from '@astryxdesign/core/Button'
import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import AuthLayout from '~/components/auth/auth_layout'
import PasswordStrength from '~/components/auth/password_strength'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ token: string; passwordPolicy: PasswordPolicy }>

export default function ResetPassword({ token, passwordPolicy }: PageProps) {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  return (
    <VStack gap={4} hAlign="stretch" width="100%">
      <Head title="Reset password" />
      <VStack gap={2}>
        <Heading level={1} type="display-2" textWrap="balance">
          Reset password
        </Heading>
        <Text type="body" color="secondary" size="sm">
          Choose a new password for your account
        </Text>
      </VStack>

      <Form options={{ preserveScroll: true }} route="password_resets.update" routeParams={[token]}>
        {({ errors, processing }) => (
          <VStack gap={4} hAlign="stretch">
            <FormLayout>
              <PasswordStrength policy={passwordPolicy} password={password}>
                <TextInput
                  label="Password"
                  type="password"
                  htmlName="password"
                  autoComplete="new-password"
                  size="lg"
                  value={password}
                  onChange={setPassword}
                  status={errors.password ? { type: 'error', message: errors.password } : undefined}
                />
              </PasswordStrength>
              <TextInput
                label="Confirm password"
                type="password"
                htmlName="passwordConfirmation"
                autoComplete="new-password"
                size="lg"
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                status={
                  errors.passwordConfirmation
                    ? { type: 'error', message: errors.passwordConfirmation }
                    : undefined
                }
              />
            </FormLayout>
            <Button
              type="submit"
              label={processing ? 'Resetting…' : 'Reset password'}
              variant="primary"
              size="lg"
              isLoading={processing}
            />
          </VStack>
        )}
      </Form>
    </VStack>
  )
}

ResetPassword.layout = [AuthLayout]
