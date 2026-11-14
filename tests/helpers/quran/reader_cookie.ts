import env from '#start/env'

/**
 * A reading-page choice (`reader_sidebar`, `reader_sidebar_mode`) as the page
 * writes it: a raw cookie, which `setPlainCookie` would encode. Pass it to
 * `browserContext.addCookies`.
 */
export function readerCookie(name: string, value: string) {
  return { name, value, url: env.get('APP_URL') }
}
