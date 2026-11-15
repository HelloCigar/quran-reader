import type { HttpContext } from '@adonisjs/core/http'
import { changePasswordValidator } from '#validators/user'

export default class AccountPasswordController {
  async update({ response, auth, session, request }: HttpContext) {
    const payload = await request.validateUsing(changePasswordValidator)

    const user = auth.getUserOrFail()
    await user.validatePassword(payload.currentPassword)

    user.password = payload.password
    await user.save()

    session.flash('success', 'Password updated successfully')
    response.redirect().back()
  }
}
