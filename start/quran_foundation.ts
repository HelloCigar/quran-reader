import { Language } from '@quranjs/api'
import { createServerClient } from '@quranjs/api/server'
import env from '#start/env'

const REQUEST_TIMEOUT_MS = 10_000

/**
 * Quran Foundation's prelive environment. Production is the SDK's default.
 */
const PRELIVE = {
  gatewayUrl: 'https://apis-prelive.quran.foundation',
  contentBaseUrl: 'https://apis-prelive.quran.foundation/content',
  oauth2BaseUrl: 'https://prelive-oauth2.quran.foundation',
}

/**
 * The Quran Foundation Content API, the only source of Quran text
 * (docs/adr/0001). The SDK fetches and renews the client-credentials token.
 * Every request asks for English and times out after 10 seconds.
 */
export const quranFoundation = createServerClient({
  clientId: env.get('QURAN_FOUNDATION_CLIENT_ID'),
  clientSecret: env.get('QURAN_FOUNDATION_CLIENT_SECRET').release(),
  contentScopeMode: 'granular',
  defaults: { language: Language.ENGLISH },
  services: env.get('QURAN_FOUNDATION_ENV') === 'prelive' ? PRELIVE : undefined,
  fetch: (input, init) =>
    fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }),
})
