import { Head } from '@inertiajs/react'
import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import AuthLayout from '~/components/auth/auth_layout'
import AuthHeading from '~/components/auth/auth_heading'
import AuthForm from '~/components/auth/auth_form'
import { AuthButton, AuthTextInput } from '~/components/auth/auth_controls'
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
    <>
      <Head title="Reset password" />
      <AuthHeading title="Reset password" description="Choose a new password for your account" />

      <AuthForm
        onSubmit={form.submit}
        actions={
          <AuthButton
            type="submit"
            label={form.processing ? 'Resetting…' : 'Reset password'}
            isLoading={form.processing}
          />
        }
      >
        <PasswordStrength policy={passwordPolicy} password={form.data.password}>
          <AuthTextInput
            label="Password"
            type="password"
            autoComplete="new-password"
            {...form.field('password')}
          />
        </PasswordStrength>
        <AuthTextInput
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...form.field('passwordConfirmation')}
        />
      </AuthForm>
    </>
  )
}

ResetPassword.layout = [AuthLayout]
