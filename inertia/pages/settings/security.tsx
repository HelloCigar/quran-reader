import { Head } from '@inertiajs/react'
import { VStack } from '@astryxdesign/core/VStack'
import { Divider } from '@astryxdesign/core/Divider'
import type { PasswordPolicy } from '@adonisplus/persona/password_policy/types'
import AppLayout from '~/components/app/app_layout'
import SettingsLayout from '~/components/settings/settings_layout'
import ChangePassword from '~/components/settings/change_password'
import PasskeysSettings from '~/components/settings/passkeys_settings'
import type { InertiaProps } from '~/types'
import type { Data } from '@generated/data'

type PageProps = InertiaProps<{ passwordPolicy: PasswordPolicy; passkeys: Data.Passkey[] }>

export default function Security({ passwordPolicy, passkeys }: PageProps) {
  return (
    <VStack gap={6} hAlign="stretch">
      <Head title="Security" />
      <ChangePassword passwordPolicy={passwordPolicy} />
      <Divider />
      <PasskeysSettings passkeys={passkeys} />
    </VStack>
  )
}

Security.layout = [AppLayout, SettingsLayout]
