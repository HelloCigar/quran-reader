import { useEffect, useRef } from 'react'
import { usePage } from '@inertiajs/react'
import { useToast } from '@astryxdesign/core/Toast'
import { useNavigationEvent } from '~/components/navigation/navigation_events'

/**
 * Shows the `success` and `error` flash messages from the server as Astryx
 * toasts, and dismisses the current one when the next visit starts. Render
 * it once in each layout.
 */
export default function FlashToasts() {
  const { flash } = usePage()
  const showToast = useToast()
  const dismissRef = useRef<(() => void) | null>(null)

  useNavigationEvent('start', () => dismissRef.current?.())

  useEffect(() => {
    const message = flash.error ?? flash.success
    if (!message) return

    dismissRef.current = showToast({
      body: message,
      type: flash.error ? 'error' : 'info',
      uniqueID: 'flash',
    })
  }, [flash, showToast])

  return null
}
