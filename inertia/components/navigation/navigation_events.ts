import { useEffect, useEffectEvent } from 'react'
import { router } from '@inertiajs/react'
import type { GlobalEvent, GlobalEventNames, GlobalEventResult } from '@inertiajs/core'

/**
 * Subscribes to an Inertia navigation event (`start`, `finish`, `navigate`,
 * ...) for the lifetime of the component.
 *
 * This is the one place the app reaches for Inertia's own `router`: the
 * type-safe router from `@adonisjs/inertia/react` covers visits, not events.
 */
export function useNavigationEvent<Name extends GlobalEventNames>(
  name: Name,
  callback: (event: GlobalEvent<Name>) => GlobalEventResult<Name>
) {
  const onEvent = useEffectEvent(callback)

  useEffect(() => router.on(name, (event) => onEvent(event)), [name])
}
