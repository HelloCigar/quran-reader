import type User from '#models/user'
import { BaseMail } from '@adonisjs/mail'

export default class PasskeyChangedNotification extends BaseMail {
  declare subject: string

  constructor(
    public user: User,
    public event: 'added' | 'removed',
    public passkeyName: string
  ) {
    super()
    switch (event) {
      case 'added':
        this.subject = 'A passkey was added to your account'
        break
      case 'removed':
        this.subject = 'A passkey was removed from your account'
        break
    }
  }

  prepare() {
    this.message.to(this.user.email).htmlView('emails/passkey_changed', {
      title: this.subject,
      event: this.event,
      passkeyName: this.passkeyName,
    })
  }
}
