import type User from '#models/user'
import { appUrl } from '#config/app'
import { BaseMail } from '@adonisjs/mail'
import { urlFor } from '@adonisjs/core/services/url_builder'
import type { PasswordResetToken } from '@adonisplus/persona/password'

export default class PasswordResetProvision extends BaseMail {
  subject = 'Reset your account password'
  template = 'emails/reset_password'

  constructor(
    public user: User,
    public token: PasswordResetToken
  ) {
    super()
  }

  prepare() {
    this.message.to(this.user.email).htmlView(this.template, {
      title: this.subject,
      passwordResetLink: urlFor('password_resets.show', [this.token.value!.release()], {
        prefixUrl: appUrl,
      }),
    })
  }
}
