import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { updateReadingPositionValidator } from '#validators/reading_position'

/**
 * The signed-in reader's own Reading Position. The reader page saves it in the
 * background as they read, so `update` answers with an empty response.
 */
export default class ReadingPositionController {
  async update({ request, auth }: HttpContext) {
    const { surah, ayah } = await request.validateUsing(updateReadingPositionValidator)
    const user = auth.getUserOrFail()
    const client = db.connection()
    // Written as the models write their timestamps.
    const now = DateTime.now().toFormat(client.dialect.dateTimeFormat)

    // `user_id` is unique: a reader's first save creates their row, every later one overwrites it.
    await client
      .table('reading_positions')
      .insert({
        user_id: user.id,
        surah_number: surah,
        ayah_number: ayah,
        created_at: now,
        updated_at: now,
      })
      .onConflict('user_id')
      .merge(['surah_number', 'ayah_number', 'updated_at'])
  }
}
