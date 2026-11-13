import { defineConfig } from '@hey-api/openapi-ts'

/**
 * Generates the typed Al Quran Cloud client into app/integrations/alquran_cloud.
 * Regenerate with `npm run openapi`. Never edit the output by hand.
 */
export default defineConfig({
  input: './resources/openapi/alquran_cloud.yaml',
  output: {
    path: './app/integrations/alquran_cloud',
    module: { extension: '.js' },
  },
  parser: {
    patch: {
      /**
       * The spec's operationIds are hashes. Name each operation after its
       * method and path instead, e.g. GET /surah/{number} -> getSurahByNumber.
       */
      operations: (method, path, operation) => {
        const parts = path
          .split('/')
          .filter(Boolean)
          .map((segment) => {
            const name = segment.replace(/[{}]/g, '')
            const pascal = name.charAt(0).toUpperCase() + name.slice(1)
            return segment.startsWith('{') ? `By${pascal}` : pascal
          })
        operation.operationId = `${method}${parts.join('')}`
      },
    },
  },
  plugins: [
    {
      name: '@hey-api/client-fetch',
      baseUrl: 'https://api.alquran.cloud/v1',
    },
    '@hey-api/typescript',
    '@hey-api/sdk',
  ],
})
