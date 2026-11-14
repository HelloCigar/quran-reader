import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import { waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'

/** A phone's screen, narrower than the reader's sidebar breakpoint. */
const PHONE = { width: 390, height: 844 }

test.group('Quran reader sidebar', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('lists every surah with the one being read marked', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    const surahs = page
      .getByRole('navigation', { name: 'Quran', exact: true })
      .getByRole('list', { name: 'Surahs', exact: true })

    await page.assertText(surahs.locator('[aria-current="true"]'), '2 · Al-Baqarah')
    await page.assertElementsCount(surahs.getByRole('listitem'), 114)
  })

  test('opens the surah the reader chooses', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page
      .getByRole('navigation', { name: 'Quran', exact: true })
      .getByRole('link', { name: "3 · Ali 'Imran", exact: true })
      .click()

    await page.waitForURL('**/quran/3')
    await page.assertVisible(page.getByRole('heading', { name: "Ali 'Imran", exact: true }))
  })

  test('goes to the ayah of an ayah reference', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('textbox', { name: 'Go to Ayah', exact: true }).fill('2:255')
    await page.getByRole('textbox', { name: 'Go to Ayah', exact: true }).press('Enter')

    await page.waitForURL((url) => url.pathname === '/quran/2')
    await waitForAyahInView(page, 255)
  })

  test('shows an error and stays on the surah for the reference {reference}')
    .with([{ reference: 'Al-Baqarah' }, { reference: '2:287' }, { reference: '115:1' }])
    .run(async ({ visit, route, swap }, { reference }) => {
      swap(QuranTextService, new FakeQuranTextService())

      const page = await visit(route('surahs.show', { number: 1 }))
      await page.getByRole('textbox', { name: 'Go to Ayah', exact: true }).fill(reference)
      await page.getByRole('textbox', { name: 'Go to Ayah', exact: true }).press('Enter')

      await page.assertVisible(
        page.getByText('Enter an ayah of the Quran, such as 2:255.', { exact: true })
      )
      await page.assertPath('/quran/1')
      await page.assertVisible(page.getByRole('heading', { name: 'Al-Fatihah', exact: true }))
    })

  test('hides the sidebar on a phone until the reader opens it', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.setViewportSize(PHONE)

    await page.assertNotExists(page.getByRole('list', { name: 'Surahs', exact: true }))
    await page.getByRole('button', { name: 'Surahs', exact: true }).click()

    const drawer = page.getByRole('dialog', { name: 'Quran', exact: true })
    await page.assertVisible(drawer.getByRole('list', { name: 'Surahs', exact: true }))
    await page.assertVisible(drawer.getByRole('textbox', { name: 'Go to Ayah', exact: true }))
  })

  test('opens a surah from the sidebar on a phone', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.setViewportSize(PHONE)
    await page.getByRole('button', { name: 'Surahs', exact: true }).click()
    await page
      .getByRole('dialog', { name: 'Quran', exact: true })
      .getByRole('link', { name: "3 · Ali 'Imran", exact: true })
      .click()

    await page.waitForURL('**/quran/3')
    await page.assertVisible(page.getByRole('heading', { name: "Ali 'Imran", exact: true }))
    await page.assertNotExists(page.getByRole('dialog', { name: 'Quran', exact: true }))
  })

  test('has no sidebar on the {name} page')
    .with([
      { name: 'dashboard', path: '/dashboard' },
      { name: 'bookmarks', path: '/bookmarks' },
    ])
    .run(async ({ visit, swap, browserContext }, { path }) => {
      swap(QuranTextService, new FakeQuranTextService())
      const reader = await User.create({
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'secret-password',
      })
      await browserContext.loginAs(reader)

      const page = await visit(path)

      await page.assertPath(path)
      await page.assertNotExists(page.getByRole('navigation', { name: 'Quran', exact: true }))
      await page.assertNotExists(page.getByRole('textbox', { name: 'Go to Ayah', exact: true }))
    })
})
