import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Banner } from '@astryxdesign/core/Banner'
import AppLayout from '~/components/app/app_layout'
import SettingsLayout from '~/components/settings/settings_layout'
import {
  SettingsFields,
  SettingsSection,
  SettingsSaveBar,
} from '~/components/settings/settings_section'
import { SettingsTextInput } from '~/components/settings/settings_controls'
import { useRouteForm } from '~/components/forms/use_route_form'
import type { InertiaProps } from '~/types'

const FORM_ID = 'update-profile'

export default function Profile({ user }: InertiaProps) {
  const account = user!
  const form = useRouteForm(
    'profile.update',
    // A pending address is preloaded, so submitting unchanged is a no-op rather than a revert.
    { fullName: account.fullName ?? '', email: account.unverifiedEmail ?? account.email },
    { preserveScroll: true }
  )

  return (
    <SettingsSection
      heading="Profile"
      description="Your name and the email address you sign in with."
    >
      <Head title="Profile" />

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

      <form id={FORM_ID} onSubmit={form.submit}>
        <SettingsFields>
          <SettingsTextInput label="Full name" autoComplete="name" {...form.field('fullName')} />
          <SettingsTextInput
            label="Email"
            type="email"
            autoComplete="email"
            helper="We send a link to a new address before switching to it."
            {...form.field('email')}
          />
          <SettingsSaveBar
            form={FORM_ID}
            processing={form.processing}
            saved={form.recentlySuccessful}
          />
        </SettingsFields>
      </form>
    </SettingsSection>
  )
}

Profile.layout = [AppLayout, SettingsLayout]
