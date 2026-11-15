import app from '@adonisjs/core/services/app'
import { errors as limiterErrors } from '@adonisjs/limiter'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well. They are also on in tests,
   * so the browser tests cover the pages production users see.
   */
  protected renderStatusPages = app.inProduction || app.inTest

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (_, { inertia }) => inertia.render('errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * A throttled form submission (sign-in, sign-up, password reset) would
     * otherwise answer the Inertia visit with a plain-text 429, which shows
     * the reader nothing they can act on. Report it like any other form
     * error instead. JSON requests keep the 429 status.
     */
    if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS && ctx.request.header('x-inertia')) {
      const minutes = Math.max(1, Math.ceil(error.response.availableIn / 60))
      ctx.session.flash(
        'error',
        `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}`
      )
      return ctx.response.redirect().back()
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
