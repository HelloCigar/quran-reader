import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import { scrollToAyah } from '#tests/helpers/quran/scroll_to_ayah'

test.group('Bookmarks update', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('saves a note written in the note dialog', async ({
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
    await dialog.getByLabel('Note', { exact: true }).fill('Remember this')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByText('Note saved', { exact: true }))
    await page.assertNotVisible(dialog)
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'Remember this' },
      1
    )
  })

  test('changes an existing note through "Edit note"', async ({
    visit,
    route,
    swap,
    browserContext,
    db,
    assert,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 3, note: 'Old' })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Edit note', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Note on 1:3', exact: true })
    const field = dialog.getByLabel('Note', { exact: true })
    assert.equal(await field.inputValue(), 'Old')
    await field.fill('New')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByText('Note saved', { exact: true }))
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'New' },
      1
    )
  })

  test('rejects a note longer than 500 characters and keeps the bookmark', async ({
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
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 3, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Edit note', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Note on 1:3', exact: true })
    await dialog.getByLabel('Note', { exact: true }).fill('a'.repeat(501))
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(
      dialog.getByText('Notes can be at most 500 characters.', { exact: true })
    )
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null },
      1
    )
  })

  test('stores "{label}" as no note')
    .with([
      { label: 'an empty note', value: '' },
      { label: 'a whitespace-only note', value: '   ' },
    ])
    .run(async ({ visit, route, swap, browserContext, db }, { value }) => {
      swap(QuranTextService, new FakeQuranTextService())
      const reader = await User.create({
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'secret-password',
      })
      await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 3, note: 'Old' })
      await browserContext.loginAs(reader)

      const page = await visit(route('surahs.show', { number: 1 }))
      await page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }).click()
      await page.getByRole('menuitem', { name: 'Edit note', exact: true }).click()
      const dialog = page.getByRole('dialog', { name: 'Note on 1:3', exact: true })
      await dialog.getByLabel('Note', { exact: true }).fill(value)
      await dialog.getByRole('button', { name: 'Save', exact: true }).click()

      await page.assertPath('/quran/1')
      await page.assertVisible(page.getByText('Note saved', { exact: true }))
      await db.assertHas(
        'bookmarks',
        { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null },
        1
      )
    })

  test('rejects saving a note on a bookmark removed in another tab', async ({
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
    const bookmark = await reader
      .related('bookmarks')
      .create({ surahNumber: 1, ayahNumber: 3, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Edit note', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Note on 1:3', exact: true })
    await bookmark.delete()
    await dialog.getByLabel('Note', { exact: true }).fill('Late')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(
      page.getByText('This bookmark was removed. Bookmark the ayah again to add a note.', {
        exact: true,
      })
    )
    await db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 })
  })

  test('keeps the ayahs loaded so far when a note further down is saved', async ({
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
    await reader.related('bookmarks').create({ surahNumber: 2, ayahNumber: 50, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 2 }))
    await scrollToAyah(page, '2:50', 'down')
    await page.getByRole('button', { name: 'Bookmarked 2:50', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Edit note', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'Note on 2:50', exact: true })
    await dialog.getByLabel('Note', { exact: true }).fill('Remember this')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await page.assertVisible(page.getByText('Note saved', { exact: true }))
    await page.assertExists(page.getByText('2:1', { exact: true }))
    await page.assertExists(page.getByText('2:50', { exact: true }))
  })
})
