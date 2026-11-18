/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // Tests: the shard this process runs, set by `bin/test_shards.ts`
  TEST_SHARD: Env.schema.number.optional(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Database: `sqlite` (local file, the default) or `libsql` (Turso)
  DB_CONNECTION: Env.schema.enum.optional(['sqlite', 'libsql'] as const),
  LIBSQL_URL: Env.schema.string.optional(),
  LIBSQL_AUTH_TOKEN: Env.schema.secret.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Quran Foundation (the source of the Quran text)
  QURAN_FOUNDATION_CLIENT_ID: Env.schema.string(),
  QURAN_FOUNDATION_CLIENT_SECRET: Env.schema.secret(),
  QURAN_FOUNDATION_ENV: Env.schema.enum(['prelive', 'production'] as const),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  MAIL_MAILER: Env.schema.enum(['smtp'] as const),
  MAIL_FROM_NAME: Env.schema.string(),
  MAIL_FROM_ADDRESS: Env.schema.string(),
  MAIL_BRAND_NAME: Env.schema.string.optional(),
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.secret.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
  /*
  |----------------------------------------------------------
  | Passkeys: the domain they are bound to, and the origins
  | allowed to register and use them. PASSKEY_RP_ID must not
  | change once users have registered passkeys.
  |----------------------------------------------------------
  */
  PASSKEY_RP_ID: Env.schema.string({ format: 'host' }),
  PASSKEY_ORIGINS: Env.schema.string(),

  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),
})
