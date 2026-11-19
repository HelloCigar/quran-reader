import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Navigation', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('guests can go from the home page to signup and login', async ({ visit, route }) => {
    const page = await visit(route('home'))
    await page.assertTextContains('h1', 'Read the Quran, word by word')

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
    await page.assertTextContains('h1', 'Sign in')
  })

  test('guests reach the login page from the bar on a phone', async ({ visit, route }) => {
    const page = await visit(route('home'))
    await page.setViewportSize({ width: 390, height: 844 })

    await page.assertNotExists(page.getByRole('button', { name: 'Open navigation', exact: true }))
    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Sign in', exact: true })
      .click()

    await page.waitForURL(route('session.create'))
    await page.assertTextContains('h1', 'Sign in')
  })

  test('guests reach the signup page from the home page on a phone', async ({ visit, route }) => {
    const page = await visit(route('home'))
    await page.setViewportSize({ width: 390, height: 844 })

    await page.getByRole('link', { name: 'Create an account', exact: true }).click()

    await page.waitForURL(route('new_account.create'))
    await page.assertTextContains('h1', 'Create your account')
  })

  test('a tap on a word of the home page shows its meaning on a phone', async ({
    visit,
    route,
  }) => {
    const page = await visit(route('home'))
    await page.setViewportSize({ width: 390, height: 844 })

    await page.getByRole('button', { name: 'ٱلرَّحِيمِ', exact: true }).click()

    const meaning = page.getByRole('status').filter({ hasText: 'Tap a word' })
    await page.assertTextContains(meaning, 'the Most Merciful')
    await page.assertTextContains(meaning, 'l-raḥīmi')
  })

  test('sends a signed-in reader from the home page to the dashboard', async ({
    visit,
    route,
    browserContext,
  }) => {
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('home'))

    await page.assertPath(route('dashboard'))
  })

  test("shows a signed-in reader the reader's areas while reading", async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 2 }))
    const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true })

    await page.assertVisible(nav.getByRole('link', { name: 'Dashboard', exact: true }))
    await page.assertVisible(nav.getByRole('button', { name: 'Account menu', exact: true }))
    await nav.getByRole('link', { name: 'Bookmarks', exact: true }).click()
    await page.assertPath(route('bookmarks.index'))
  })

  test('marks Quran as the current area while reading a surah', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))

    await page.assertExists(
      page
        .getByRole('navigation', { name: 'Main navigation', exact: true })
        .locator('a[aria-current="page"]', { hasText: 'Quran' })
    )
  })

  test('shows a signed-out reader sign-in actions instead of the reader areas', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true })

    await page.assertNotExists(nav.getByRole('link', { name: 'Dashboard', exact: true }))
    await page.assertNotExists(nav.getByRole('link', { name: 'Bookmarks', exact: true }))
    await nav.getByRole('link', { name: 'Sign in', exact: true }).click()
    await page.assertPath(route('session.create'))
  })

  test('takes a signed-out reader home from the bar while reading', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Home', exact: true })
      .click()

    await page.waitForURL(route('home'))
    await page.assertTextContains('h1', 'Read the Quran, word by word')
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

    await page.assertExists('a[href="https://quran.foundation"][target="_blank"]')
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
