import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import FakeRecitationService from '#tests/helpers/quran/fake_recitation_service'

/**
 * The fake Recitation of An-Nasr (110) hears each Word for 1 second after a
 * 0.6 second lead-in, unless a test sets `wordMs`.
 */
test.group('Quran Recitation', () => {
  test('opens the popover on the first Recited Word when Play is pressed', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()

    const popover = page.getByRole('dialog', { name: 'Word 110:1:1', exact: true })
    await page.assertVisible(popover.getByText('idhā', { exact: true }))
  })

  test('moves the popover on to the next Recited Word', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()

    const popover = page.getByRole('dialog', { name: 'Word 110:1:2', exact: true })
    await page.assertVisible(popover.getByText('jāa', { exact: true }))
  })

  test('carries on into the next Ayah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 400 }))

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()

    await page.assertText(page.getByTestId('recited-ayah'), '110:2')
    await page.assertVisible(page.getByRole('dialog', { name: /^Word 110:2:/ }))
  })

  test('plays from the start of the chosen Ayah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:1', exact: true }))
  })

  test('plays the chosen Ayah from its first Word when that Word starts before the Ayah', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ ayahLagMs: 300 }))

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:1', exact: true }))
  })

  test('keeps the popover open when paused', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:1', exact: true }))
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()

    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
    await page.assertVisible(page.getByRole('dialog', { name: /^Word 110:3:/ }))
  })

  test('resumes where it paused', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:1', exact: true }))
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()

    // Starting over would reach 110:3:2 only after 13 seconds.
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:2', exact: true }))
  })

  test('pauses and shows the Word the reader clicks', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
    await page.locator('[data-word-location="110:3:4"]').click()

    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
    const popover = page.getByRole('dialog', { name: 'Word 110:3:4', exact: true })
    await page.assertVisible(popover.getByText("wa-is'taghfir'hu", { exact: true }))
  })

  test('pauses and closes the popover on Escape', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
    await page.keyboard.press('Escape')

    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
    await page.assertNotExists(page.getByRole('dialog'))
  })

  test('pauses and closes the popover on a click outside it', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
    await page.getByRole('heading', { level: 1 }).click()

    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
    await page.assertNotExists(page.getByRole('dialog'))
  })

  test('keeps the popover on the last Recited Word over a Word with no timing', async ({
    assert,
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ untimed: ['110:1:2'] }))

    const page = await visit(route('surahs.show', { number: 110 }))
    // Notes each change of the open Word, 'none' when no Word is open (browser
    // code, so passed as a string). React swaps the open Word in one commit.
    await page.evaluate(`
      globalThis.openWords = ['none']
      new MutationObserver(() => {
        const open = document.querySelector('[data-word-location][aria-expanded="true"]')
        const now = open ? open.dataset.wordLocation : 'none'
        if (globalThis.openWords.at(-1) !== now) globalThis.openWords.push(now)
      }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-expanded'] })
    `)
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:3', exact: true }))

    const openWords = await page.evaluate<string[]>('globalThis.openWords')
    assert.deepEqual(openWords, ['none', '110:1:1', '110:1:3'])
  })

  test('stops and closes the popover at the end of the Surah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 100 }))

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: /^Word 110:3:/ }))

    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
    await page.assertNotExists(page.getByRole('dialog'))
  })

  test('says when the Recitation is unavailable, and Words still open', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, FakeRecitationService.unavailable())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertVisible(
      page.getByText('Recitation is unavailable right now.', { exact: true })
    )

    await page.locator('[data-word-location="110:1:1"]').click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
  })
})
