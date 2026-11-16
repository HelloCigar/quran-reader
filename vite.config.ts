import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite-plus'
import react from '@vitejs/plugin-react'
import { unplugin as stylex } from '@stylexjs/unplugin'
import adonisjs from '@adonisjs/vite/client'

/**
 * Reads an Oxc config file without its `$schema` key. `.oxfmtrc.json` and
 * `.oxlintrc.json` stay the source of truth, because editors and the bare
 * `oxfmt` / `oxlint` binaries read them.
 */
function oxcConfig(file: string) {
  const { $schema: _, ...config } = JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'))
  return config
}

export default defineConfig({
  /**
   * Vite+ reads `fmt` and `lint` from here and ignores the JSON files unless
   * `-c` names them. Without these blocks a bare `vp fmt`, `vp lint` or
   * `vp check` falls back to defaults (semicolons, double quotes, no ignores)
   * and rewrites the whole repo.
   */
  fmt: oxcConfig('./.oxfmtrc.json'),
  lint: oxcConfig('./.oxlintrc.json'),

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

  /**
   * There is no index.html for Vite to crawl, so without entries it finds
   * dependencies one page at a time (each `@astryxdesign/core/<Component>`
   * subpath), re-bundles, and fails the requests already in flight with
   * "504 Outdated Optimize Dep". Scanning the entry and every page up front
   * bundles them all in one pass at startup.
   */
  optimizeDeps: {
    entries: ['inertia/app.tsx', 'inertia/pages/**/*.tsx'],
  },

  /**
   * The browser tests start their own Vite server. A separate cache keeps it
   * from renaming `node_modules/.vite/deps` while the dev server holds it,
   * which fails on Windows with EPERM. Each test shard (`npm run
   * test:shards`) gets its own for the same reason.
   */
  cacheDir:
    process.env.NODE_ENV === 'test'
      ? `node_modules/.vite-test${process.env.TEST_SHARD ?? ''}`
      : 'node_modules/.vite',

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
