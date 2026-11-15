import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Each reader's Reading Position: the one Ayah they last reached. A reader
 * has at most one row, overwritten as they read.
 */
export default class extends BaseSchema {
  protected tableName = 'reading_positions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .unique()
        .references('users.id')
        .onDelete('CASCADE')
      table.integer('surah_number').notNullable()
      table.integer('ayah_number').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
