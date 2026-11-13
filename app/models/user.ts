import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Bookmark from '#models/bookmark'

/**
 * Unique-constraint violation codes for SQLite, PostgreSQL and MySQL.
 */
const UNIQUE_VIOLATION_CODES = new Set(['SQLITE_CONSTRAINT_UNIQUE', '23505', 'ER_DUP_ENTRY'])

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @hasMany(() => Bookmark)
  declare bookmarks: HasMany<typeof Bookmark>

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }

  /**
   * Keeps the reader's bookmark on an ayah: returns the existing one, or
   * creates it. Never creates a second row and never touches an existing
   * row's note or creation time. A concurrent insert that wins the
   * `bookmarks_user_ayah_unique` race is re-read instead.
   */
  async keepBookmark(this: User, surah: number, ayah: number): Promise<Bookmark> {
    try {
      return await this.related('bookmarks').firstOrCreate({
        surahNumber: surah,
        ayahNumber: ayah,
      })
    } catch (error) {
      if (!UNIQUE_VIOLATION_CODES.has((error as { code?: string }).code ?? '')) throw error

      return this.related('bookmarks')
        .query()
        .where('surah_number', surah)
        .where('ayah_number', ayah)
        .firstOrFail()
    }
  }
}
