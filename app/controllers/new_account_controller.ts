import User from '#models/user'
import mail from '@adonisjs/mail/services/main'
import { signupValidator } from '#validators/user'
import { carriedBookmarkValidator } from '#validators/bookmark'
import type { HttpContext } from '@adonisjs/core/http'
import { passwordPolicy } from '#validators/password_policy'
import AccountActivationProvision from '#mails/account_activation_provision'

export default class NewAccountController {
  async create({ inertia, request }: HttpContext) {
    const payload = await request.validateUsing(carriedBookmarkValidator)

    return inertia.render('auth/signup', {
      bookmark: payload.bookmark ?? null,
      passwordPolicy,
    })
  }

  async store({ request, response, auth, session }: HttpContext) {
    const { fullName, email, password, bookmark } = await request.validateUsing(signupValidator)

    const { user, token } = await User.transaction(async (trx) => {
      const newUser = await User.create(
        { fullName, email, password, unverifiedEmail: email },
        { client: trx }
      )
      const verificationToken = await newUser.createEmailVerificationToken()
      return { user: newUser, token: verificationToken }
    })

    await mail.sendLater(new AccountActivationProvision(user, token))

    await auth.use('web').login(user)
    response.plainCookie('last_login_method', 'email', { maxAge: '60 days' })

    if (bookmark) {
      await user.keepBookmark(bookmark.surah, bookmark.ayah)
      // A stale intended URL must not hijack a later sign-in.
      session.clearIntendedUrl()
      return response
        .redirect()
        .toRoute('surahs.show', { number: bookmark.surah }, { qs: { note: bookmark.ayah } })
    }

    return response.redirect().toRoute('email_verifications.create')
  }
}
