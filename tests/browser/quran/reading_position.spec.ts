import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Bookmark from '#models/bookmark'
import ReadingPosition from '#models/reading_position'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import FakeRecitationService from '#tests/helpers/quran/fake_recitation_service'
import { scrollPastAyah, waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'
import { readingPositionOf, waitForReadingPosition } from '#tests/helpers/reading_position'

test.group('Reading Position', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('is the Ayah a signed-in reader scrolled past', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ email: 'ada@example.com', password: 'secret-password' })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 18 }))
    await scrollPastAyah(page, 10)
    await page.close()

    await waitForReadingPosition(reader, '18:10')
  })

  test('is the Ayah a signed-in reader stays on', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ email: 'ada@example.com', password: 'secret-password' })
    await browserContext.loginAs(reader)

    await visit(`${route('surahs.show', { number: 2 })}?ayah=255`)

    await waitForReadingPosition(reader, '2:255')
  })

  test('stays where it was after a quick look at a Bookmark', async ({
    visit,
    route,
    swap,
    browserContext,
    assert,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ email: 'ada@example.com', password: 'secret-password' })
    await ReadingPosition.create({ userId: reader.id, surahNumber: 18, ayahNumber: 10 })
    await Bookmark.create({ userId: reader.id, surahNumber: 2, ayahNumber: 255 })
    await browserContext.loginAs(reader)

    const page = await visit(route('bookmarks.index'))
    await page.getByRole('link', { name: /^2:255/ }).click()
    await waitForAyahInView(page, 255)
    await page.close()
    // A round trip after leaving, so a save sent on the way out has arrived.
    const later = await visit(route('bookmarks.index'))
    await later.close()

    assert.equal(await readingPositionOf(reader), '18:10')
  })

  test('follows a Recitation to the last Ayah heard', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())
    const reader = await User.create({ email: 'ada@example.com', password: 'secret-password' })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:1', exact: true }).click()
    // 36:5 is heard about 9 seconds in (two 1-second Words an Ayah), past the assertions' 5 seconds.
    await page
      .getByTestId('recited-ayah')
      .getByText('36:5', { exact: true })
      .waitFor({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:5')
    await page.close()

    await waitForReadingPosition(reader, '36:5')
  })

  test('is not kept for a signed-out reader', async ({ visit, route, swap, db }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 18 }))
    await scrollPastAyah(page, 10)
    await page.close()
    // A round trip after leaving, so a save sent on the way out has arrived.
    const later = await visit(route('surahs.index'))
    await later.close()

    await db.assertEmpty('reading_positions')
  })

  test("moves only the reader's own Reading Position", async ({
    visit,
    route,
    swap,
    browserContext,
    assert,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ email: 'ada@example.com', password: 'secret-password' })
    const other = await User.create({ email: 'grace@example.com', password: 'secret-password' })
    await ReadingPosition.create({ userId: other.id, surahNumber: 2, ayahNumber: 255 })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 18 }))
    await scrollPastAyah(page, 10)
    await page.close()
    await waitForReadingPosition(reader, '18:10')

    assert.equal(await readingPositionOf(other), '2:255')
  })
})
