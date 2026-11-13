import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Signup', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('creates an account and lands on the dashboard', async ({ visit, route, assert }) => {
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Full name', { exact: true }).fill('Ada Lovelace')
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill('secret-password')
    await page.getByLabel('Confirm password', { exact: true }).fill('secret-password')
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page.waitForURL(route('dashboard'))
    await page.assertTextContains('h1', 'Your dashboard is ready')

    const user = await User.findByOrFail('email', 'ada@example.com')
    assert.equal(user.fullName, 'Ada Lovelace')
  })

  test('shows validation errors next to the fields', async ({ visit, route, assert }) => {
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill('short')
    await page.getByLabel('Confirm password', { exact: true }).fill('different')
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page
      .getByLabel('Password', { exact: true })
      .and(page.locator('[aria-invalid="true"]'))
      .waitFor()
    await page.assertPath(route('new_account.create'))
    await page.assertTextContains('body', 'at least 8 characters')
    await page.assertTextContains('body', 'must be the same')

    const users = await User.all()
    assert.lengthOf(users, 0)
  })

  test('rejects an email that is already registered', async ({ visit, route }) => {
    await User.create({ fullName: 'Ada', email: 'ada@example.com', password: 'secret-password' })
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill('secret-password')
    await page.getByLabel('Confirm password', { exact: true }).fill('secret-password')
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page
      .getByLabel('Email', { exact: true })
      .and(page.locator('[aria-invalid="true"]'))
      .waitFor()
    await page.assertPath(route('new_account.create'))
    await page.assertTextContains('body', 'already been taken')
  })

  test('links to the login page', async ({ visit, route }) => {
    const page = await visit(route('new_account.create'))

    await page.getByRole('link', { name: 'Sign in', exact: true }).click()

    await page.waitForURL(route('session.create'))
    await page.assertTextContains('h1', 'Welcome back')
  })
})

test.group('Signup with a carried bookmark', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('signing up from a carried bookmark completes it and asks for a note', async ({
    visit,
    route,
    swap,
    db,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('link', { name: 'Bookmark 1:3', exact: true }).click()
    await page.getByRole('link', { name: 'Create an account', exact: true }).click()
    await page.getByLabel('Full name', { exact: true }).fill('Grace Hopper')
    await page.getByLabel('Email', { exact: true }).fill('grace@example.com')
    await page.getByLabel('Password', { exact: true }).fill('secret-password')
    await page.getByLabel('Confirm password', { exact: true }).fill('secret-password')
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 1:3', exact: true }))
    await db.assertHas('bookmarks', { surah_number: 1, ayah_number: 3, note: null }, 1)
    await db.assertHas('users', { email: 'grace@example.com' }, 1)
  })
})
