import { createContext } from 'react'

/**
 * Where a phone's Save changes bar renders: an element of `SettingsLayout`
 * outside the panel, so the fixed bar is not inside the panel's entrance.
 * It is `null` until the layout has mounted.
 */
export const SaveBarHost = createContext<HTMLElement | null>(null)
