import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import FakeRecitationService from '#tests/helpers/quran/fake_recitation_service'
import {
  holdRecitationThumbAt,
  recitationThumb,
  waitForRecitationPast,
} from '#tests/helpers/quran/recitation_progress'
import { scrollToAyah, waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'
import { goToArea } from '#tests/helpers/navigation'

/**
 * The fake Recitation hears each Word for `wordMs` (1 second unless a test
 * says otherwise) after a 0.6 second lead-in. The fake Surahs other than 1
 * and 110 have two Words an Ayah: Ya-Sin (36) has 83 Ayahs, so at 10 seconds
 * a Word its Recitation is 27:40 long and never reaches the next Ayah on its
 * own while a test runs. A Surah's page loads its Ayahs in blocks of 20.
 */
test.group('Dragging through the Recitation', () => {
  test('moves the thumb as the Recitation plays', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:1', exact: true }).click()

    // Play starts 0.6 seconds in.
    await waitForRecitationPast(page, 2000)
  })

  test('shows the Ayah Reference under the thumb during a drag', async ({
    visit,
    route,
    swap,
    assert,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    const reference = await holdRecitationThumbAt(page, 0.5)

    // Half way through 83 Ayahs of the same length.
    assert.match(reference, /^36:4[0-4]$/)
  })

  test('plays on unchanged until the reader lets go', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await holdRecitationThumbAt(page, 0.5)

    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })

  test('plays from the start of the Word the reader lets go on', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '110:1')
    await holdRecitationThumbAt(page, 0.5)
    await page.mouse.up()

    // Half way through the 19 Words of An-Nasr is the 10th: 110:2:5, after the 5 Words of 110:1.
    await page.assertVisible(page.getByRole('dialog', { name: /^Word 110:2:[4-6]$/ }))
  })

  test('plays a first Word that begins before its Ayah when the reader lets go on it', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API. Each Ayah is said to start 9 seconds
    // after its first Word, as Quran Foundation's timings can: 110:2:1 is heard from 50.6 to
    // 60.6 seconds, and 110:2 starts at 59.6.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000, ayahLagMs: 9000 }))

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '110:1')
    // About 55 seconds into the 190.6: in 110:2:1, before 110:2 starts.
    await holdRecitationThumbAt(page, 0.29)
    await page.mouse.up()

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:2:1', exact: true }))
  })

  test("leaves another Surah's page where it is when the reader lets go", async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /Al-Baqarah/ }).click()
    await page.waitForURL(route('surahs.show', { number: 2 }))
    // A tenth of the way through Ya-Sin: an Ayah Al-Baqarah has loaded too.
    const reference = await holdRecitationThumbAt(page, 0.1)
    await page.mouse.up()
    await page.assertText(page.getByTestId('recited-ayah'), reference)

    // The page stays at its start.
    await waitForAyahInView(page, 1)
  })

  test('names the Ayah of the Word the reader lets go on', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    const reference = await holdRecitationThumbAt(page, 0.5)
    await page.mouse.up()

    await page.assertText(page.getByTestId('recited-ayah'), reference)
  })

  test('plays a paused Recitation when the reader lets go', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await holdRecitationThumbAt(page, 0.5)
    await page.mouse.up()

    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })

  test('scrolls the recited Surah to the Ayah the reader lets go on', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    // A fifth of the way through: among the first 20 Ayahs, which are loaded.
    const reference = await holdRecitationThumbAt(page, 0.2)
    await page.mouse.up()

    await waitForAyahInView(page, Number(reference.split(':')[1]))
  })

  test('loads only the block of an Ayah far beyond the loaded Ayahs', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    // Nine tenths of the way through: about 36:75, three blocks on.
    const reference = await holdRecitationThumbAt(page, 0.9)
    await page.mouse.up()
    await waitForAyahInView(page, Number(reference.split(':')[1]))

    await page.assertNotExists(page.getByText('36:40', { exact: true }))
  })

  test('loads the block above an Ayah dragged to as the reader scrolls up', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    const reference = await holdRecitationThumbAt(page, 0.9)
    await page.mouse.up()
    await waitForAyahInView(page, Number(reference.split(':')[1]))
    // The Recited Word's popover would take the wheel: closing the Recitation closes it.
    await page.getByRole('button', { name: 'Close Recitation', exact: true }).click()
    await scrollToAyah(page, '36:40', 'up')

    await page.assertExists(page.getByText('36:40', { exact: true }))
  })

  test('loads the block below an Ayah dragged to as the reader scrolls down', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    // Half way through: about 36:42, in the block of 36:41 to 36:60.
    const reference = await holdRecitationThumbAt(page, 0.5)
    await page.mouse.up()
    await waitForAyahInView(page, Number(reference.split(':')[1]))
    // The Recited Word's popover would take the wheel: closing the Recitation closes it.
    await page.getByRole('button', { name: 'Close Recitation', exact: true }).click()
    await scrollToAyah(page, '36:70', 'down')

    await page.assertExists(page.getByText('36:70', { exact: true }))
  })

  test('moves to the next Ayah on the Right arrow', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await recitationThumb(page).focus()
    await page.keyboard.press('ArrowRight')

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:4:1', exact: true }))
  })

  test('moves to the previous Ayah on the Left arrow', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await recitationThumb(page).focus()
    await page.keyboard.press('ArrowLeft')

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:2:1', exact: true }))
  })

  test('goes to the first Ayah on Home', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await recitationThumb(page).focus()
    await page.keyboard.press('Home')

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:1:1', exact: true }))
  })

  test('goes to the last Ayah on End', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await recitationThumb(page).focus()
    await page.keyboard.press('End')

    await page.assertText(page.getByTestId('recited-ayah'), '36:83')
  })

  test('sits at the first Ayah in view before the first Play', async ({ visit, route, swap }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(`${route('surahs.show', { number: 2 })}?ayah=255`)
    await waitForAyahInView(page, 255)

    await page.assertExists(
      recitationThumb(page).and(page.locator('[aria-valuetext="Ayah 2:255"]'))
    )
  })

  test('loads the Recitation and plays from the Ayah a key moves to before the first Play', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await recitationThumb(page).focus()
    await page.keyboard.press('ArrowRight')

    // One Ayah on from 36:1, the first Ayah in view.
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:2:1', exact: true }))
  })

  test('loads the Recitation and plays from the Ayah dragged to before the first Play', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    // A tenth of the way through: among the first 20 Ayahs, which are loaded.
    const reference = await holdRecitationThumbAt(page, 0.1)
    await page.mouse.up()

    await page.assertVisible(page.getByRole('dialog', { name: `Word ${reference}:1`, exact: true }))
  })

  test('lands on an Ayah far beyond the loaded Ayahs, dragged to before the first Play', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    const reference = await holdRecitationThumbAt(page, 0.9)
    await page.mouse.up()

    await waitForAyahInView(page, Number(reference.split(':')[1]))
  })

  test('shows the elapsed and total time on a wide screen', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')

    // 36:3 starts 40.6 seconds in.
    await page.assertVisible(page.getByText(/^0:4\d \/ 27:40$/))
  })

  test('shows no times on a phone', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:1')

    await page.assertNotExists(page.getByTestId('recitation-time'))
  })
})
