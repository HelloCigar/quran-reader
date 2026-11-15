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
