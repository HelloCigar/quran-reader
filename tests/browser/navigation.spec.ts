import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Navigation', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('guests can go from the home page to signup and login', async ({ visit, route }) => {
    const page = await visit(route('home'))
    await page.assertTextContains('h1', 'Read the Quran in Arabic and English')

    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Get started', exact: true })
      .click()
    await page.waitForURL(route('new_account.create'))
    await page.assertTextContains('h1', 'Create your account')

    await page.getByRole('link', { name: 'Quran Reader home', exact: true }).click()
    await page.waitForURL(route('home'))

    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Sign in', exact: true })
      .click()
    await page.waitForURL(route('session.create'))
    await page.assertTextContains('h1', 'Welcome back')
  })

  test('navigates between pages without a full reload', async ({ visit, route, assert }) => {
    const page = await visit(route('home'))
    await page.evaluate(() => Object.assign(globalThis, { __sameDocument: true }))

    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Get started', exact: true })
      .click()
    await page.waitForURL(route('new_account.create'))

    assert.isTrue(await page.evaluate(() => '__sameDocument' in globalThis))
  })

  test('opens external links in a new tab', async ({ visit, route }) => {
    const page = await visit(route('home'))

    await page.assertExists('a[href="https://alquran.cloud"][target="_blank"]')
  })

  test('shows the not found page for unknown URLs', async ({ visit, route }) => {
    const page = await visit('/this-page-does-not-exist')

    await page.assertTextContains('h1', 'Not found')
    await page.getByRole('link', { name: 'Back to home', exact: true }).click()
    await page.waitForURL(route('home'))
  })

  test('remembers the dark mode choice across reloads', async ({ visit, route }) => {
    const page = await visit(route('home'))

    await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click()
    await page.getByRole('button', { name: 'Switch to light theme', exact: true }).waitFor()
    await page.assertCookie('app_theme', 'dark')

    await page.reload()
    await page.getByRole('button', { name: 'Switch to light theme', exact: true }).waitFor()
  })
})
