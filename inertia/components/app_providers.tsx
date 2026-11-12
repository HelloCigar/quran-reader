import { type ReactNode } from 'react'
import { Theme } from '@astryxdesign/core/theme'
import { LinkProvider } from '@astryxdesign/core/Link'
import { LayerProvider } from '@astryxdesign/core/Layer'
import { themes, defaultThemeSlug } from '../../astryx-themes'
import InertiaLink from '~/components/navigation/inertia_link'
import NavigationProgress from '~/components/navigation/navigation_progress'
import { ThemePreferenceProvider, type ThemePreference } from '~/components/theme/theme_preference'

/**
 * Wraps every page: applies the Astryx theme in the chosen mode, hosts
 * overlays (toasts, popovers), routes all Astryx links through Inertia, and
 * renders the navigation progress bar. (Flash toasts read the page, so each
 * layout renders `FlashToasts` inside the Inertia app.)
 */
export default function AppProviders({
  initialPreference,
  children,
}: {
  initialPreference: ThemePreference
  children: ReactNode
}) {
  return (
    <ThemePreferenceProvider initialPreference={initialPreference}>
      {(preference) => (
        <Theme theme={themes[defaultThemeSlug]} mode={preference}>
          <LayerProvider>
            <LinkProvider component={InertiaLink}>
              <NavigationProgress />
              {children}
            </LinkProvider>
          </LayerProvider>
        </Theme>
      )}
    </ThemePreferenceProvider>
  )
}
