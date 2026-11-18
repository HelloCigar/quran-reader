import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE'),
  stores: {
    /**
     * Database store, used in development: the rate limits live in the
     * local SQLite file.
     */
    database: stores.database({
      tableName: 'rate_limits',
    }),

    /**
     * Redis store, used in production: the database store cannot use
     * libSQL. Never call `limiter.clear()` on it; that flushes the Redis
     * database the cache shares.
     */
    redis: stores.redis({ connectionName: 'main' }),

    /**
     * Memory store could be used during
     * testing
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
