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

    await page.assertTextContains(surahs.locator('[aria-current="true"]'), 'Al-Baqarah')
    await page.assertElementsCount(surahs.getByRole('listitem'), 114)
  })

  test('opens the surah the reader chooses in Surah mode', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('radio', { name: 'Surah', exact: true }).click()
    await page
      .getByRole('list', { name: 'Surahs', exact: true })
      .getByText("Ali 'Imran", { exact: true })
      .click()

    await page.waitForURL('**/quran/3')
    await page.assertVisible(page.getByRole('heading', { name: "Ali 'Imran", exact: true }))
  })

  test('hides the ayahs and the Verse box in Surah mode', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.assertVisible(page.getByRole('list', { name: 'Ayahs of Al-Baqarah', exact: true }))
    await page.getByRole('radio', { name: 'Surah', exact: true }).click()

    await page.assertNotExists(page.getByRole('list', { name: 'Ayahs of Al-Baqarah', exact: true }))
    await page.assertNotExists(page.getByRole('textbox', { name: 'Verse', exact: true }))
  })

  test('opens the surah the reader chooses in Verse mode, with its ayahs', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page
      .getByRole('list', { name: 'Surahs', exact: true })
      .getByText("Ali 'Imran", { exact: true })
      .click()

    await page.waitForURL('**/quran/3')
    const ayahs = page.getByRole('list', { name: "Ayahs of Ali 'Imran", exact: true })
    await page.assertElementsCount(ayahs.getByRole('listitem'), 200)
  })

  test('keeps Surah mode when the reader opens another surah', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('radio', { name: 'Surah', exact: true }).click()
    await page
      .getByRole('list', { name: 'Surahs', exact: true })
      .getByText("Ali 'Imran", { exact: true })
      .click()
    await page.waitForURL('**/quran/3')

    await page.assertVisible(page.getByRole('heading', { name: "Ali 'Imran", exact: true }))
    await page.assertNotExists(page.getByRole('textbox', { name: 'Verse', exact: true }))
  })

  test('hides the sidebar until the reader shows it again', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('button', { name: 'Hide Surahs', exact: true }).click()
    await page.assertNotExists(page.getByRole('navigation', { name: 'Quran', exact: true }))

    await page.reload()
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()

    await page.assertVisible(page.getByRole('navigation', { name: 'Quran', exact: true }))
  })

  test('opens the ayah the reader chooses', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page
      .getByRole('list', { name: 'Ayahs of Al-Baqarah', exact: true })
      .getByText('255', { exact: true })
      .click()

    await page.waitForURL((url) => url.searchParams.get('ayah') === '255')
    await waitForAyahInView(page, 255)
  })

  test('goes to the ayah typed in the Verse box', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('textbox', { name: 'Verse', exact: true }).fill('255')
    await page.getByRole('textbox', { name: 'Verse', exact: true }).press('Enter')

    await page.waitForURL((url) => url.searchParams.get('ayah') === '255')
    await waitForAyahInView(page, 255)
  })

  test('shows an error and stays on the surah for the verse {verse}')
    .with([{ verse: '8' }, { verse: 'two' }])
    .run(async ({ visit, route, swap }, { verse }) => {
      swap(QuranTextService, new FakeQuranTextService())

      const page = await visit(route('surahs.show', { number: 1 }))
      await page.getByRole('textbox', { name: 'Verse', exact: true }).fill(verse)
      await page.getByRole('textbox', { name: 'Verse', exact: true }).press('Enter')

      await page.assertVisible(
        page.getByText('Enter an ayah of the Quran, such as 2:255.', { exact: true })
      )
      await page.assertPath('/quran/1')
      await page.assertVisible(page.getByRole('heading', { name: 'Al-Fatihah', exact: true }))
    })

  test('lists only the surahs that match the search', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('searchbox', { name: 'Search Surah', exact: true }).fill('baqara')

    const surahs = page.getByRole('list', { name: 'Surahs', exact: true })
    await page.assertElementsCount(surahs.getByRole('listitem'), 1)
    await page.assertTextContains(surahs, 'Al-Baqarah')
  })

  test('says when no surah matches the search', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('searchbox', { name: 'Search Surah', exact: true }).fill('zzz')

    await page.assertVisible(page.getByText('No surah matches “zzz”.', { exact: true }))
  })

  test('hides the sidebar on a phone until the reader opens it', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.setViewportSize(PHONE)

    await page.assertNotExists(page.getByRole('list', { name: 'Surahs', exact: true }))
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()

    const drawer = page.getByRole('dialog', { name: 'Quran', exact: true })
    await page.assertVisible(drawer.getByRole('list', { name: 'Surahs', exact: true }))
    await drawer.getByRole('button', { name: 'Close', exact: true }).click()
    await page.assertNotVisible(drawer)
  })

  test('opens a surah from the sidebar on a phone', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.setViewportSize(PHONE)
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Quran', exact: true })
    await drawer.getByRole('radio', { name: 'Surah', exact: true }).click()
    await drawer.getByText("Ali 'Imran", { exact: true }).click()

    await page.waitForURL('**/quran/3')
    await page.assertVisible(page.getByRole('heading', { name: "Ali 'Imran", exact: true }))
    await page.assertNotVisible(drawer)
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
      await page.assertNotExists(page.getByRole('searchbox', { name: 'Search Surah', exact: true }))
    })
})
