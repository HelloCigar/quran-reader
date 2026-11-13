import { defineConfig, store, drivers } from '@adonisjs/cache'

const cacheConfig = defineConfig({
  default: 'default',

  stores: {
    memoryOnly: store().useL1Layer(drivers.memory()),

    /**
     * Memory L1 in front of a SQLite L2. The `cache` table is created by a
     * migration, never by the driver. No bus: the app runs in one process.
     */
    default: store()
      .useL1Layer(drivers.memory())
      .useL2Layer(
        drivers.database({
          connectionName: 'sqlite',
          autoCreateTable: false,
          tableName: 'cache',
        })
      ),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
