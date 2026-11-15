import { useState } from 'react'
import { FingerPrintIcon } from '@heroicons/react/20/solid'
import { startAuthentication } from '@simplewebauthn/browser'
import { useHttp, useRouter } from '@adonisjs/inertia/react'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { Banner } from '@astryxdesign/core/Banner'
import { Icon } from '@astryxdesign/core/Icon'

/**
 * Signs in with a passkey: the device lists the accounts it holds for the
 * site, so there is no email to type.
 */
export default function PasskeySignIn() {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const challenge = useHttp({ route: 'passkey_login_challenges.store' })

  async function signIn() {
    setProcessing(true)
    setError(null)

    try {
      const optionsJSON = await challenge.submit()
      const response = await startAuthentication({ optionsJSON })

      router.post(
        { route: 'passkey_session.store' },
        { response },
        { preserveScroll: true, onFinish: () => setProcessing(false) }
      )
    } catch (caught) {
      setProcessing(false)

      // The user dismissed the prompt or it timed out: a cancellation, not an error.
      if (caught instanceof Error && caught.name === 'NotAllowedError') {
        return
      }

      setError('Unable to sign in with this passkey')
    }
  }

  return (
    <VStack gap={2} hAlign="stretch">
      {error && <Banner status="error" title={error} role="alert" />}
      <Button
        label={processing ? 'Waiting for your device…' : 'Sign in with a passkey'}
        variant="secondary"
        size="lg"
        icon={<Icon icon={FingerPrintIcon} />}
        isLoading={processing}
        onClick={signIn}
      />
    </VStack>
  )
}
