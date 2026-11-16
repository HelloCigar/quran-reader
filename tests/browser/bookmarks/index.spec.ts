import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import { readerWithBookmarks } from '#tests/helpers/bookmarks'
import { waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'

test.group('Bookmarks index', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('opens the bookmarks list from the signed-in navigation', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('dashboard'))
    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Bookmarks', exact: true })
      .click()

    await page.assertPath('/bookmarks')
    await page.assertVisible(
      page.getByRole('heading', { name: 'Bookmarks', level: 1, exact: true })
    )
  })

  test('opens the bookmarks list from the surah list', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.index'))
    await page.getByRole('link', { name: 'Your bookmarks', exact: true }).click()

    await page.assertPath('/bookmarks')
    await page.assertVisible(
      page.getByRole('heading', { name: 'Bookmarks', level: 1, exact: true })
    )
  })

  test("shows each bookmark's reference, surah name, ayah text and note", async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await reader
      .related('bookmarks')
      .create({ surahNumber: 2, ayahNumber: 255, note: 'Ayat al-Kursi' })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))

    await page.assertPath('/bookmarks')
    const list = page.getByRole('list', { name: 'Bookmarks', exact: true })
    for (const text of ['2:255 · Al-Baqarah', 'آية 255', 'Ayah 2:255', 'Ayat al-Kursi']) {
      await page.assertVisible(list.getByText(text, { exact: true }))
    }
  })

  test('lists the most recently bookmarked first', async ({
    visit,
    route,
    swap,
    browserContext,
    assert,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    const now = DateTime.now()
    await reader
      .related('bookmarks')
      .create({ surahNumber: 1, ayahNumber: 1, note: null, createdAt: now.minus({ days: 2 }) })
    await reader
      .related('bookmarks')
      .create({ surahNumber: 2, ayahNumber: 255, note: null, createdAt: now.minus({ days: 1 }) })
    await reader
      .related('bookmarks')
      .create({ surahNumber: 1, ayahNumber: 7, note: null, createdAt: now })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))

    await page.assertPath('/bookmarks')
    const items = page.getByRole('list', { name: 'Bookmarks', exact: true }).getByRole('listitem')
    await page.assertElementsCount(items, 3)
    const texts = await items.allTextContents()
    const references = texts.map((text) => text.split(' ')[0])
    assert.deepEqual(references, ['1:7', '2:255', '1:1'])
  })

  test('opens the surah at the ayah when an entry is chosen', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 255, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))
    await page.getByRole('link', { name: '2:255 · Al-Baqarah', exact: true }).click()

    await page.assertPath('/quran/2')
    await page.assertVisible(page.getByText('2:255', { exact: true }))
    await waitForAyahInView(page, 255)
  })

  test('edits a note from the list', async ({ visit, route, swap, browserContext, db }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await reader
      .related('bookmarks')
      .create({ surahNumber: 2, ayahNumber: 255, note: 'Ayat al-Kursi' })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))
    await page.getByRole('button', { name: 'Bookmarked 2:255', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Edit note', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Note on 2:255', exact: true })
    await dialog.getByLabel('Note', { exact: true }).fill('Updated')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await page.assertPath('/bookmarks')
    await page.assertVisible(
      page
        .getByRole('list', { name: 'Bookmarks', exact: true })
        .getByText('Updated', { exact: true })
    )
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 2, ayah_number: 255, note: 'Updated' },
      1
    )
  })

  test('removes a bookmark from the list', async ({ visit, route, swap, browserContext, db }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 255, note: null })
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 1, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))
    await page.getByRole('button', { name: 'Bookmarked 2:255', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click()

    await page.assertPath('/bookmarks')
    await page.assertNotExists(page.getByText('2:255 · Al-Baqarah', { exact: true }))
    await page.assertVisible(page.getByRole('link', { name: '1:1 · Al-Fatihah', exact: true }))
    await db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 2, ayah_number: 255 })
  })

  test("tells a reader with no bookmarks they haven't bookmarked any ayahs and offers the Quran", async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))
    await page.assertVisible(
      page.getByText("You haven't bookmarked any ayahs yet", { exact: true })
    )
    await page.getByRole('link', { name: 'Read the Quran', exact: true }).click()

    await page.assertPath('/quran')
  })

  test("still shows references and notes when the Quran text can't be loaded", async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, FakeQuranTextService.unavailable())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await reader
      .related('bookmarks')
      .create({ surahNumber: 2, ayahNumber: 255, note: 'Ayat al-Kursi' })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))

    await page.assertPath('/bookmarks')
    await page.assertNotExists(
      page.getByRole('heading', { name: 'Quran text unavailable', exact: true })
    )
    for (const text of ['2:255', 'Ayat al-Kursi', "The ayah text couldn't be loaded right now."]) {
      await page.assertVisible(page.getByText(text, { exact: true }))
    }
    await page.assertNotExists(page.getByText('2:255 · Al-Baqarah', { exact: true }))
  })

  test('shows the 20 newest bookmarks on the first page', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await readerWithBookmarks(21)
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))

    const list = page.getByRole('list', { name: 'Bookmarks', exact: true })
    await page.assertElementsCount(list.getByRole('listitem'), 20)
    await page.assertVisible(list.getByRole('link', { name: '2:21 · Al-Baqarah', exact: true }))
    await page.assertNotExists(list.getByRole('link', { name: '2:1 · Al-Baqarah', exact: true }))
  })

  test('shows the older bookmarks on the next page', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await readerWithBookmarks(21)
    await browserContext.loginAs(reader)
    const page = await visit(route('bookmarks.index'))

    await page
      .getByRole('navigation', { name: 'Pages of bookmarks', exact: true })
      .getByRole('button', { name: 'Go to next page', exact: true })
      .click()

    await page.waitForURL((url) => url.searchParams.get('page') === '2')
    const list = page.getByRole('list', { name: 'Bookmarks', exact: true })
    await page.assertElementsCount(list.getByRole('listitem'), 1)
    await page.assertVisible(list.getByRole('link', { name: '2:1 · Al-Baqarah', exact: true }))
  })

  test('goes to the page before when the only bookmark on the last page is removed', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await readerWithBookmarks(21)
    await browserContext.loginAs(reader)
    const page = await visit(route('bookmarks.index', {}, { qs: { page: 2 } }))

    await page.getByRole('button', { name: 'Bookmarked 2:1', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click()

    await page.waitForURL((url) => url.searchParams.get('page') === '1')
    await page.assertElementsCount(
      page.getByRole('list', { name: 'Bookmarks', exact: true }).getByRole('listitem'),
      20
    )
  })

  test('has no page controls when the bookmarks fit on one page', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await readerWithBookmarks(20)
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))

    await page.assertElementsCount(
      page.getByRole('list', { name: 'Bookmarks', exact: true }).getByRole('listitem'),
      20
    )
    await page.assertNotExists(
      page.getByRole('navigation', { name: 'Pages of bookmarks', exact: true })
    )
  })

  test("never shows another reader's bookmarks", async ({ visit, route, swap, browserContext }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    const other = await User.create({
      fullName: 'Other Reader',
      email: 'other@example.com',
      password: 'secret-password',
    })
    await other.related('bookmarks').create({ surahNumber: 1, ayahNumber: 5, note: 'Not yours' })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))
    await page.assertPath('/bookmarks')
    await page.assertVisible(
      page.getByText("You haven't bookmarked any ayahs yet", { exact: true })
    )
    await page.assertNotExists(page.getByText('Not yours', { exact: true }))

    const surahPage = await visit(route('surahs.show', { number: 1 }))
    await surahPage.assertPath('/quran/1')
    await surahPage.assertVisible(
      surahPage.getByRole('button', { name: 'Bookmark 1:5', exact: true })
    )
    await surahPage.assertNotExists(
      surahPage.getByRole('button', { name: 'Bookmarked 1:5', exact: true })
    )
  })
})
