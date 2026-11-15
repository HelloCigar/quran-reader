import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { sendSignal } from '@simplewebauthn/browser'

/**
 * Forwards the flashed passkey signals to the browser, which passes them on
 * to the password manager so it drops passkeys the app no longer accepts.
 * Renders nothing. Browsers without the Signal API throw, which is safe to
 * ignore.
 */
export default function PasskeySignals() {
  const { flash } = usePage()

  useEffect(() => {
    for (const signal of flash.passkeySignals ?? []) {
      sendSignal(signal).catch(() => {})
    }
  }, [flash])

  return null
}
