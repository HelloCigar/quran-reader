import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import FakeRecitationService from '#tests/helpers/quran/fake_recitation_service'
import { waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'
import { waitForReadingPosition } from '#tests/helpers/reading_position'
import { goToArea } from '#tests/helpers/navigation'

/**
 * The fake Recitation hears each Word for 1 second after a 0.6 second
 * lead-in. The fake Surahs other than 1 and 110 have two Words an Ayah.
 */
test.group('Recitation bar', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('keeps a Recitation playing when the reader goes to another page', async ({
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

    // 36:3 is heard about 5 seconds in: the Recitation has carried on since the reader left.
    await page
      .getByTestId('recited-ayah')
      .getByText('36:3', { exact: true })
      .waitFor({ timeout: 15_000 })
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })

  test('names the Surah recited on another page', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:1')
    await goToArea(page, 'Quran', route('surahs.index'))

    await page.assertVisible(page.getByRole('link', { name: /^Ya-Sin\s*36:\d+$/ }))
  })

  test('opens the Surah at the Recited Ayah from the bar', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(`${route('surahs.show', { number: 2 })}?ayah=255`)
    await page.getByRole('button', { name: 'Play from 2:255', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '2:255')
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /^Al-Baqarah\s*2:255$/ }).click()

    await page.assertPath(route('surahs.show', { number: 2 }))
    await waitForAyahInView(page, 255)
  })

  test("moves a signed-in reader's Reading Position while they are on another page", async ({
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
    await page.assertText(page.getByTestId('recited-ayah'), '36:1')
    await goToArea(page, 'Dashboard', route('dashboard'))

    // 36:4 is heard about 7 seconds in, with the reader on the dashboard.
    await waitForReadingPosition(reader, '36:4')
  })

  test('stops the Recitation and hides the bar on Close, on another page', async ({
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
    await page.getByRole('button', { name: 'Close Recitation', exact: true }).click()

    await page.assertNotExists(page.getByRole('region', { name: 'Recitation', exact: true }))
  })

  test('goes back to its starting state on Close, on the Surah page', async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '110:3')
    await page.getByRole('button', { name: 'Close Recitation', exact: true }).click()

    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
    await page.assertNotExists(page.getByTestId('recited-ayah'))
    await page.assertNotExists(page.getByRole('button', { name: 'Close Recitation', exact: true }))
  })

  test("closes the Recited Word's popover on Close", async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:1', exact: true }))
    await page.getByRole('button', { name: 'Close Recitation', exact: true }).click()

    await page.assertNotExists(page.getByRole('dialog'))
  })

  test('forgets its place on Close', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:3:1', exact: true }))
    await page.getByRole('button', { name: 'Close Recitation', exact: true }).click()
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()

    // The first Ayah in view, not 110:3 where it was closed.
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
  })

  test("keeps the Recited Word's popover closed while the Surah drawer is open on a phone", async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Quran', exact: true }))

    await page.assertNotExists(page.getByRole('dialog', { name: /^Word / }))
  })

  test("brings the Recited Word's popover back when the Surah drawer closes", async ({
    visit,
    route,
    swap,
  }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 110:1:1', exact: true }))
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Quran', exact: true }))
    await page.keyboard.press('Escape')

    await page.assertVisible(page.getByRole('dialog', { name: /^Word 110:/ }))
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })

  test('does not show off a Surah page before a Recitation has started', async ({
    visit,
    route,
    swap,
  }) => {
    // Stands in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.index'))
    await page.assertVisible(page.getByRole('heading', { level: 1 }))

    await page.assertNotExists(page.getByRole('region', { name: 'Recitation', exact: true }))
  })

  test('remembers nothing after a reload', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService())

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:1')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.assertVisible(page.getByRole('region', { name: 'Recitation', exact: true }))
    await page.reload()
    await page.assertVisible(page.getByRole('heading', { level: 1 }))

    await page.assertNotExists(page.getByRole('region', { name: 'Recitation', exact: true }))
  })
})

/**
 * Most of these tests hear each Word for 10 seconds, so the Recitation never
 * reaches the next Ayah on its own while the test runs.
 */
test.group('Recitation bar: previous and next Ayah', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('plays on from the start of the next Ayah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:3:1', exact: true }))
    await page.getByRole('button', { name: 'Next Ayah', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:4:1', exact: true }))
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })

  test('plays on from the start of the previous Ayah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:3:1', exact: true }))
    await page.getByRole('button', { name: 'Previous Ayah', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:2:1', exact: true }))
    await page.assertVisible(page.getByRole('button', { name: 'Pause Recitation', exact: true }))
  })

  test('moves the Recited Ayah without playing while paused', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:3:1', exact: true }))
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await page.getByRole('button', { name: 'Next Ayah', exact: true }).click()

    await page.assertText(page.getByTestId('recited-ayah'), '36:4')
    await page.assertVisible(page.getByRole('button', { name: 'Play Recitation', exact: true }))
  })

  test('plays from the Ayah moved to while paused', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:3:1', exact: true }))
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await page.getByRole('button', { name: 'Previous Ayah', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:2')
    await page.getByRole('button', { name: 'Play Recitation', exact: true }).click()

    await page.assertVisible(page.getByRole('dialog', { name: 'Word 36:2:1', exact: true }))
  })

  test('disables Previous Ayah on the first Ayah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:1', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '110:1')

    await page.assertDisabled(page.getByRole('button', { name: 'Previous Ayah', exact: true }))
  })

  test('disables Next Ayah on the last Ayah of the Surah', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 110 }))
    await page.getByRole('button', { name: 'Play from 110:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '110:3')

    await page.assertDisabled(page.getByRole('button', { name: 'Next Ayah', exact: true }))
  })

  test('scrolls the recited Surah to the Ayah moved to', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(`${route('surahs.show', { number: 2 })}?ayah=255`)
    await page.getByRole('button', { name: 'Play from 2:255', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '2:255')
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await page.getByRole('button', { name: 'Previous Ayah', exact: true }).click()

    await waitForAyahInView(page, 254)
  })

  test('moves the Recitation from another page', async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:3', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:3')
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('button', { name: 'Next Ayah', exact: true }).click()

    await page.assertText(page.getByTestId('recited-ayah'), '36:4')
  })

  test("leaves another Surah's page where it is", async ({ visit, route, swap }) => {
    // Both stand in for the Quran Foundation Content API.
    swap(QuranTextService, new FakeQuranTextService())
    swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))

    const page = await visit(route('surahs.show', { number: 36 }))
    await page.getByRole('button', { name: 'Play from 36:5', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:5')
    await page.getByRole('button', { name: 'Pause Recitation', exact: true }).click()
    await goToArea(page, 'Quran', route('surahs.index'))
    await page.getByRole('link', { name: /Al-Baqarah/ }).click()
    await page.waitForURL(route('surahs.show', { number: 2 }))
    await page.getByRole('button', { name: 'Next Ayah', exact: true }).click()
    await page.assertText(page.getByTestId('recited-ayah'), '36:6')

    // Al-Baqarah has an Ayah 6 too: the page stays at its start.
    await waitForAyahInView(page, 1)
  })
})
