import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { passwordPolicy } from '#validators/password_policy'
import PasskeyTransformer from '#transformers/passkey_transformer'

export default class SecurityController {
  async show({ auth, inertia }: HttpContext) {
    const user = auth.getUserOrFail()
    const passkeys = await User.passkeys.all(user)

    return inertia.render('settings/security', {
      passwordPolicy,
      passkeys: PasskeyTransformer.transform(passkeys),
    })
  }
}
