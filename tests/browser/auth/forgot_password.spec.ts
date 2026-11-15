import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { fakePwnedPasswords } from '@adonisplus/persona/password'
import { UserFactory } from '#database/factories/user_factory'
import PasswordResetProvision from '#mails/password_reset_provision'

const newPassword = 'N3w-Purple-Monkey-Dishwasher!'

test.group('Forgot password', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  // Have I Been Pwned is a third-party service; the leaked-password check uses this fake.
  group.each.setup(() => {
    const pwned = fakePwnedPasswords(app.container)
    return () => pwned.restore()
  })

  test('links to the reset request from the login page', async ({ visit, route }) => {
    const page = await visit(route('session.create'))

    await page.getByRole('link', { name: 'Forgot password?', exact: true }).click()

    await page.waitForURL(route('password_resets.create'))
    await page.assertTextContains('h1', 'Forgot password')
  })

  test('can request password reset email', async ({ visit, route }) => {
    const user = await UserFactory.apply('verified').create()
    using mailFake = mail.fake()

    const page = await visit(route('password_resets.create'))
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.getByRole('button', { name: 'Send instructions', exact: true }).click()
    await page.assertVisible(
      page.getByText('We have sent you the instructions to reset your password', { exact: true })
    )

    mailFake.mails.assertQueued(PasswordResetProvision)
  })

  test('does not reveal whether an email is registered', async ({ visit, route }) => {
    using mailFake = mail.fake()

    const page = await visit(route('password_resets.create'))
    await page.getByLabel('Email', { exact: true }).fill('ghost@example.com')
    await page.getByRole('button', { name: 'Send instructions', exact: true }).click()
    await page.assertVisible(
      page.getByText('We have sent you the instructions to reset your password', { exact: true })
    )

    mailFake.mails.assertNoneQueued()
  })

  test('sends one reset email per minute for the same address', async ({ visit, route }) => {
    const user = await UserFactory.apply('verified').create()
    using mailFake = mail.fake()

    const page = await visit(route('password_resets.create'))
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.getByLabel('Email', { exact: true }).fill(user.email)
      const answered = page.waitForResponse(
        (response) =>
          response.url().endsWith('/password-resets') && response.request().method() === 'POST'
      )
      await page.getByRole('button', { name: 'Send instructions', exact: true }).click()
      await answered
    }

    mailFake.mails.assertQueuedCount(PasswordResetProvision, 1)
  })

  test('throttles reset requests per IP', async ({ visit, route }) => {
    using _mailFake = mail.fake()
    const page = await visit(route('password_resets.create'))
    await page.getByLabel('Email', { exact: true }).fill('ghost@example.com')

    for (let attempt = 0; attempt < 10; attempt++) {
      const answered = page.waitForResponse(
        (response) =>
          response.url().endsWith('/password-resets') && response.request().method() === 'POST'
      )
      await page.getByRole('button', { name: 'Send instructions', exact: true }).click()
      await answered
    }
    await page.getByRole('button', { name: 'Send instructions', exact: true }).click()

    await page.assertVisible(
      page.getByText('Too many attempts. Please try again in 1 minute', { exact: true })
    )
  })

  test('can reset password and log in', async ({ visit, route }) => {
    const user = await UserFactory.apply('verified').create()
    const token = await user.createPasswordResetToken()

    const page = await visit(route('password_resets.show', { token: token.value!.release() }))
    await page.getByLabel('Password', { exact: true }).fill(newPassword)
    await page.getByLabel('Confirm password', { exact: true }).fill(newPassword)
    await page.getByRole('button', { name: 'Reset password', exact: true }).click()
    await page.waitForURL(route('session.create'))

    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.getByLabel('Password', { exact: true }).fill(newPassword)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.waitForURL(route('dashboard'))
  })

  test('sees an error with an invalid reset token', async ({ visit, route }) => {
    const page = await visit(route('password_resets.show', { token: 'invalid-token' }))
    await page.getByLabel('Password', { exact: true }).fill(newPassword)
    await page.getByLabel('Confirm password', { exact: true }).fill(newPassword)
    await page.getByRole('button', { name: 'Reset password', exact: true }).click()

    await page.assertVisible(
      page.getByText('Invalid or expired password reset token', { exact: true })
    )
  })
})
