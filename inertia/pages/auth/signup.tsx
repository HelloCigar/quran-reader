import { Head } from '@inertiajs/react'
import { Link } from '@astryxdesign/core/Link'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import AuthLayout from '~/components/auth/auth_layout'
import AuthHeading from '~/components/auth/auth_heading'
import AuthForm from '~/components/auth/auth_form'
import { AuthButton, AuthTextInput } from '~/components/auth/auth_controls'
import PasswordStrength from '~/components/auth/password_strength'
import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  bookmark: { surah: number; ayah: number } | null
  passwordPolicy: PasswordPolicy
}>

export default function Signup({ bookmark, passwordPolicy }: PageProps) {
  const form = useRouteForm('new_account.store', {
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  // The carried bookmark isn't a text field, so it's added to the submitted data.
  form.transform((data) => (bookmark ? { ...data, bookmark } : data))

  return (
    <>
      <Head title="Create account" />
      <AuthHeading
        title="Create your account"
        description={
          bookmark
            ? `Create an account to bookmark ${bookmark.surah}:${bookmark.ayah}`
            : 'Bookmark ayahs and keep a note on each.'
        }
      >
        Already have an account?{' '}
        <Link href={urlFor('session.create', [], { qs: { bookmark } })} weight="semibold">
          Sign in
        </Link>
      </AuthHeading>

      <AuthForm
        onSubmit={form.submit}
        actions={<AuthButton type="submit" label="Create account" isLoading={form.processing} />}
      >
        <AuthTextInput
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          {...form.field('fullName')}
        />
        <AuthTextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.field('email')}
        />
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

Signup.layout = [AuthLayout]
