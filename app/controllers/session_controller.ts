import User from '#models/user'
import { loginValidator } from '#validators/user'
import { carriedBookmarkValidator } from '#validators/bookmark'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'

export default class SessionController {
  async create({ inertia, request }: HttpContext) {
    const payload = await request.validateUsing(carriedBookmarkValidator)

    return inertia.render('auth/login', { bookmark: payload.bookmark ?? null })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password, bookmark } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)

    // Kept only after login succeeds, so failed credentials create nothing.
    if (bookmark) {
      await user.keepBookmark(bookmark.surah, bookmark.ayah)
      // A stale intended URL must not hijack a later sign-in.
      session.clearIntendedUrl()
      return response
        .redirect()
        .toRoute('surahs.show', { number: bookmark.surah }, { qs: { note: bookmark.ayah } })
    }

    return response.redirect().toIntended(urlFor('dashboard'))
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
