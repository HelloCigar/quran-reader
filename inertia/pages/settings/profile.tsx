import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { Button } from '@astryxdesign/core/Button'
import { Banner } from '@astryxdesign/core/Banner'
import AppLayout from '~/components/app/app_layout'
import SettingsLayout from '~/components/settings/settings_layout'
import { useRouteForm } from '~/components/forms/use_route_form'
import type { InertiaProps } from '~/types'

export default function Profile({ user }: InertiaProps) {
  const account = user!
  const form = useRouteForm(
    'profile.update',
    // A pending address is preloaded, so submitting unchanged is a no-op rather than a revert.
    { fullName: account.fullName ?? '', email: account.unverifiedEmail ?? account.email },
    { preserveScroll: true }
  )

  return (
    <VStack gap={6} hAlign="stretch">
      <Head title="Profile" />
      <VStack gap={1}>
        <Heading level={2}>Profile</Heading>
        <Text type="supporting" color="secondary">
          Your name and the email address you sign in with.
        </Text>
      </VStack>

      {account.unverifiedEmail && (
        <Banner
          status="info"
          title="Verify your new email address to switch to it."
          description={`We sent a link to ${account.unverifiedEmail}. You'll keep signing in with ${account.email} until it's confirmed.`}
          endContent={
            <HStack gap={2}>
              <Form options={{ preserveScroll: true }} route="email_verifications.store">
                {({ processing }) => (
                  <Button
                    type="submit"
                    label={processing ? 'Sending…' : 'Resend link'}
                    variant="secondary"
                    size="sm"
                    isLoading={processing}
                  />
                )}
              </Form>
              {/* Submitting the verified email reverts the pending change. */}
              <Form
                options={{ preserveScroll: true }}
                route="profile.update"
                transform={() => ({ fullName: account.fullName ?? '', email: account.email })}
                onSuccess={() => form.setData('email', account.email)}
              >
                {({ processing }) => (
                  <Button
                    type="submit"
                    label={processing ? 'Cancelling…' : 'Cancel change'}
                    variant="ghost"
                    size="sm"
                    isLoading={processing}
                  />
                )}
              </Form>
            </HStack>
          }
        />
      )}

      <form onSubmit={form.submit}>
        <VStack gap={4} hAlign="stretch" width="100%" maxWidth={480}>
          <FormLayout>
            <TextInput label="Full name" autoComplete="name" {...form.field('fullName')} />
            <TextInput label="Email" type="email" autoComplete="email" {...form.field('email')} />
          </FormLayout>
          <HStack>
            <Button
              type="submit"
              label={form.processing ? 'Saving…' : 'Update profile'}
              variant="primary"
              isLoading={form.processing}
            />
          </HStack>
        </VStack>
      </form>
    </VStack>
  )
}

Profile.layout = [AppLayout, SettingsLayout]
