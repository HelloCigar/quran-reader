import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import { fakePwnedPasswords } from '@adonisplus/persona/password'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'

test.group('Change Password', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  // Have I Been Pwned is a third-party service; the leaked-password check uses this fake.
  group.each.setup(() => {
    const pwned = fakePwnedPasswords(app.container)
    return () => pwned.restore()
  })

  test('can change password and log in with new password', async ({
    visit,
    route,
    browserContext,
  }) => {
    const user = await UserFactory.apply('verified').create()
    await browserContext.loginAs(user)

    const page = await visit(route('security.show'))
    await page.getByLabel('Current Password', { exact: true }).fill('Corr3ct-Horse-Battery-Staple!')
    await page.getByLabel('New Password', { exact: true }).fill('N3w-Purple-Monkey-Dishwasher!')
    await page.getByLabel('Confirm Password', { exact: true }).fill('N3w-Purple-Monkey-Dishwasher!')
    await page.getByRole('button', { name: 'Update Password', exact: true }).click()
    await page.assertVisible(page.getByText('Password updated successfully', { exact: true }))
    await page.getByRole('button', { name: 'Log out', exact: true }).click()
    await page.assertPath(route('session.create'))

    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.getByLabel('Password', { exact: true }).fill('N3w-Purple-Monkey-Dishwasher!')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.assertPath(route('dashboard'))
  })

  test('sees error with wrong current password', async ({ visit, route, browserContext }) => {
    const user = await UserFactory.apply('verified').create()
    await browserContext.loginAs(user)

    const page = await visit(route('security.show'))
    await page.getByLabel('Current Password', { exact: true }).fill('wrongpassword')
    await page.getByLabel('New Password', { exact: true }).fill('N3w-Purple-Monkey-Dishwasher!')
    await page.getByLabel('Confirm Password', { exact: true }).fill('N3w-Purple-Monkey-Dishwasher!')
    await page.getByRole('button', { name: 'Update Password', exact: true }).click()

    await page.assertVisible(page.getByText('The current password is incorrect', { exact: true }))
  })
})
