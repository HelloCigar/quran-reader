import { Head } from '@inertiajs/react'
import { Link } from '@astryxdesign/core/Link'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import AuthLayout from '~/components/auth/auth_layout'
import AuthHeading from '~/components/auth/auth_heading'
import AuthForm from '~/components/auth/auth_form'
import { AuthButton, AuthTextInput } from '~/components/auth/auth_controls'

export default function ForgotPassword() {
  const form = useRouteForm('password_resets.store', { email: '' }, { preserveScroll: true })

  return (
    <>
      <Head title="Forgot password" />
      <AuthHeading
        title="Forgot password"
        description={
          <>
            Enter the email address you registered with, and we&rsquo;ll send you instructions to
            reset your password
          </>
        }
      >
        Remembered it?{' '}
        <Link href={urlFor('session.create')} weight="semibold">
          Sign in
        </Link>
      </AuthHeading>

      <AuthForm
        onSubmit={form.submit}
        actions={
          <AuthButton
            type="submit"
            label={form.processing ? 'Sending…' : 'Send instructions'}
            isLoading={form.processing}
          />
        }
      >
        <AuthTextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.field('email')}
        />
      </AuthForm>
    </>
  )
}

ForgotPassword.layout = [AuthLayout]
