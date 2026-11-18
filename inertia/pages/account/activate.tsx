import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import AuthLayout from '~/components/auth/auth_layout'
import AuthHeading from '~/components/auth/auth_heading'
import { AuthButton } from '~/components/auth/auth_controls'
import { entranceStyles, ENTRANCE_DELAYS } from '~/components/quran/entrance_styles'
import type { InertiaProps } from '~/types'

export default function Activate({ user }: InertiaProps) {
  return (
    <>
      <Head title="Verify your account" />
      <AuthHeading
        title="Verify your account"
        description={
          <>
            Check <Text weight="bold">{user?.unverifiedEmail}</Text> inbox for instructions from us
            on how to verify your account.
          </>
        }
      />

      <Form options={{ preserveScroll: true }} route="email_verifications.store">
        {({ processing }) => (
          <VStack hAlign="stretch" xstyle={[entranceStyles.fadeUp, ENTRANCE_DELAYS[2]]}>
            <AuthButton
              type="submit"
              label={processing ? 'Sending…' : 'Resend activation link'}
              isLoading={processing}
            />
          </VStack>
        )}
      </Form>

      <Form route="session.destroy">
        {({ processing }) => (
          <HStack gap={2} vAlign="center" xstyle={[entranceStyles.fadeUp, ENTRANCE_DELAYS[4]]}>
            <Text type="supporting" color="secondary">
              Wrong account?
            </Text>
            <Button
              type="submit"
              label="Log out"
              variant="ghost"
              size="sm"
              isLoading={processing}
            />
          </HStack>
        )}
      </Form>
    </>
  )
}

Activate.layout = [AuthLayout]
