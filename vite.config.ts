import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { unplugin as stylex } from '@stylexjs/unplugin'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    /**
     * Compiles the app's own `stylex.create()` calls. Astryx components use
     * the prebuilt `@astryxdesign/core/astryx.css`, as in Astryx's
     * `example-nextjs-stylex`:
     *
     * - `classNamePrefix: 'p'` keeps app classes from colliding with Astryx's
     *   prebuilt `x…` atoms (a shared class would pull an Astryx style out of
     *   its layer, above theme overrides).
     * - `useCSSLayers.before` declares Astryx's layers first, so app styles
     *   win over component defaults and theme overrides.
     *
     * In development the CSS is served from `/virtual:stylex.css` and loaded
     * by `inertia/stylex_dev.ts`.
     */
    stylex.vite({
      dev: process.env.NODE_ENV !== 'production',
      classNamePrefix: 'p',
      useCSSLayers: { before: ['reset', 'astryx-base', 'astryx-theme'] },
      treeshakeCompensation: true,
      unstable_moduleResolution: { type: 'commonJS', rootDir: import.meta.dirname },
    }),
    react(),
    adonisjs({ entryPoints: ['inertia/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${import.meta.dirname}/inertia/`,
      '@generated': `${import.meta.dirname}/.adonisjs/client/`,
    },
  },

  server: {
    /**
     * Let ngrok tunnels reach the dev server, so the app can be opened from
     * another device (`ngrok http 3333`).
     */
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.dev'],
    watch: {
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
