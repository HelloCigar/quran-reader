import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Quran reader entry', () => {
  test('reaches the surah list from the home page', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('home'))
    await page.getByRole('link', { name: 'Read the Quran', exact: true }).click()

    await page.assertPath(route('surahs.index'))
    await page.assertVisible(page.getByRole('heading', { name: 'The Quran', exact: true }))
  })
})
