import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

const credentials = { email: 'ada@example.com', password: 'secret-password' }

test.group('Login and logout', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('logs in with valid credentials', async ({ visit, route }) => {
    await User.create({ fullName: 'Ada Lovelace', ...credentials })
    const page = await visit(route('session.create'))

    await page.getByLabel('Email').fill(credentials.email)
    await page.getByLabel('Password').fill(credentials.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.waitForURL(route('dashboard'))
    await page.assertTextContains('h1', 'Your dashboard is ready')
  })

  test('shows an error toast for a wrong password', async ({ visit, route }) => {
    await User.create({ fullName: 'Ada Lovelace', ...credentials })
    const page = await visit(route('session.create'))

    await page.getByLabel('Email').fill(credentials.email)
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.assertTextContains('body', 'Invalid user credentials')
    await page.assertPath(route('session.create'))
  })

  test('logs out from the app navigation', async ({ visit, route, browserContext }) => {
    const user = await User.create({ fullName: 'Ada Lovelace', ...credentials })
    await browserContext.loginAs(user)
    const page = await visit(route('dashboard'))

    await page.getByRole('button', { name: 'Log out' }).click()

    await page.waitForURL(route('session.create'))
    await page.assertTextContains('h1', 'Welcome back')

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

    await page.assertPath(route('home'))
    await page.getByRole('link', { name: 'Dashboard', exact: true }).waitFor()
  })
})
