import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Quran surah list', () => {
  test('lists all 114 surahs', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.index'))

    await page.assertPath('/quran')
    await page.assertVisible(page.getByRole('heading', { name: 'The Quran', exact: true }))
    await page.assertElementsCount(
      page.getByRole('list', { name: 'Surahs', exact: true }).getByRole('link'),
      114
    )
  })

  test("shows a surah's number, name, meaning and ayah count in its row", async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.index'))

    await page.assertPath('/quran')
    const row = page
      .getByRole('list', { name: 'Surahs', exact: true })
      .getByRole('listitem')
      .filter({ has: page.getByText('1 · Al-Fatihah', { exact: true }) })
    await page.assertVisible(row.getByText('1 · Al-Fatihah', { exact: true }))
    await page.assertVisible(row.getByText('The Opener', { exact: true }))
    await page.assertVisible(row.getByText('7 ayahs', { exact: true }))
  })

  test('opens a surah from the list', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.index'))
    await page
      .getByRole('list', { name: 'Surahs', exact: true })
      .getByRole('link')
      .filter({ hasText: '2 · Al-Baqarah' })
      .click()

    await page.assertPath(route('surahs.show', { number: 2 }))
    await page.assertVisible(page.getByRole('heading', { name: 'Al-Baqarah', exact: true }))
  })

  test("shows the unavailable message when the surah list can't be loaded", async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, FakeQuranTextService.unavailable())

    const page = await visit(route('surahs.index'))

    await page.assertPath('/quran')
    await page.assertVisible(
      page.getByRole('heading', { name: 'Quran text unavailable', exact: true })
    )
    await page.assertVisible(
      page.getByText("The Quran text couldn't be loaded right now. Please try again in a moment.", {
        exact: true,
      })
    )
    await page.assertNotExists(page.getByRole('list', { name: 'Surahs', exact: true }))
  })
})
