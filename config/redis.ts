import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'
import type { InferConnections } from '@adonisjs/redis/types'

/**
 * Hosted Redis hands out one URL. ioredis takes options, so the URL is split
 * here. Connections open on first use, so the fallback is never dialled while
 * every store stays on the database.
 */
const redisUrl = new URL(env.get('REDIS_URL') || 'redis://127.0.0.1:6379')

const redisConfig = defineConfig({
  connection: 'main',

  connections: {
    /**
     * Holds the rate limits and the cache's L2 in production.
     */
    main: {
      host: redisUrl.hostname,
      port: Number(redisUrl.port || 6379),
      username: decodeURIComponent(redisUrl.username) || undefined,
      password: decodeURIComponent(redisUrl.password) || undefined,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
      /**
       * Resolve IPv4 and IPv6: Railway's private network is IPv6 only.
       */
      family: 0,
      db: 0,
      keyPrefix: '',
      retryStrategy(times) {
        return times > 10 ? null : times * 50
      },
    },
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
