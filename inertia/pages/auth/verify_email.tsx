import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { VStack } from '@astryxdesign/core/VStack'
import AuthLayout from '~/components/auth/auth_layout'
import AuthHeading from '~/components/auth/auth_heading'
import { AuthButton } from '~/components/auth/auth_controls'
import { entranceStyles, ENTRANCE_DELAYS } from '~/components/quran/entrance_styles'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ token: string }>

export default function VerifyEmail({ token }: PageProps) {
  return (
    <>
      <Head title="Verify your email" />
      <AuthHeading
        title="Verify your email"
        description="Click the button below to confirm your email address."
      />

      <Form
        options={{ preserveScroll: true }}
        route="email_verifications.update"
        routeParams={[token]}
      >
        {({ processing }) => (
          <VStack hAlign="stretch" xstyle={[entranceStyles.fadeUp, ENTRANCE_DELAYS[2]]}>
            <AuthButton
              type="submit"
              label={processing ? 'Verifying…' : 'Verify my email'}
              isLoading={processing}
            />
          </VStack>
        )}
      </Form>
    </>
  )
}

VerifyEmail.layout = [AuthLayout]
