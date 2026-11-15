import mail from '@adonisjs/mail/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/user'
import EmailChangeProvision from '#mails/email_change_provision'
import AccountActivationProvision from '#mails/account_activation_provision'

export default class ProfileController {
  show({ inertia }: HttpContext) {
    return inertia.render('settings/profile', {})
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()

    const { email, ...rest } = await request.validateUsing(updateProfileValidator, {
      meta: {
        userId: user.id,
      },
    })

    const { lockedUser, token } = await user.lockForUpdate(async (locked) => {
      if (!locked.hasEmailChanged(email)) {
        await locked.merge(rest).save()
        return { lockedUser: locked }
      }

      if (locked.hasEmailReverted(email)) {
        locked.unverifiedEmail = null
        await locked.merge(rest).save()
        return { lockedUser: locked }
      }

      await locked.withEmail(email).merge(rest).save()
      const verificationToken = await locked.createEmailVerificationToken()
      return { lockedUser: locked, token: verificationToken }
    })

    if (token) {
      await mail.sendLater(
        lockedUser.hasInactiveAccount
          ? new AccountActivationProvision(lockedUser, token)
          : new EmailChangeProvision(lockedUser, token)
      )
    }

    session.flash('success', 'Profile updated successfully')
    return response.redirect().back()
  }
}
