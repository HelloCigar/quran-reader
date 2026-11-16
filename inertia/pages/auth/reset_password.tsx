import { Head } from '@inertiajs/react'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Button } from '@astryxdesign/core/Button'
import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import AuthLayout from '~/components/auth/auth_layout'
import PasswordStrength from '~/components/auth/password_strength'
import { useRouteForm } from '~/components/forms/use_route_form'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ token: string; passwordPolicy: PasswordPolicy }>

export default function ResetPassword({ token, passwordPolicy }: PageProps) {
  const form = useRouteForm(
    'password_resets.update',
    { password: '', passwordConfirmation: '' },
    { routeParams: { token }, preserveScroll: true }
  )

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

      <form onSubmit={form.submit}>
        <VStack gap={4} hAlign="stretch">
          <FormLayout>
            <PasswordStrength policy={passwordPolicy} password={form.data.password}>
              <TextInput
                label="Password"
                type="password"
                autoComplete="new-password"
                size="lg"
                {...form.field('password')}
              />
            </PasswordStrength>
            <TextInput
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              size="lg"
              {...form.field('passwordConfirmation')}
            />
          </FormLayout>
          <Button
            type="submit"
            label={form.processing ? 'Resetting…' : 'Reset password'}
            variant="primary"
            size="lg"
            isLoading={form.processing}
          />
        </VStack>
      </form>
    </VStack>
  )
}

ResetPassword.layout = [AuthLayout]
