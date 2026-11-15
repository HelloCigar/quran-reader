import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import { addPasskey, addVirtualAuthenticator } from '#tests/helpers/passkeys'
import PasskeyChangedNotification from '#mails/passkey_changed_notification'

test.group('Passkey Registration', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('can add a passkey', async ({ visit, route, browserContext }) => {
    const user = await UserFactory.apply('verified').create()
    await browserContext.loginAs(user)

    using mailFake = mail.fake()

    const page = await visit(route('security.show'))
    await addVirtualAuthenticator(page)
    await addPasskey(page)

    await page.assertVisible(page.getByText('Passkey added', { exact: true }))
    const list = page.getByRole('list', { name: 'Passkeys', exact: true })
    await page.assertVisible(list.getByText('Passkey', { exact: true }))
    mailFake.mails.assertQueued(PasskeyChangedNotification, (message) => {
      return message.event === 'added' && message.passkeyName === 'Passkey'
    })
  })

  test('throttles registration challenge requests per user', async ({
    visit,
    route,
    browserContext,
    assert,
  }) => {
    const user = await UserFactory.apply('verified').create()
    await browserContext.loginAs(user)

    const page = await visit(route('security.show'))
    const cookies = await browserContext.cookies()
    const xsrfToken = decodeURIComponent(cookies.find((c) => c.name === 'XSRF-TOKEN')!.value)
    const headers = { 'X-XSRF-TOKEN': xsrfToken }

    const statuses: number[] = []
    for (let attempt = 0; attempt < 11; attempt++) {
      const response = await page.request.post('/settings/passkeys/challenge', { headers })
      statuses.push(response.status())
    }

    assert.deepEqual(statuses, [...Array(10).fill(200), 429])
  })

  test('refuses a second passkey from the same authenticator', async ({
    visit,
    route,
    browserContext,
  }) => {
    const user = await UserFactory.apply('verified').create()
    await browserContext.loginAs(user)

    using mailFake = mail.fake()

    const page = await visit(route('security.show'))
    await addVirtualAuthenticator(page)
    await addPasskey(page)

    await page.getByRole('button', { name: 'Add a passkey', exact: true }).click()
    await page.assertVisible(
      page.getByText('This device already has a passkey for your account', { exact: true })
    )

    /**
     * Only the first passkey was added
     */
    mailFake.mails.assertQueuedCount(PasskeyChangedNotification, 1)
  })
})
