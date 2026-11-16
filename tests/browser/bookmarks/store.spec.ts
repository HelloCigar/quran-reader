import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import { waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'

test.group('Bookmarks store', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('bookmarks an ayah and asks for an optional note', async ({
    visit,
    route,
    swap,
    browserContext,
    db,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('button', { name: 'Bookmark 1:3', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 1:3', exact: true }))
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null },
      1
    )
  })

  test('keeps the bookmark without a note when the note request is dismissed', async ({
    visit,
    route,
    swap,
    browserContext,
    db,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('button', { name: 'Bookmark 1:3', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Note on 1:3', exact: true })
    await dialog.getByRole('button', { name: 'Not now', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertNotVisible(dialog)
    await page.assertVisible(page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }))
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null },
      1
    )
  })

  test('keeps one bookmark when the ayah was already bookmarked in another tab', async ({
    visit,
    route,
    swap,
    browserContext,
    db,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    const bookmarkButton = page.getByRole('button', { name: 'Bookmark 1:3', exact: true })
    await page.assertVisible(bookmarkButton)
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 3, note: null })
    await bookmarkButton.click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 1:3', exact: true }))
    await db.assertCount('bookmarks', 1)
    await db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 }, 1)
  })

  test('opens a long surah at the ayah bookmarked while signing in', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })

    const page = await visit(`${route('surahs.show', { number: 2 })}?ayah=250`)
    await page.getByRole('link', { name: 'Bookmark 2:250', exact: true }).click()
    await page.getByLabel('Email', { exact: true }).fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill('secret-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 2:250', exact: true }))
    await waitForAyahInView(page, 250)
  })

  test('keeps the ayahs loaded so far when one is bookmarked', async ({
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

    // Opening at 2:245 loads its block and the one before; 2:225 is in the earlier one.
    const page = await visit(`${route('surahs.show', { number: 2 })}?ayah=245`)
    await page.assertExists(page.getByRole('button', { name: 'Bookmark 2:225', exact: true }))
    await page.getByRole('button', { name: 'Bookmark 2:258', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 2:258', exact: true }))
    await page.assertExists(page.getByRole('button', { name: 'Bookmark 2:225', exact: true }))
  })

  test('bookmarks an ayah deep in a long surah and asks for its note there', async ({
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

    const page = await visit(`${route('surahs.show', { number: 2 })}?ayah=250`)
    await page.getByRole('button', { name: 'Bookmark 2:250', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 2:250', exact: true }))
    await page.assertExists(page.getByRole('button', { name: 'Bookmarked 2:250', exact: true }))
  })
})
