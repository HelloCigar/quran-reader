import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import ReadingPosition from '#models/reading_position'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import { waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'

const credentials = { email: 'ada@example.com', password: 'secret-password' }

test.group('Dashboard', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('continues reading at the Reading Position', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create(credentials)
    await ReadingPosition.create({ userId: reader.id, surahNumber: 18, ayahNumber: 10 })
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))
    const card = page.getByRole('link', { name: 'Continue reading at 18:10', exact: true })
    await page.assertVisible(card)
    // A reader clicks anywhere on the card; its text sits over the link.
    await page.assertVisible(page.getByText('Ayah 18:10 · The Cave', { exact: true }))
    await page.assertVisible(page.getByText('10 of 110 ayahs', { exact: true }))
    await page.assertVisible(page.getByText('آية 10', { exact: true }))
    await page.getByText('Al-Kahf', { exact: true }).click()

    await page.assertPath('/quran/18')
    await waitForAyahInView(page, 10)
  })

  test('names the Surah by its number when the Quran text is unavailable', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API being down.
    swap(QuranTextService, FakeQuranTextService.unavailable())
    const reader = await User.create(credentials)
    await ReadingPosition.create({ userId: reader.id, surahNumber: 18, ayahNumber: 10 })
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))

    await page.assertVisible(page.getByText('Surah 18', { exact: true }))
    await page.assertVisible(page.getByText('Ayah 18:10', { exact: true }))
    await page.assertNotExists(page.getByText(/ of d+ ayahs$/))
  })

  test('titles a recent Bookmark by its reference when the Quran text is unavailable', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API being down.
    swap(QuranTextService, FakeQuranTextService.unavailable())
    const reader = await User.create(credentials)
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 255, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))

    await page.assertVisible(page.getByRole('link', { name: '2:255', exact: true }))
  })

  test('starts a new reader at Al-Fatihah 1:1', async ({ visit, route, swap, browserContext }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create(credentials)
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))
    const card = page.getByRole('link', { name: 'Start reading at 1:1', exact: true })
    await page.assertVisible(card)
    // A reader clicks anywhere on the card; its text sits over the link.
    await page.assertVisible(page.getByText('Ayah 1:1 · The Opener', { exact: true }))
    // A reader who hasn't read yet has no progress through the Surah.
    await page.assertNotExists(page.getByText(/ of d+ ayahs$/))
    await page.getByText('Al-Fatihah', { exact: true }).click()

    await page.assertPath('/quran/1')
    await waitForAyahInView(page, 1)
  })

  test('explains bookmarking to a reader with no Bookmarks', async ({
    visit,
    route,
    browserContext,
  }) => {
    const reader = await User.create(credentials)
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))

    await page.assertVisible(page.getByText('No bookmarks yet', { exact: true }))
    await page.assertVisible(
      page.getByText(
        "While you read, select the bookmark button beside an Ayah's reference to keep it here, with a note if you like.",
        { exact: true }
      )
    )
    await page.assertNotExists(page.getByRole('link', { name: 'View all', exact: true }))
  })

  test('shows the 5 newest Bookmarks with their notes', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create(credentials)
    for (const ayah of [1, 2, 3, 4, 5, 6, 7]) {
      await reader
        .related('bookmarks')
        .create({ surahNumber: 2, ayahNumber: ayah, note: `Note on 2:${ayah}` })
    }
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))

    const list = page.getByRole('list', { name: 'Recent bookmarks', exact: true })
    await page.assertElementsCount(list.getByRole('listitem'), 5)
    for (const ayah of [7, 6, 5, 4, 3]) {
      await page.assertVisible(list.getByText(`2:${ayah} · Al-Baqarah`, { exact: true }))
      await page.assertVisible(list.getByText(`Note on 2:${ayah}`, { exact: true }))
    }
    await page.assertNotExists(list.getByText('2:2 · Al-Baqarah', { exact: true }))
  })

  test("shows a recent Bookmark's Ayah text when it has no note", async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create(credentials)
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 255, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))

    const list = page.getByRole('list', { name: 'Recent bookmarks', exact: true })
    await page.assertVisible(list.getByText('Ayah 2:255', { exact: true }))
  })

  test('opens a recent Bookmark at its Ayah', async ({ visit, route, swap, browserContext }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create(credentials)
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 255, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))
    await page.getByRole('link', { name: /^2:255 · Al-Baqarah/ }).click()

    await page.assertPath('/quran/2')
    await waitForAyahInView(page, 255)
  })

  test('opens every Bookmark from "View all"', async ({ visit, route, swap, browserContext }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create(credentials)
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 255, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))
    await page.getByRole('link', { name: 'View all', exact: true }).click()

    await page.assertPath('/bookmarks')
    await page.assertVisible(
      page.getByRole('heading', { name: 'Bookmarks', level: 1, exact: true })
    )
  })
})
