import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Quran surah addresses', () => {
  test('shows the "Not found" page for /quran/{value}')
    .with([{ value: '0' }, { value: '115' }, { value: 'abc' }])
    .run(async ({ visit, route, swap }, { value }) => {
      swap(QuranTextService, new FakeQuranTextService())

      const page = await visit(route('surahs.show', { number: value }))

      await page.assertPath(`/quran/${value}`)
      await page.assertVisible(page.getByRole('heading', { name: 'Not found', exact: true }))
      await page.assertNotExists(page.getByRole('list', { name: 'Ayahs', exact: true }))
    })
})
