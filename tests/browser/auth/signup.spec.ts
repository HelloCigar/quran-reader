import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

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
