import { useState } from 'react'
import { KeyIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/20/solid'
import type { Data } from '@generated/data'
import { Form, useHttp, useRouter } from '@adonisjs/inertia/react'
import { startRegistration, WebAuthnError } from '@simplewebauthn/browser'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { TextInput } from '@astryxdesign/core/TextInput'
import { List, ListItem } from '@astryxdesign/core/List'
import { Icon } from '@astryxdesign/core/Icon'
import { Banner } from '@astryxdesign/core/Banner'
import { EmptyState } from '@astryxdesign/core/EmptyState'

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
const formatDate = (value: string | null) => (value ? dateFormat.format(new Date(value)) : null)

/** One passkey: its name and dates, with Rename and Remove; Rename edits it in place. */
function PasskeyRow({ passkey }: { passkey: Data.Passkey }) {
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(passkey.name)

  if (renaming) {
    return (
      <ListItem
        label={
          <Form
            options={{ preserveScroll: true }}
            route="passkeys.update"
            routeParams={{ id: passkey.id }}
            onSuccess={() => setRenaming(false)}
          >
            {({ errors, processing }) => (
              <HStack gap={2} vAlign="end" wrap="wrap">
                <TextInput
                  label="Passkey name"
                  htmlName="name"
                  value={name}
                  onChange={setName}
                  hasAutoFocus
                  status={errors.name ? { type: 'error', message: errors.name } : undefined}
                />
                <Button
                  type="submit"
                  label={processing ? 'Saving…' : 'Save'}
                  variant="primary"
                  isLoading={processing}
                />
                <Button
                  label="Cancel"
                  variant="ghost"
                  onClick={() => {
                    setName(passkey.name)
                    setRenaming(false)
                  }}
                />
              </HStack>
            )}
          </Form>
        }
      />
    )
  }

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
      description={`Added ${formatDate(passkey.createdAt)} · ${
        passkey.lastUsedAt ? `Last used ${formatDate(passkey.lastUsedAt)}` : 'Never used'
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
    <VStack gap={4} hAlign="stretch">
      <VStack gap={1}>
        <Heading level={2}>Passkeys</Heading>
        <Text type="supporting" color="secondary">
          Sign in with your fingerprint, face, or screen lock instead of a password. Passkeys are
          stored by your device or password manager and cannot be phished.
        </Text>
      </VStack>

      {passkeys.length > 0 ? (
        <List aria-label="Passkeys" edge="flush">
          {passkeys.map((passkey) => (
            <PasskeyRow key={passkey.id} passkey={passkey} />
          ))}
        </List>
      ) : (
        <EmptyState
          isCompact
          icon={<Icon icon={KeyIcon} size="lg" color="secondary" />}
          title="You have not added any passkeys yet."
        />
      )}

      {error && <Banner status="error" title={error} role="alert" />}

      <HStack>
        <Button
          label={processing ? 'Waiting for your device…' : 'Add a passkey'}
          variant="secondary"
          icon={<Icon icon={PlusIcon} />}
          isLoading={processing}
          onClick={addPasskey}
        />
      </HStack>
    </VStack>
  )
}
