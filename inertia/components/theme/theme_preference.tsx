import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/** The mode passed to Astryx's `Theme`. `system` follows the OS. */
export type ThemePreference = 'light' | 'dark' | 'system'

const COOKIE = 'app_theme'
const ONE_YEAR = 60 * 60 * 24 * 365

const ThemePreferenceContext = createContext<{
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}>({ preference: 'system', setPreference: () => {} })

/**
 * The color mode the user picked. Stored in the `app_theme` cookie, which the
 * Inertia middleware shares back as `preferences.theme` and the Edge shell
 * applies before the app loads. Read the mode actually in effect with
 * Astryx's `useTheme().mode`.
 */
export function useThemePreference() {
  return useContext(ThemePreferenceContext)
}

/**
 * Holds the color mode preference and persists changes to the cookie. The
 * render prop receives the current preference, to pass to Astryx's `Theme`.
 */
export function ThemePreferenceProvider({
  initialPreference,
  children,
}: {
  initialPreference: ThemePreference
  children: (preference: ThemePreference) => ReactNode
}) {
  const [preference, setPreferenceState] = useState(initialPreference)

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    document.documentElement.style.colorScheme = next === 'system' ? 'light dark' : next
  }, [])

  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference])

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children(preference)}
    </ThemePreferenceContext.Provider>
  )
}
