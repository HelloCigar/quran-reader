import { type ReactNode } from 'react'
import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import { useRouteForm } from '~/components/forms/use_route_form'
import PasswordStrength from '~/components/auth/password_strength'
import {
  SettingsFields,
  SettingsSection,
  SettingsSaveBar,
} from '~/components/settings/settings_section'
import { SettingsTextInput } from '~/components/settings/settings_controls'

const FORM_ID = 'change-password'

/**
 * The Security section: the change-password fields, then `children` (the
 * passkeys box), then the Save changes pill at the foot. The pill sits
 * outside the form, under the passkeys, and submits it by id. The fields
 * clear once the new password is saved.
 */
export default function ChangePassword({
  passwordPolicy,
  children,
}: {
  passwordPolicy: PasswordPolicy
  children?: ReactNode
}) {
  const form = useRouteForm(
    'account_password.update',
    { currentPassword: '', password: '', passwordConfirmation: '' },
    { preserveScroll: true, onSuccess: () => form.reset() }
  )

  return (
    <SettingsSection
      heading="Security"
      description="Change your password, or sign in with a passkey instead."
    >
      <form id={FORM_ID} onSubmit={form.submit}>
        <SettingsFields>
          <SettingsTextInput
            label="Current password"
            type="password"
            autoComplete="current-password"
            {...form.field('currentPassword')}
          />
          <PasswordStrength policy={passwordPolicy} password={form.data.password}>
            <SettingsTextInput
              label="New password"
              type="password"
              autoComplete="new-password"
              {...form.field('password')}
            />
          </PasswordStrength>
          <SettingsTextInput
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            {...form.field('passwordConfirmation')}
          />
        </SettingsFields>
      </form>
      {children}
      <SettingsSaveBar
        form={FORM_ID}
        processing={form.processing}
        saved={form.recentlySuccessful}
      />
    </SettingsSection>
  )
}
