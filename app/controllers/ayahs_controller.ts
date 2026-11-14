import type { HttpContext } from '@adonisjs/core/http'
import { showAyahValidator } from '#validators/ayah'

export default class AyahsController {
  /**
   * The Ayah an Ayah Reference names: its Surah, opened at that Ayah, as a
   * Bookmark's link opens it.
   */
  async show({ request, response }: HttpContext) {
    const { reference } = await request.validateUsing(showAyahValidator)

    return response
      .redirect()
      .toRoute('surahs.show', { number: reference.surah }, { qs: { ayah: reference.ayah } })
  }
}
