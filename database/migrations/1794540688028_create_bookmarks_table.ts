import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookmarks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable().unsigned().references('users.id').onDelete('CASCADE')
      table.integer('surah_number').notNullable().checkBetween([1, 114])
      table.integer('ayah_number').notNullable().checkPositive()
      table.text('note').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'surah_number', 'ayah_number'], {
        indexName: 'bookmarks_user_ayah_unique',
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
