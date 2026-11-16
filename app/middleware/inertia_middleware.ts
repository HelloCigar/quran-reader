import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UserTransformer from '#transformers/user_transformer'
import SurahTransformer from '#transformers/surah_transformer'
import QuranTextService from '#services/quran_text_service'
import QuranUnavailableException from '#exceptions/quran_unavailable_exception'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import type { PasskeySignal } from '@adonisplus/persona/passkeys/types'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  share(ctx: HttpContext) {
    /**
     * The share method is called everytime an Inertia page is rendered. In
     * certain cases, a page may get rendered before the session middleware
     * or the auth middleware are executed. For example: During a 404 request.
     *
     * In that case, we must always assume that HttpContext is not fully hydrated
     * with all the properties
     */
    const { auth, request } = ctx as Partial<HttpContext>

    /**
     * The color mode picked with the theme toggle. Without a choice the app
     * follows the operating system.
     */
    const storedTheme = request?.plainCookie('app_theme', { encoded: false })
    const theme: 'light' | 'dark' | 'system' =
      storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'system'

    /**
     * The reader's sidebar choices, kept in cookies the page writes, so every
     * page renders with them in place. An unknown value is the default.
     */
    const sidebar = {
      isShown: request?.plainCookie('reader_sidebar', { encoded: false }) !== 'hidden',
      mode:
        request?.plainCookie('reader_sidebar_mode', { encoded: false }) === 'surah'
          ? ('surah' as const)
          : ('verse' as const),
    }

    /**
     * Data shared with all Inertia pages. Make sure you are using
     * transformers for rich data-types like Models.
     */
    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      user: ctx.inertia.always(auth?.user ? UserTransformer.transform(auth.user) : undefined),
      preferences: ctx.inertia.always({ theme, sidebar }),
      /**
       * Every Surah, for the Surah and Ayah sidebar off a Surah's page (which
       * passes its own `surahs`). Loaded by a partial reload the first time
       * the sidebar's drawer opens; the client keeps it from then on. `null`
       * when the Quran text is unavailable.
       */
      sidebarSurahs: ctx.inertia
        .optional(async () => {
          const quranText = await ctx.containerResolver.make(QuranTextService)
          try {
            const surahs = await quranText.listSurahs()
            return SurahTransformer.transform(surahs).useVariant('forNavigation')
          } catch (error) {
            if (error instanceof QuranUnavailableException) return null
            throw error
          }
        })
        .once(),
    }
  }

  flash(ctx: HttpContext) {
    /**
     * Flash messages travel in the dedicated `flash` field of the page
     * object instead of props, and the client strips them from history
     * state so they never reappear when navigating back.
     */
    const { session } = ctx as Partial<HttpContext>

    const success: string | undefined = session?.flashMessages.get('success')
    const error: string | undefined = session?.flashMessages.get('error')
    const passkeySignals: PasskeySignal[] | undefined = session?.flashMessages.get('passkeySignals')
    /** The Ayah just bookmarked, whose note the Surah's page asks for. */
    const noteFor: number | undefined = session?.flashMessages.get('noteFor')

    return { success, error, passkeySignals, noteFor }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()
    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
