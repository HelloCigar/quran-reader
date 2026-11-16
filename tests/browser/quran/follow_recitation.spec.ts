import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import FakeRecitationService from '#tests/helpers/quran/fake_recitation_service'
import {
  isAyahInView,
  recitedAyah,
  scrollAyahs,
  scrollPastAyah,
  scrollToAyah,
  scrollUpToRecitedAyah,
  waitForRecitedAyahInView,
  waitForRecitedAyahOutOfView,
} from '#tests/helpers/quran/scroll_to_ayah'

/**
 * The fake Recitation hears each Word for `wordMs` after a 0.6 second
 * lead-in. The fake Surahs other than 1 and 110 have two Words an Ayah, and a
 * screen shows about five of Al-Baqarah's: an Ayah 6 or more below the first
 * one in view shows only once the page has followed the Recitation down to it.
 */
test.group('Following the Recitation', () => {
  test('keeps the Recited Ayah in view as the Recitation moves down the page', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 400 }))

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('button', { name: 'Play from 2:1', exact: true }).click()

    await waitForRecitedAyahInView(page, { from: 7, to: 13 })
  })

  test('stops following when the reader scrolls away, and the Recitation plays on', async ({
    visit,
    route,
    swap,
    assert,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('button', { name: 'Play from 2:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '2:1')
    await scrollAyahs(page, 'down')

    // Each Word of 2:2 was heard a second or more ago: the page would have followed it by now.
    await page
      .getByTestId('recited-ayah')
      .getByText('2:3', { exact: true })
      .waitFor({ timeout: 15_000 })
    assert.isFalse(await isAyahInView(page, 2))
  })

  test('follows again after Next Ayah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 400 }))

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('button', { name: 'Play from 2:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '2:1')
    await scrollAyahs(page, 'down')
    await page.getByRole('button', { name: 'Next Ayah', exact: true }).click()
    const movedTo = await recitedAyah(page)

    await waitForRecitedAyahInView(page, { from: movedTo + 6, to: movedTo + 12 })
  })

  test('follows again when the reader scrolls the Recited Ayah back into view', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 400 }))

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('button', { name: 'Play from 2:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '2:1')
    await scrollAyahs(page, 'down')
    await waitForRecitedAyahOutOfView(page)
    await scrollUpToRecitedAyah(page)
    const scrolledTo = await recitedAyah(page)

    await waitForRecitedAyahInView(page, { from: scrolledTo + 6, to: scrolledTo + 12 })
  })

  test('follows again when the Recitation reaches the Ayahs the reader scrolled ahead to', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 400 }))

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('button', { name: 'Play from 2:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '2:1')
    // The first Ayah in view is now 2:7.
    await scrollPastAyah(page, 6)

    await waitForRecitedAyahInView(page, { from: 13, to: 19 })
  })

  test('loads the blocks above as the reader scrolls up during a Recitation', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(`${route('surahs.show', { number: 2 })}?ayah=255`)
    await page.getByRole('button', { name: 'Play from 2:255', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '2:255')
    await scrollToAyah(page, '2:221', 'up')

    await page.assertVisible(page.getByText('2:221', { exact: true }))
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })
})
