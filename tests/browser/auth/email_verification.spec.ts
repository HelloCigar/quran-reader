import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import AccountActivationProvision from '#mails/account_activation_provision'

test.group('Email verification', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('verifies the email from the emailed link', async ({ visit, route, db }) => {
    const user = await UserFactory.create()
    const token = await user.createEmailVerificationToken()

    const page = await visit(route('email_verifications.show', { token: token.value!.release() }))
    await page.getByRole('button', { name: 'Verify my email', exact: true }).click()

    await page.assertPath(route('session.create'))
    await db.assertHas('users', {
      id: user.id,
      email: user.unverifiedEmail,
      unverified_email: null,
    })
  })

  test('confirms a pending email change for a signed-in reader', async ({
    visit,
    route,
    browserContext,
    db,
  }) => {
    const user = await UserFactory.apply('verified').create()
    user.unverifiedEmail = 'new-address@example.com'
    await user.save()
    const token = await user.createEmailVerificationToken()
    await browserContext.loginAs(user)

    const page = await visit(route('email_verifications.show', { token: token.value!.release() }))
    await page.getByRole('button', { name: 'Verify my email', exact: true }).click()

    await page.waitForURL(route('dashboard'))
    await db.assertHas('users', {
      id: user.id,
      email: 'new-address@example.com',
      unverified_email: null,
    })
  })

  test('refuses an invalid verification token', async ({ visit, route, db }) => {
    const user = await UserFactory.create()

    const page = await visit(route('email_verifications.show', { token: 'invalid-token' }))
    await page.getByRole('button', { name: 'Verify my email', exact: true }).click()

    await page.assertVisible(
      page.getByText('Invalid or expired email verification token', { exact: true })
    )
    await db.assertHas('users', { id: user.id, unverified_email: user.unverifiedEmail })
  })

  test('refuses a verification link that was already used', async ({ visit, route }) => {
    const user = await UserFactory.create()
    const verificationToken = await user.createEmailVerificationToken()
    const token = verificationToken.value!.release()

    const page = await visit(route('email_verifications.show', { token }))
    await page.getByRole('button', { name: 'Verify my email', exact: true }).click()
    await page.waitForURL(route('session.create'))

    await page.goto(route('email_verifications.show', { token }))
    await page.getByRole('button', { name: 'Verify my email', exact: true }).click()
    await page.assertVisible(
      page.getByText('Invalid or expired email verification token', { exact: true })
    )
  })

  test('sends one activation email per minute', async ({ visit, route, browserContext }) => {
    const email = 'waiting@example.com'
    const user = await UserFactory.merge({ email, unverifiedEmail: email }).create()
    await browserContext.loginAs(user)
    using mailFake = mail.fake()

    const page = await visit(route('email_verifications.create'))
    for (let attempt = 0; attempt < 2; attempt++) {
      const answered = page.waitForResponse(
        (response) =>
          response.url().endsWith('/email-verifications') && response.request().method() === 'POST'
      )
      await page.getByRole('button', { name: 'Resend activation link', exact: true }).click()
      await answered
    }

    mailFake.mails.assertQueuedCount(AccountActivationProvision, 1)
  })

  test('resends the activation email', async ({ visit, route, browserContext }) => {
    const email = 'unverified@example.com'
    const user = await UserFactory.merge({ email, unverifiedEmail: email }).create()
    await browserContext.loginAs(user)
    using mailFake = mail.fake()

    const page = await visit(route('email_verifications.create'))
    await page.getByRole('button', { name: 'Resend activation link', exact: true }).click()
    await page.assertVisible(
      page.getByText('We sent you instructions to verify your email address', { exact: true })
    )

    mailFake.mails.assertQueued(AccountActivationProvision)
  })
})
