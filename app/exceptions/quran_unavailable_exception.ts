import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class QuranUnavailableException extends Exception {
  static status = 503
  static code = 'E_QURAN_UNAVAILABLE'

  constructor(
    message = "The Quran text couldn't be loaded right now. Please try again in a moment.",
    options?: { cause?: unknown }
  ) {
    super(message, options)
  }

  async handle(_error: this, ctx: HttpContext) {
    /**
     * The error path does not send a handler's return value (only route
     * handlers get that), so the rendered page is sent explicitly.
     */
    const page = await ctx.inertia.render('errors/quran_unavailable', { message: this.message })
    ctx.response.status(QuranUnavailableException.status).send(page)
  }

  async report(_error: this, ctx: HttpContext) {
    ctx.logger.warn({ err: this.cause }, 'Quran text unavailable')
  }
}
