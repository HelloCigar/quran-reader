import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import ReadingPosition from '#models/reading_position'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import { waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'

test.group('Quran surah list: Continue at', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('continues a signed-in reader at their Reading Position', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ email: 'ada@example.com', password: 'secret-password' })
    await ReadingPosition.create({ userId: reader.id, surahNumber: 18, ayahNumber: 10 })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.index'))
    await page.getByRole('link', { name: 'Continue at 18:10', exact: true }).click()

    await page.assertPath('/quran/18')
    await waitForAyahInView(page, 10)
  })

  test('shows nothing to a reader with no Reading Position', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({ email: 'ada@example.com', password: 'secret-password' })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.index'))

    await page.assertVisible(page.getByRole('heading', { name: 'The Quran', exact: true }))
    await page.assertNotExists(page.getByText(/^Continue at/))
  })

  test('shows nothing to a signed-out reader', async ({ visit, route, swap }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.index'))

    await page.assertVisible(page.getByRole('heading', { name: 'The Quran', exact: true }))
    await page.assertNotExists(page.getByText(/^Continue at/))
  })
})
