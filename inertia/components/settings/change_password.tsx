import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Button } from '@astryxdesign/core/Button'
import { useRouteForm } from '~/components/forms/use_route_form'
import PasswordStrength from '~/components/auth/password_strength'

/**
 * The Change password section of the Security page. The fields clear once
 * the new password is saved.
 */
export default function ChangePassword({ passwordPolicy }: { passwordPolicy: PasswordPolicy }) {
  const form = useRouteForm(
    'account_password.update',
    { currentPassword: '', password: '', passwordConfirmation: '' },
    { preserveScroll: true, onSuccess: () => form.reset() }
  )

  return (
    <VStack gap={4} hAlign="stretch">
      <VStack gap={1}>
        <Heading level={2}>Change password</Heading>
        <Text type="supporting" color="secondary">
          Enter your current password, then choose a new one.
        </Text>
      </VStack>

      <form onSubmit={form.submit}>
        <VStack gap={4} hAlign="stretch" width="100%" maxWidth={480}>
          <FormLayout>
            <TextInput
              label="Current password"
              type="password"
              autoComplete="current-password"
              {...form.field('currentPassword')}
            />
            <PasswordStrength policy={passwordPolicy} password={form.data.password}>
              <TextInput
                label="New password"
                type="password"
                autoComplete="new-password"
                {...form.field('password')}
              />
            </PasswordStrength>
            <TextInput
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              {...form.field('passwordConfirmation')}
            />
          </FormLayout>
          <HStack>
            <Button
              type="submit"
              label={form.processing ? 'Saving…' : 'Update password'}
              variant="primary"
              isLoading={form.processing}
            />
          </HStack>
        </VStack>
      </form>
    </VStack>
  )
}
