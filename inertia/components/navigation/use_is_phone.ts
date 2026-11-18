import { useSyncExternalStore } from 'react'

/** The phone breakpoint the pages share (`page_layout.tsx`). */
const PHONE = '(max-width: 600px)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * Whether the screen is a phone's width, read on the first render too. (Astryx's
 * `useMediaQuery` always starts `false`.) A server render, should one run,
 * assumes a wide screen. Use it where the markup differs between the two; where
 * only the look differs, a `@media (max-width: 600px)` in the styles is enough.
 */
export default function useIsPhone() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE).matches,
    () => false
  )
}
