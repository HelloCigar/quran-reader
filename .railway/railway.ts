import { defineRailway, preserve, project, service } from 'railway/iac'

// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = 'web'

export default defineRailway(() => {
  const web = service('web', {
    build: { buildCommand: 'npm run build', buildEnvironment: 'V3', builder: 'RAILPACK' },
    start: 'node build/bin/server.js',
    healthcheck: '/',
    healthcheckTimeout: 60,
    preDeploy: 'node build/ace.js migration:run --force',
    /**
     * One replica: the cache keeps a memory layer with no bus between processes.
     */
    replicas: { 'asia-southeast1-eqsg3a': 1 },
    /**
     * Values live on Railway, never in source. Add a variable here before
     * setting it with `railway variable set`, or the next apply removes it.
     */
    env: {
      TZ: preserve(),
      NODE_ENV: preserve(),
      HOST: preserve(),
      PORT: preserve(),
      LOG_LEVEL: preserve(),
      APP_KEY: preserve(),
      APP_URL: preserve(),
      SESSION_DRIVER: preserve(),
      LIMITER_STORE: preserve(),
      DB_CONNECTION: preserve(),
      LIBSQL_URL: preserve(),
      LIBSQL_AUTH_TOKEN: preserve(),
      QURAN_FOUNDATION_CLIENT_ID: preserve(),
      QURAN_FOUNDATION_CLIENT_SECRET: preserve(),
      QURAN_FOUNDATION_ENV: preserve(),
      VITE_APP_NAME: preserve(),
      MAIL_MAILER: preserve(),
      MAIL_FROM_NAME: preserve(),
      MAIL_BRAND_NAME: preserve(),
      MAIL_FROM_ADDRESS: preserve(),
      SMTP_HOST: preserve(),
      SMTP_PORT: preserve(),
      SMTP_USERNAME: preserve(),
      SMTP_PASSWORD: preserve(),
      PASSKEY_RP_ID: preserve(),
      PASSKEY_ORIGINS: preserve(),
    },
  })

  return project('quran-reader', {
    resources: [web],
  })
})
