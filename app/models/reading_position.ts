import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { ReadingPositionSchema } from '#database/schema'
import User from '#models/user'

/**
 * The Ayah a reader last reached. Each reader has at most one.
 */
export default class ReadingPosition extends ReadingPositionSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
