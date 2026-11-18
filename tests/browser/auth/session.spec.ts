import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import { logOut } from '#tests/helpers/navigation'

const credentials = { email: 'ada@example.com', password: 'secret-password' }

test.group('Login and logout', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('logs in with valid credentials', async ({ visit, route }) => {
    await User.create({ fullName: 'Ada Lovelace', ...credentials })
    const page = await visit(route('session.create'))

    await page.getByLabel('Email', { exact: true }).fill(credentials.email)
    await page.getByLabel('Password', { exact: true }).fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.waitForURL(route('dashboard'))
    await page.assertTextContains('h1', 'Dashboard')
  })

  test('sends an unverified user from the dashboard to verify their email', async ({
    visit,
    route,
    browserContext,
  }) => {
    const user = await User.create({
      fullName: 'Ada Lovelace',
      ...credentials,
      unverifiedEmail: credentials.email,
    })
    await browserContext.loginAs(user)

    const page = await visit(route('dashboard'))

    await page.assertPath(route('email_verifications.create'))
  })

  test('blocks an email after five failed sign-ins, even with the right password', async ({
    visit,
    route,
  }) => {
    await User.create({ fullName: 'Ada Lovelace', ...credentials })
    const page = await visit(route('session.create'))

    for (let attempt = 0; attempt < 5; attempt++) {
      await page.getByLabel('Email', { exact: true }).fill(credentials.email)
      await page.getByLabel('Password', { exact: true }).fill('wrong-password')
      const answered = page.waitForResponse(
        (response) => response.url().endsWith('/login') && response.request().method() === 'POST'
      )
      await page.getByRole('button', { name: 'Sign in', exact: true }).click()
      await answered
    }

    await page.getByLabel('Email', { exact: true }).fill(credentials.email)
    await page.getByLabel('Password', { exact: true }).fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.assertVisible(
      page.getByText('Too many attempts. Please try again in 20 minutes', { exact: true })
    )
    await page.goto(route('dashboard'))
    await page.assertPath(route('session.create'))
  })

  test('shows an error toast for a wrong password', async ({ visit, route }) => {
    await User.create({ fullName: 'Ada Lovelace', ...credentials })
    const page = await visit(route('session.create'))

    await page.getByLabel('Email', { exact: true }).fill(credentials.email)
    await page.getByLabel('Password', { exact: true }).fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.assertTextContains('body', 'Invalid user credentials')
    await page.assertPath(route('session.create'))
  })

  test('logs out from the app navigation', async ({ visit, route, browserContext }) => {
    const user = await User.create({ fullName: 'Ada Lovelace', ...credentials })
    await browserContext.loginAs(user)
    const page = await visit(route('dashboard'))

    await logOut(page)

    await page.waitForURL(route('session.create'))
    await page.assertTextContains('h1', 'Sign in')

    await page.goto(route('dashboard'))
    await page.assertPath(route('session.create'))
  })

  test('logs out from the menu on a phone', async ({ visit, route, browserContext }) => {
    const user = await User.create({ fullName: 'Ada Lovelace', ...credentials })
    await browserContext.loginAs(user)
    const page = await visit(route('dashboard'))
    await page.setViewportSize({ width: 390, height: 844 })

    await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
    await page.getByRole('button', { name: 'Log out', exact: true }).click()

    await page.waitForURL(route('session.create'))
    await page.goto(route('dashboard'))
    await page.assertPath(route('session.create'))
  })

  test('sends guests from the dashboard to the login page', async ({ visit, route }) => {
    const page = await visit(route('dashboard'))

    await page.assertPath(route('session.create'))
  })

  test('sends logged-in users away from the login page', async ({
    visit,
    route,
    browserContext,
  }) => {
    const user = await User.create({ fullName: 'Ada Lovelace', ...credentials })
    await browserContext.loginAs(user)

    const page = await visit(route('session.create'))

    await page.assertPath(route('dashboard'))
  })
})

test.group('Login with a carried bookmark', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('sends a signed-out reader who bookmarks an ayah to sign in', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('link', { name: 'Bookmark 1:3', exact: true }).click()

    await page.assertPath(route('session.create'))
    await page.assertQueryString({ bookmark: { surah: '1', ayah: '3' } })
    await page.assertVisible(page.getByText('Sign in to bookmark 1:3', { exact: true }))
  })

  test('signing in completes the carried bookmark and asks for a note', async ({
    visit,
    route,
    swap,
    db,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ fullName: 'Ada Lovelace', ...credentials })

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('link', { name: 'Bookmark 1:3', exact: true }).click()
    await page.getByLabel('Email', { exact: true }).fill(credentials.email)
    await page.getByLabel('Password', { exact: true }).fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 1:3', exact: true }))
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null },
      1
    )
  })

  test('shows the existing note when the carried ayah was already bookmarked', async ({
    visit,
    route,
    swap,
    db,
    assert,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ fullName: 'Ada Lovelace', ...credentials })
    await reader
      .related('bookmarks')
      .create({ surahNumber: 1, ayahNumber: 3, note: 'Earlier thought' })

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('link', { name: 'Bookmark 1:3', exact: true }).click()
    await page.getByLabel('Email', { exact: true }).fill(credentials.email)
    await page.getByLabel('Password', { exact: true }).fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    const dialog = page.getByRole('dialog', { name: 'Note on 1:3', exact: true })
    await page.assertVisible(dialog)
    assert.equal(await dialog.getByLabel('Note', { exact: true }).inputValue(), 'Earlier thought')
    await db.assertCount('bookmarks', 1)
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'Earlier thought' },
      1
    )
  })

  test('bookmarks nothing when the reader leaves sign-in and signs in later', async ({
    visit,
    route,
    swap,
    db,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    await User.create({ fullName: 'Ada Lovelace', ...credentials })

    const quranPage = await visit(route('surahs.show', { number: 1 }))
    await quranPage.getByRole('link', { name: 'Bookmark 1:3', exact: true }).click()
    await quranPage.assertPath(route('session.create'))

    const page = await visit(route('home'))
    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Sign in', exact: true })
      .click()
    await page.getByLabel('Email', { exact: true }).fill(credentials.email)
    await page.getByLabel('Password', { exact: true }).fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.assertPath(route('dashboard'))
    await db.assertEmpty('bookmarks')
  })

  test('returns a signed-out reader to the bookmarks list after signing in', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    await User.create({ fullName: 'Ada Lovelace', ...credentials })

    const page = await visit(route('bookmarks.index'))
    await page.assertPath(route('session.create'))
    await page.getByLabel('Email', { exact: true }).fill(credentials.email)
    await page.getByLabel('Password', { exact: true }).fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.assertPath('/bookmarks')
    await page.assertVisible(
      page.getByRole('heading', { name: 'Bookmarks', level: 1, exact: true })
    )
  })
})
