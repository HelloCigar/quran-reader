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

  test('opens a long surah at the ayah whose note it asks for', async ({
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
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 250, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(`${route('surahs.show', { number: 2 })}?note=250`)

    await page.assertVisible(page.getByRole('dialog', { name: 'Note on 2:250', exact: true }))
    await waitForAyahInView(page, 250)
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
