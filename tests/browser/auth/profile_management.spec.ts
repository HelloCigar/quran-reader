import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import EmailChangeProvision from '#mails/email_change_provision'

test.group('Profile Management', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('can update name', async ({ visit, route, browserContext }) => {
    const user = await UserFactory.apply('verified').create()
    await browserContext.loginAs(user)

    const page = await visit(route('profile.show'))
    await page.getByLabel('Full name', { exact: true }).fill('Updated Name')
    await page.getByRole('button', { name: 'Update Profile', exact: true }).click()

    await page.assertVisible(page.getByText('Profile updated successfully', { exact: true }))
  })

  test('can update email and receive verification', async ({
    visit,
    route,
    browserContext,
    db,
  }) => {
    const user = await UserFactory.apply('verified').create()
    await browserContext.loginAs(user)

    using mailFake = mail.fake()

    const page = await visit(route('profile.show'))
    await page.getByLabel('Email', { exact: true }).fill('newemail@example.com')
    await page.getByRole('button', { name: 'Update Profile', exact: true }).click()

    await page.assertVisible(
      page.getByText('Verify your new email address to switch to it.', { exact: true })
    )
    mailFake.mails.assertQueued(EmailChangeProvision)
    await db.assertHas('users', {
      id: user.id,
      email: user.email,
      unverified_email: 'newemail@example.com',
    })
  })

  test('refuses an email another account already uses', async ({
    visit,
    route,
    browserContext,
    db,
  }) => {
    const [user, other] = await UserFactory.apply('verified').createMany(2)
    await browserContext.loginAs(user)

    using mailFake = mail.fake()

    const page = await visit(route('profile.show'))
    await page.getByLabel('Email', { exact: true }).fill(other.email)
    await page.getByRole('button', { name: 'Update Profile', exact: true }).click()

    await page.assertVisible(page.getByText('The email has already been taken', { exact: true }))
    mailFake.mails.assertNoneQueued()
    await db.assertHas('users', { id: user.id, email: user.email, unverified_email: null })
  })

  test('reverting to the original verified email queues no mail', async ({
    visit,
    route,
    browserContext,
  }) => {
    const user = await UserFactory.apply('verified').create()
    user.unverifiedEmail = 'pending@example.com'
    await user.save()
    await browserContext.loginAs(user)

    using mailFake = mail.fake()

    const page = await visit(route('profile.show'))
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.getByRole('button', { name: 'Update Profile', exact: true }).click()

    await page.assertVisible(page.getByText('Profile updated successfully', { exact: true }))
    mailFake.mails.assertNoneQueued()
  })

  test('can resend the pending verification email', async ({ visit, route, browserContext }) => {
    const user = await UserFactory.apply('verified').create()
    user.unverifiedEmail = 'pending@example.com'
    await user.save()
    await browserContext.loginAs(user)

    using mailFake = mail.fake()

    const page = await visit(route('profile.show'))
    await page.getByRole('button', { name: 'Resend link', exact: true }).click()
    await page.assertVisible(
      page.getByText('We sent you instructions to verify your email address', { exact: true })
    )

    mailFake.mails.assertQueued(EmailChangeProvision)
  })

  test('can cancel a pending email change', async ({ visit, route, browserContext }) => {
    const user = await UserFactory.apply('verified').create()
    user.unverifiedEmail = 'pending@example.com'
    await user.save()
    await browserContext.loginAs(user)

    using mailFake = mail.fake()

    const page = await visit(route('profile.show'))
    await page.getByRole('button', { name: 'Cancel change', exact: true }).click()

    await page.assertVisible(page.getByText('Profile updated successfully', { exact: true }))
    mailFake.mails.assertNoneQueued()
  })
})
