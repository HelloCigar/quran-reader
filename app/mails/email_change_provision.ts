import type User from '#models/user'
import { appUrl } from '#config/app'
import { BaseMail } from '@adonisjs/mail'
import { urlFor } from '@adonisjs/core/services/url_builder'
import type { EmailVerificationToken } from '@adonisplus/persona/email'

export default class EmailChangeProvision extends BaseMail {
  subject = 'Confirm your email address'
  template = 'emails/change_email'

  constructor(
    public user: User,
    public token: EmailVerificationToken
  ) {
    super()
  }

  prepare() {
    this.message.to(this.token.email).htmlView(this.template, {
      title: this.subject,
      oldEmail: this.user.email,
      newEmail: this.user.unverifiedEmail!,
      verificationLink: urlFor('email_verifications.show', [this.token.value!.release()], {
        prefixUrl: appUrl,
      }),
    })
  }
}
