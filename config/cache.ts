import env from '#start/env'
import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  /**
   * `database` in development and tests, `redis` in production.
   */
  default: env.get('CACHE_STORE', 'database'),

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    /**
     * Memory L1 in front of a SQLite L2. The `cache` table is created by a
     * migration, never by the driver. No bus: it runs in one process.
     */
    database: store()
      .useL1Layer(drivers.memory())
      .useL2Layer(
        drivers.database({
          connectionName: 'sqlite',
          autoCreateTable: false,
          tableName: 'cache',
        })
      ),

    /**
     * Memory L1 in front of a Redis L2 on the default connection. No bus: the service runs one replica
     * (see `.railway/railway.ts`). The bus driver opens its own connections
     * when the provider builds the store at boot, even while this store is
     * unused, so add `drivers.redisBus(...)` only together with more replicas.
     */
    redis: store().useL1Layer(drivers.memory()).useL2Layer(drivers.redis({})),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
