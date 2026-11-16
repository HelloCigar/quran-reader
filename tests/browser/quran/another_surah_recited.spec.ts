import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import FakeRecitationService from '#tests/helpers/quran/fake_recitation_service'
import { goToArea } from '#tests/helpers/navigation'

/**
 * Ya-Sin (36) is recited while the reader opens An-Nasr (110). The fake
 * Recitation hears each Word for 1 second after a 0.6 second lead-in, unless
 * a test sets `wordMs`. The fake Surahs other than 1 and 110 have two Words an
 * Ayah.
 */
test.group('Opening another Surah while one is recited', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test("keeps the Recitation playing on another Surah's page", async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:1')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /An-Nasr/ }).click()
    await page.waitForURL(route('surahs.show', { number: 110 }))

    // 36:3 is heard about 5 seconds in, with An-Nasr open.
    await page
      .getByTestId('recited-ayah')
      .getByText('36:3', { exact: true })
      .waitFor({ timeout: 15_000 })
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })

  test("opens no popover on another Surah's page", async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:1', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: /^Word 36:1:/ }))
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /An-Nasr/ }).click()
    await page.waitForURL(route('surahs.show', { number: 110 }))
    // The Recitation moves on to a Word heard only after An-Nasr is open.
    await page
      .getByTestId('recited-ayah')
      .getByText('36:3', { exact: true })
      .waitFor({ timeout: 15_000 })

    await page.assertNotExists(page.getByRole('dialog'))
  })

  test("starts the open Surah's Recitation from Play on the bar", async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:5', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:5')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /An-Nasr/ }).click()
    await page.waitForURL(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()

    await page.assertText(page.getByTestId('recited-ayah'), '110:1')
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
  })

  test("starts the open Surah's Recitation from Play from this Ayah", async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:5', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:5')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /An-Nasr/ }).click()
    await page.waitForURL(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()

    await page.assertText(page.getByTestId('recited-ayah'), '110:3')
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:1', exact: true }))
  })

  test('pauses the Recitation, still in the bar, when the reader opens a Word of another Surah', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:5', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:5')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /An-Nasr/ }).click()
    await page.waitForURL(route('surahs.show', { number: 110 }))
    await page.locator('[data-word-location="110:3:4"]').click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:4', exact: true }))
    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
    await page.assertText(page.getByTestId('recited-ayah'), '36:5')
  })

  test("brings the popover back onto the Recited Word on the recited Surah's page", async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:1')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /An-Nasr/ }).click()
    await page.waitForURL(route('surahs.show', { number: 110 }))
    await page.getByRole('link', { name: /^Ya-Sin\s*36:\d+$/ }).click()
    await page.waitForURL((url) => url.pathname === route('surahs.show', { number: 36 }))

    await page.assertVisible(page.getByRole('dialog', { name: /^Word 36:/ }))
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })
})
