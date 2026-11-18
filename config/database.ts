import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries: a local SQLite file in
   * development and tests, Turso (libSQL) in production.
   */
  connection: env.get('DB_CONNECTION', 'sqlite'),

  connections: {
    /**
     * SQLite connection (development and tests).
     */
    sqlite: {
      client: 'better-sqlite3',

      connection: {
        /**
         * Database file location. Each test shard (`npm run test:shards`)
         * gets its own file, so the shards can run at the same time.
         */
        filename: app.tmpPath(
          app.inTest ? `db.test${env.get('TEST_SHARD') ?? ''}.sqlite3` : 'db.sqlite3'
        ),
      },

      /**
       * Required by Knex for SQLite defaults.
       */
      useNullAsDefault: true,

      migrations: {
        /**
         * Sort migration files naturally by filename.
         */
        naturalSort: true,

        /**
         * Paths containing migration files.
         */
        paths: ['database/migrations'],
      },

      schemaGeneration: {
        enabled: true,
        rulesPaths: ['./database/schema_rules.js'],
        /**
         * The cache L2 table belongs to @adonisjs/cache; nothing reads it through Lucid.
         */
        excludeTables: ['cache'],
      },
    },

    /**
     * PostgreSQL connection.
     * Install package to switch: npm install pg
     */
    // pg: {
    //   client: 'pg',
    //   connection: {
    //     host: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   schemaGeneration: {
    //     enabled: true,
    //     rulesPaths: ['./database/schema_rules.js'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * MySQL / MariaDB connection.
     * Install package to switch: npm install mysql2
     */
    // mysql: {
    //   client: 'mysql2',
    //   connection: {
    //     host: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   schemaGeneration: {
    //     enabled: true,
    //     rulesPaths: ['./database/schema_rules.js'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * Microsoft SQL Server connection.
     * Install package to switch: npm install tedious
     */
    // mssql: {
    //   client: 'mssql',
    //   connection: {
    //     server: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   schemaGeneration: {
    //     enabled: true,
    //     rulesPaths: ['./database/schema_rules.js'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * libSQL (Turso) connection, used in production. The driver
     * (`@libsql/sqlite3`) takes the auth token in the URL. The connection
     * opens on first use, so the URL may be unset when it is not the default.
     */
    libsql: {
      client: 'libsql',
      connection: {
        filename: `${env.get('LIBSQL_URL', '')}?authToken=${env.get('LIBSQL_AUTH_TOKEN')?.release() ?? ''}`,
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      /**
       * `database/schema.ts` is generated from the local SQLite database.
       */
      schemaGeneration: {
        enabled: false,
      },
    },
  },
})

export default dbConfig
