/**
 * In development, StyleX serves the CSS for the app's own `stylex.create()`
 * calls from `/virtual:stylex.css`. AdonisJS renders the HTML shell from Edge
 * (not Vite's index.html), so the StyleX runtime that loads and hot-reloads
 * that stylesheet is imported here instead. Production builds bundle the CSS
 * into the regular Vite assets, so this is a no-op there.
 */
if (import.meta.env.DEV) {
  void import('virtual:stylex:runtime')
}
