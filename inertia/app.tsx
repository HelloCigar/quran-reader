import '@astryxdesign/core/reset.css'
import '@astryxdesign/core/astryx.css'
// Self-hosted fonts named by the Quran theme (Astryx never loads font files).
import '@fontsource-variable/figtree'
import '@fontsource-variable/fraunces'
import '@fontsource/amiri/400.css'
import '@fontsource/amiri/700.css'
import './stylex_dev'
import { client } from './client'
import { createRoot } from 'react-dom/client'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import AppProviders from '~/components/app_providers'

const appName = import.meta.env.VITE_APP_NAME || 'Quran Reader'

void createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob<{ default: ResolvedComponent }>('./pages/**/*.tsx')
    )
    return page.default
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <AppProviders initialPreference={props.initialPage.props.preferences?.theme ?? 'system'}>
          <App {...props} />
        </AppProviders>
      </TuyauProvider>
    )
  },
  /**
   * Page loads show an Astryx ProgressBar instead (`NavigationProgress`).
   */
  progress: false,
})
