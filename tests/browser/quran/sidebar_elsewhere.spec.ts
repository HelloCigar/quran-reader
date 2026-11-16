import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'
import FakeRecitationService from '#tests/helpers/quran/fake_recitation_service'
import { goToArea } from '#tests/helpers/navigation'
import { waitForAyahInView } from '#tests/helpers/quran/scroll_to_ayah'
import { readerCookie } from '#tests/helpers/quran/reader_cookie'
import { reciteAlBaqarahSignedIn } from '#tests/helpers/quran/recite_signed_in'

/** A phone's screen, narrower than the reader's sidebar breakpoint. */
const PHONE = { width: 390, height: 844 }

/**
 * Al-Baqarah (2) is recited while the signed-in reader is on the dashboard.
 * The fake Recitation hears each Word for 10 seconds, so it stays on 2:1.
 */
test.group('The Surah and Ayah sidebar off a Surah page', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('opens the drawer on the dashboard, set to the Surah being recited', async (context) => {
    // Both stand in for the Quran Foundation Content API.
    context.swap(QuranTextService, new FakeQuranTextService())
    context.swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))
    const page = await reciteAlBaqarahSignedIn(context)
    await goToArea(page, 'Dashboard', context.route('dashboard'))

    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()

    const surahs = page
      .getByRole('dialog', { name: 'Quran', exact: true })
      .getByRole('list', { name: 'Surahs', exact: true })
    await page.assertTextContains(surahs.locator('[aria-current="true"]'), 'Al-Baqarah')
    await page.assertElementsCount(surahs.getByRole('listitem'), 114)
  })

  test('opens the Surah chosen in the drawer', async (context) => {
    // Both stand in for the Quran Foundation Content API.
    context.swap(QuranTextService, new FakeQuranTextService())
    context.swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))
    await context.browserContext.addCookies([readerCookie('reader_sidebar_mode', 'surah')])
    const page = await reciteAlBaqarahSignedIn(context)
    await goToArea(page, 'Dashboard', context.route('dashboard'))
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Quran', exact: true })

    await drawer.getByText("Ali 'Imran", { exact: true }).click()

    await page.waitForURL('**/quran/3')
    await page.assertVisible(page.getByRole('heading', { name: "Ali 'Imran", exact: true }))
    await page.assertNotVisible(drawer)
  })

  test('opens the Ayah chosen in the drawer', async (context) => {
    // Both stand in for the Quran Foundation Content API.
    context.swap(QuranTextService, new FakeQuranTextService())
    context.swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))
    const page = await reciteAlBaqarahSignedIn(context)
    await goToArea(page, 'Dashboard', context.route('dashboard'))
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()

    await page
      .getByRole('dialog', { name: 'Quran', exact: true })
      .getByRole('list', { name: 'Ayahs of Al-Baqarah', exact: true })
      .getByText('255', { exact: true })
      .click()

    await page.waitForURL(
      (url) => url.pathname === '/quran/2' && url.searchParams.get('ayah') === '255'
    )
    await waitForAyahInView(page, 255)
  })

  test('keeps the drawer open on a phone to choose an Ayah of the Surah chosen in Verse mode', async (context) => {
    // Both stand in for the Quran Foundation Content API.
    context.swap(QuranTextService, new FakeQuranTextService())
    context.swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))
    const page = await reciteAlBaqarahSignedIn(context)
    await goToArea(page, 'Dashboard', context.route('dashboard'))
    await page.setViewportSize(PHONE)
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Quran', exact: true })
    await drawer.getByText("Ali 'Imran", { exact: true }).click()
    await page.waitForURL('**/quran/3')

    await drawer
      .getByRole('list', { name: "Ayahs of Ali 'Imran", exact: true })
      .getByText('5', { exact: true })
      .click()

    await page.waitForURL(
      (url) => url.pathname === '/quran/3' && url.searchParams.get('ayah') === '5'
    )
    await waitForAyahInView(page, 5)
    await page.assertNotVisible(drawer)
  })

  test('sends the dashboard without the Surahs until the drawer opens', async (context) => {
    // Both stand in for the Quran Foundation Content API.
    context.swap(QuranTextService, new FakeQuranTextService())
    context.swap(RecitationService, new FakeRecitationService({ wordMs: 10_000 }))
    const page = await reciteAlBaqarahSignedIn(context)
    const answered = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/dashboard' &&
        response.request().headers()['x-inertia'] === 'true'
    )
    await goToArea(page, 'Dashboard', context.route('dashboard'))
    const dashboard = await answered
    const sent = await dashboard.json()

    context.assert.notProperty(sent.props, 'sidebarSurahs')
    await page.getByRole('button', { name: 'Show Surahs', exact: true }).click()
    await page.assertVisible(
      page
        .getByRole('dialog', { name: 'Quran', exact: true })
        .getByRole('list', { name: 'Surahs', exact: true })
    )
  })
})
