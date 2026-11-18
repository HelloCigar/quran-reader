import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex'
import { KeyIcon } from '@heroicons/react/24/outline'
import type { Data } from '@generated/data'
import { Form, useHttp, useRouter } from '@adonisjs/inertia/react'
import { startRegistration, WebAuthnError } from '@simplewebauthn/browser'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { List, ListItem } from '@astryxdesign/core/List'
import { Icon } from '@astryxdesign/core/Icon'
import { Banner } from '@astryxdesign/core/Banner'
import { useRouteForm } from '~/components/forms/use_route_form'
import { SettingsButton, SettingsTextInput } from '~/components/settings/settings_controls'

/** The page's phone breakpoint, the one `PageLayout` uses. */
const PHONE = '@media (max-width: 600px)'

const styles = stylex.create({
  /** The passkeys box: a pale green card of 16px corners, 14px above and below and 16px to each side on a phone. */
  box: {
    boxSizing: 'border-box',
    paddingBlock: {
      default: spacingVars['--spacing-4'],
      [PHONE]: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
    },
    paddingInline: {
      default: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
      [PHONE]: spacingVars['--spacing-4'],
    },
    borderRadius: spacingVars['--spacing-4'],
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-accent']} 7%, transparent)`,
  },
  /** The text over the button on a phone, 12px apart, the button under it at the start. */
  head: {
    flexDirection: { default: null, [PHONE]: 'column' },
    alignItems: { default: null, [PHONE]: 'flex-start' },
    rowGap: { default: null, [PHONE]: spacingVars['--spacing-3'] },
  },
  title: { fontSize: '0.875rem', lineHeight: 'normal' },
  description: { fontSize: '0.8125rem', lineHeight: 'normal' },
})

/**
 * Renames a passkey in place of its row. It is mounted only while the reader
 * renames, so each Rename starts from the name the server has.
 */
function PasskeyRenameForm({ passkey, onDone }: { passkey: Data.Passkey; onDone: () => void }) {
  const form = useRouteForm(
    'passkeys.update',
    { name: passkey.name },
    { routeParams: { id: passkey.id }, preserveScroll: true, onSuccess: onDone }
  )

  return (
    <ListItem
      label={
        <form onSubmit={form.submit}>
          <HStack gap={2} vAlign="end" wrap="wrap">
            <SettingsTextInput label="Passkey name" hasAutoFocus {...form.field('name')} />
            <Button
              type="submit"
              label={form.processing ? 'Saving…' : 'Save'}
              variant="primary"
              isLoading={form.processing}
            />
            <Button label="Cancel" variant="ghost" onClick={onDone} />
          </HStack>
        </form>
      }
    />
  )
}

/** One passkey: its name and dates, with Rename and Remove; Rename edits it in place. */
function PasskeyRow({ passkey }: { passkey: Data.Passkey }) {
  const [renaming, setRenaming] = useState(false)

  if (renaming) return <PasskeyRenameForm passkey={passkey} onDone={() => setRenaming(false)} />

  return (
    <ListItem
      startContent={<Icon icon={KeyIcon} color="secondary" />}
      label={
        <HStack gap={2} vAlign="center">
          <Text weight="semibold">{passkey.name}</Text>
          {passkey.backedUp && (
            <Text type="supporting" color="secondary">
              Synced
            </Text>
          )}
        </HStack>
      }
      description={`Added ${passkey.addedOn} · ${
        passkey.lastUsedOn ? `Last used ${passkey.lastUsedOn}` : 'Never used'
      }`}
      endContent={
        <HStack gap={1}>
          <Button label="Rename" variant="ghost" size="sm" onClick={() => setRenaming(true)} />
          <Form
            options={{ preserveScroll: true }}
            route="passkeys.destroy"
            routeParams={{ id: passkey.id }}
          >
            {({ processing }) => (
              <Button
                type="submit"
                label={processing ? 'Removing…' : 'Remove'}
                variant="ghost"
                size="sm"
                isLoading={processing}
              />
            )}
          </Form>
        </HStack>
      }
    />
  )
}

/**
 * The Passkeys section of the Security page: the user's passkeys and the
 * button that asks the device to create a new one.
 */
export default function PasskeysSettings({ passkeys }: { passkeys: Data.Passkey[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const challenge = useHttp({ route: 'passkey_registration_challenges.store' })

  async function addPasskey() {
    setProcessing(true)
    setError(null)

    try {
      const optionsJSON = await challenge.submit()
      const response = await startRegistration({ optionsJSON })

      router.post(
        { route: 'passkeys.store' },
        { response },
        { preserveScroll: true, onFinish: () => setProcessing(false) }
      )
    } catch (caught) {
      setProcessing(false)

      if (
        caught instanceof WebAuthnError &&
        caught.code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED'
      ) {
        setError('This device already has a passkey for your account')
        return
      }

      // The user dismissed the prompt or it timed out: a cancellation, not an error.
      if (caught instanceof Error && caught.name === 'NotAllowedError') {
        return
      }

      setError('Unable to add the passkey. Please try again')
    }
  }

  return (
    <VStack gap={3} hAlign="stretch" xstyle={styles.box}>
      <HStack gap={4} hAlign="between" vAlign="center" wrap="wrap" xstyle={styles.head}>
        <VStack gap={0.5}>
          <Text weight="semibold" as="p" xstyle={styles.title}>
            Passkeys
          </Text>
          <Text type="supporting" color="secondary" xstyle={styles.description}>
            Sign in with your fingerprint, face or screen lock.
          </Text>
        </VStack>
        <SettingsButton
          tone="white"
          label={processing ? 'Waiting for your device…' : 'Add a passkey'}
          isLoading={processing}
          onClick={addPasskey}
        />
      </HStack>

      {passkeys.length > 0 ? (
        <List aria-label="Passkeys" edge="flush">
          {passkeys.map((passkey) => (
            <PasskeyRow key={passkey.id} passkey={passkey} />
          ))}
        </List>
      ) : (
        <Text type="supporting" color="secondary" xstyle={styles.description}>
          You have not added any passkeys yet.
        </Text>
      )}

      {error && <Banner status="error" title={error} role="alert" />}
    </VStack>
  )
}
