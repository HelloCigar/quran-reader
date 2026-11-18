import * as stylex from '@stylexjs/stylex'
import { Head } from '@inertiajs/react'
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { Stack } from '@astryxdesign/core/Stack'
import { Divider } from '@astryxdesign/core/Divider'
import { Link } from '@astryxdesign/core/Link'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import AuthLayout from '~/components/auth/auth_layout'
import AuthHeading from '~/components/auth/auth_heading'
import AuthForm from '~/components/auth/auth_form'
import { AuthButton, AuthTextInput } from '~/components/auth/auth_controls'
import PasskeySignIn from '~/components/auth/passkey_sign_in'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{
  bookmark: { surah: number; ayah: number } | null
}>

const PHONE = '@media (max-width: 600px)'

const styles = stylex.create({
  /** The fields stand 20px apart, or 16px on a phone. */
  fields: {
    rowGap: { default: spacingVars['--spacing-5'], [PHONE]: spacingVars['--spacing-4'] },
  },
  /** The Password field holds the link in the row of its label. */
  field: { position: 'relative' },
  /** The link sits in the row of the Password label, at its end. */
  forgot: {
    position: 'absolute',
    insetBlockStart: spacingVars['--spacing-0'],
    insetInlineEnd: spacingVars['--spacing-0'],
  },
})

export default function Login({ bookmark }: PageProps) {
  const form = useRouteForm('session.store', { email: '', password: '' })
  // The carried bookmark isn't a text field, so it's added to the submitted data.
  form.transform((data) => (bookmark ? { ...data, bookmark } : data))

  return (
    <>
      <Head title="Sign in" />
      <AuthHeading
        title="Sign in"
        description={bookmark && `Sign in to bookmark ${bookmark.surah}:${bookmark.ayah}`}
      >
        New here?{' '}
        <Link href={urlFor('new_account.create', [], { qs: { bookmark } })} weight="semibold">
          Create an account
        </Link>
      </AuthHeading>

      <AuthForm
        onSubmit={form.submit}
        fieldsXstyle={styles.fields}
        actions={
          <>
            <AuthButton type="submit" label="Sign in" isLoading={form.processing} />
            <Divider label="or" />
            <PasskeySignIn bookmark={bookmark} />
          </>
        }
      >
        <AuthTextInput
          label="Email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          {...form.field('email')}
        />
        <Stack xstyle={styles.field}>
          <AuthTextInput
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            {...form.field('password')}
          />
          <Link href={urlFor('password_resets.create')} weight="medium" xstyle={styles.forgot}>
            Forgot password?
          </Link>
        </Stack>
      </AuthForm>
    </>
  )
}

Login.layout = [AuthLayout]
