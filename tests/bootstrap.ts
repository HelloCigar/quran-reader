import { assert } from '@japa/assert'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { Test } from '@japa/runner/core'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { dbAssertions } from '@adonisjs/lucid/plugins/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { chromium } from 'playwright'
import { browserClient } from '@japa/browser-client'
import { authBrowserClient } from '@adonisjs/auth/plugins/browser_client'
import { sessionBrowserClient } from '@adonisjs/session/plugins/browser_client'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  pluginAdonisJS(app),
  dbAssertions(app),
  browserClient({
    runInSuites: ['browser'],
    // Audio starts only from a click, as in Safari: each audio element stays
    // locked until play() is called while a click's activation is still live.
    launcher: (options) =>
      chromium.launch({ ...options, args: ['--autoplay-policy=user-gesture-required'] }),
  }),
  sessionBrowserClient(app),
  authBrowserClient(app),
]

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  /**
   * Tests use their own SQLite file (`tmp/db.test.sqlite3`, see
   * `config/database.ts`), migrated fresh for every run.
   */
  setup: [() => testUtils.db().migrate()],
  teardown: [],
}

/** The tests of the browser suite, which each have a page of their own. */
const browserTests = new WeakSet<Test>()

/**
 * A browser test's page closes as soon as the test ends, before its `swap`s
 * are restored: Japa runs a test's cleanups in reverse, so this one, added
 * after the test body, runs first. A page left open would go on loading (the
 * next block of Ayahs, a visit an assertion did not wait for) and reach the
 * real services, which call Quran Foundation.
 */
Test.executed((test) => {
  if (browserTests.has(test)) test.cleanup(() => test.context.browserContext.close())
})

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (suite.name === 'browser') {
    suite.onTest((test) => browserTests.add(test))
    suite.onGroup((group) => group.tap((test) => browserTests.add(test)))
  }
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
