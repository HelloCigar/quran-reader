import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Bookmarks destroy', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('removes a bookmark without a note at once', async ({
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
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByRole('button', { name: 'Bookmark 1:3', exact: true }))
    await page.assertVisible(page.getByText('Bookmark removed', { exact: true }))
    await page.assertNotExists(page.getByRole('alertdialog'))
    await db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 })
  })

  test('asks before removing a bookmark that has a note, then removes it', async ({
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
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 3, note: 'Keep me' })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click()
    await page.assertVisible(
      page.getByText('Remove bookmark 1:3? Your note will be lost.', { exact: true })
    )
    await page.getByRole('alertdialog').getByRole('button', { name: 'Remove', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertVisible(page.getByRole('button', { name: 'Bookmark 1:3', exact: true }))
    await db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 })
  })

  test('keeps the bookmark and its note when removal is declined', async ({
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
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 3, note: 'Keep me' })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Remove', exact: true }).click()
    const confirmation = page.getByRole('alertdialog')
    await confirmation.getByRole('button', { name: 'Keep', exact: true }).click()

    await page.assertPath('/quran/1')
    await page.assertNotVisible(confirmation)
    await page.assertVisible(page.getByRole('button', { name: 'Bookmarked 1:3', exact: true }))
    await db.assertHas(
      'bookmarks',
      { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'Keep me' },
      1
    )
  })
})
