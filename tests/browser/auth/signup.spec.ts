import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { fakePwnedPasswords } from '@adonisplus/persona/password'
import User from '#models/user'
import AccountActivationProvision from '#mails/account_activation_provision'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

const password = 'Corr3ct-Horse-Battery-Staple!'

test.group('Signup', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  // Have I Been Pwned is a third-party service; the leaked-password check uses this fake.
  group.each.setup(() => {
    const pwned = fakePwnedPasswords(app.container)
    return () => pwned.restore()
  })

  test('creates an account and asks to verify the email', async ({ visit, route, assert }) => {
    using _mailFake = mail.fake()
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Full name', { exact: true }).fill('Ada Lovelace')
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page.waitForURL(route('email_verifications.create'))
    await page.assertTextContains('h1', 'Verify your account')

    const user = await User.findByOrFail('email', 'ada@example.com')
    assert.equal(user.fullName, 'Ada Lovelace')
  })

  test('queues the activation email on signup', async ({ visit, route }) => {
    using mailFake = mail.fake()
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Full name', { exact: true }).fill('Ada Lovelace')
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Create account', exact: true }).click()
    await page.waitForURL(route('email_verifications.create'))

    mailFake.mails.assertQueued(
      AccountActivationProvision,
      (email) => email.token.email === 'ada@example.com'
    )
  })

  test('throttles signup submissions per IP', async ({ visit, route }) => {
    const page = await visit(route('new_account.create'))

    for (let attempt = 0; attempt < 10; attempt++) {
      const answered = page.waitForResponse(
        (response) => response.url().endsWith('/signup') && response.request().method() === 'POST'
      )
      await page.getByRole('button', { name: 'Create account', exact: true }).click()
      await answered
    }
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page.assertVisible(
      page.getByText('Too many attempts. Please try again in 1 minute', { exact: true })
    )
  })

  test('refuses a name over 100 characters', async ({ visit, route, db }) => {
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Full name', { exact: true }).fill('A'.repeat(101))
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page.assertVisible(
      page.getByText('The fullName field must not be greater than 100 characters', {
        exact: true,
      })
    )
    await db.assertEmpty('users')
  })

  test('shows the password strength and requirements while typing', async ({ visit, route }) => {
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Password', { exact: true }).fill('abc')

    await page.assertVisible(page.getByRole('meter', { name: 'Password strength', exact: true }))
    await page.assertVisible(page.getByText('Very weak', { exact: true }))
    await page.assertVisible(page.getByText('At least 8 characters', { exact: true }))
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
    await User.create({ fullName: 'Ada', email: 'ada@example.com', password })
    const page = await visit(route('new_account.create'))

    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
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
  // Have I Been Pwned is a third-party service; the leaked-password check uses this fake.
  group.each.setup(() => {
    const pwned = fakePwnedPasswords(app.container)
    return () => pwned.restore()
  })

  test('signing up from a carried bookmark completes it and asks for a note', async ({
    visit,
    route,
    swap,
    db,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    using _mailFake = mail.fake()

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('link', { name: 'Bookmark 1:3', exact: true }).click()
    await page.getByRole('link', { name: 'Create an account', exact: true }).click()
    await page.getByLabel('Full name', { exact: true }).fill('Grace Hopper')
    await page.getByLabel('Email', { exact: true }).fill('grace@example.com')
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Create account', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 1:3', exact: true }))
    await db.assertHas('bookmarks', { surah_number: 1, ayah_number: 3, note: null }, 1)
    await db.assertHas('users', { email: 'grace@example.com' }, 1)
  })
})
