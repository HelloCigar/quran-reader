import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BookmarkSchema } from '#database/schema'
import User from '#models/user'

export default class Bookmark extends BookmarkSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * The bookmarks list order: most recently bookmarked first. `id` breaks
   * ties between bookmarks made in the same second.
   */
  static newestFirst = scope((query) => {
    query.orderBy('created_at', 'desc').orderBy('id', 'desc')
  })
}
