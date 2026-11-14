import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Quran Words', () => {
  test('opens a Word to show its Arabic, Transliteration and Word Translation', async ({
    visit,
    route,
    swap,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.locator('[data-word-location="1:1:1"]').click()

    const popover = page.getByRole('dialog', { name: 'Word 1:1:1', exact: true })
    await page.assertVisible(popover.getByText('بِسْمِ', { exact: true }))
    await page.assertVisible(popover.getByText("bis'mi", { exact: true }))
    await page.assertVisible(popover.getByText('In (the) name', { exact: true }))
  })

  test('opens a Word from the keyboard', async ({ visit, route, swap }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.locator('[data-word-location="1:2:1"]').press('Enter')

    const popover = page.getByRole('dialog', { name: 'Word 1:2:1', exact: true })
    await page.assertVisible(popover.getByText('al-ḥamdu', { exact: true }))
  })

  test('returns focus to the Word when its popover closes on Escape', async ({
    visit,
    route,
    swap,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    await page.locator('[data-word-location="1:2:1"]').press('Enter')
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 1:2:1', exact: true }))
    await page.keyboard.press('Escape')
    await page.assertNotExists(page.getByRole('dialog'))
    await page.keyboard.press('Enter')

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 1:2:1', exact: true }))
  })

  test('does not open the ayah-end marker', async ({ visit, route, swap }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))
    const marker = page.locator('#ayah-1').getByTestId('ayah-end')
    await page.assertText(marker, '۝١')
    await marker.click()

    await page.assertNotExists(page.getByRole('dialog'))
  })

  test('keeps the pause sign with its Word', async ({ visit, route, swap }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 110 }))
    const word = page.locator('[data-word-location="110:3:4"]')
    await page.assertText(word, 'وَٱسْتَغْفِرْهُ ۚ')
    await word.click()

    const popover = page.getByRole('dialog', { name: 'Word 110:3:4', exact: true })
    await page.assertVisible(popover.getByText("wa-is'taghfir'hu", { exact: true }))
  })
})
