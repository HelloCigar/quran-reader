import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import { passkeyAuthenticationValidator } from '#validators/user'

export default class PasskeySessionController {
  async store({ auth, request, response, session }: HttpContext) {
    const { response: credential, bookmark } = await request.validateUsing(
      passkeyAuthenticationValidator
    )
    const user = await User.verifyPasskeyLogin(credential)

    await auth.use('web').login(user)
    session.flash('passkeySignals', await user.getPasskeySignals())
    response.plainCookie('last_login_method', 'passkey', { maxAge: '60 days' })

    // Kept only after the passkey is verified, as with a password sign-in.
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
