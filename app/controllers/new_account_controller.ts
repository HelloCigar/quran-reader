import User from '#models/user'
import { signupValidator } from '#validators/user'
import { carriedBookmarkValidator } from '#validators/bookmark'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'

export default class NewAccountController {
  async create({ inertia, request }: HttpContext) {
    const payload = await request.validateUsing(carriedBookmarkValidator)

    return inertia.render('auth/signup', { bookmark: payload.bookmark ?? null })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const { fullName, email, password, bookmark } = await request.validateUsing(signupValidator)
    const user = await User.create({ fullName, email, password })

    await auth.use('web').login(user)

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
}
