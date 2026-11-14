import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuranTextService from '#services/quran_text_service'
import FakeQuranTextService from '#tests/helpers/quran/fake_quran_text_service'

test.group('Quran surah reading', () => {
  test('shows the surah heading', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))

    await page.assertPath('/quran/2')
    await page.assertVisible(page.getByRole('heading', { name: 'Al-Baqarah', exact: true }))
    await page.assertVisible(page.getByText('البقرة', { exact: true }))
    await page.assertVisible(page.getByText('The Cow', { exact: true }))
    await page.assertVisible(page.getByText('Medinan · 286 ayahs', { exact: true }))
  })

  test('shows the Bismillah on its own line before the first ayah', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))

    await page.assertPath('/quran/2')
    await page.assertVisible(page.getByTestId('bismillah'))
    await page.assertText(
      '[data-testid="bismillah"]',
      '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0640\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'
    )
  })

  test('shows no separate Bismillah line on surah {number}')
    .with([
      { number: 1, heading: 'Al-Fatihah' },
      { number: 9, heading: 'At-Tawbah' },
    ])
    .run(async ({ visit, route, swap }, { number, heading }) => {
      swap(QuranTextService, new FakeQuranTextService())

      const page = await visit(route('surahs.show', { number }))

      await page.assertPath(`/quran/${number}`)
      await page.assertVisible(page.getByRole('heading', { name: heading, exact: true }))
      await page.assertNotExists(page.getByTestId('bismillah'))
    })

  test("shows each ayah's Arabic ending in its ayah-end marker, its English and reference", async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))

    await page.assertPath('/quran/1')
    const ayahs = page.getByRole('list', { name: 'Ayahs', exact: true })
    await page.assertVisible(ayahs.getByText('1:2', { exact: true }))
    await page.assertVisible(
      ayahs.getByText(
        '\u0671\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650 \u0631\u064E\u0628\u0651\u0650 \u0671\u0644\u0652\u0639\u064E\u0640\u0670\u0644\u064E\u0645\u0650\u064A\u0646\u064E \u06DD\u0662',
        { exact: true }
      )
    )
    await page.assertVisible(
      ayahs.getByText('[All] praise is [due] to Allāh, Lord of the worlds -', { exact: true })
    )
  })

  test('shows every ayah of the surah', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))

    await page.assertPath('/quran/2')
    await page.assertVisible(page.getByText('2:286', { exact: true }))
    await page.assertElementsCount(
      page.getByRole('list', { name: 'Ayahs', exact: true }).getByRole('listitem'),
      286
    )
  })

  test('opens a long surah at the ayah its link points to', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(`${route('surahs.show', { number: 2 })}#ayah-250`)

    await page.assertVisible(page.getByText('2:250', { exact: true }))
    // Japa's browser client has no in-viewport assertion: wait until the ayah's top is on screen.
    await page.waitForFunction(`(() => {
      const top = document.getElementById('ayah-250')?.getBoundingClientRect().top
      return top !== undefined && top >= 0 && top < window.innerHeight
    })()`)
  })

  test('credits the text source and the translation', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))

    await page.assertPath('/quran/1')
    await page.assertVisible(
      page.getByText(
        'Quran text and word-by-word data from Quran Foundation (quran.foundation) · English translation: Saheeh International.',
        { exact: false }
      )
    )
    await page.assertExists(page.getByRole('link', { name: 'Quran Foundation', exact: true }))
  })

  test('opens the {direction} surah from the pager')
    .with([
      {
        direction: 'previous',
        label: 'Previous surah: Al-Fatihah',
        number: 1,
        heading: 'Al-Fatihah',
      },
      { direction: 'next', label: "Next surah: Ali 'Imran", number: 3, heading: "Ali 'Imran" },
    ])
    .run(async ({ visit, route, swap }, { label, number, heading }) => {
      swap(QuranTextService, new FakeQuranTextService())

      const page = await visit(route('surahs.show', { number: 2 }))
      await page.getByRole('link', { name: label, exact: true }).click()

      await page.assertPath(route('surahs.show', { number }))
      await page.assertVisible(page.getByRole('heading', { name: heading, exact: true }))
    })

  test('offers no {direction} link on surah {number}')
    .with([
      { direction: 'previous', number: 1, pattern: /^Previous surah/ },
      { direction: 'next', number: 114, pattern: /^Next surah/ },
    ])
    .run(async ({ visit, route, swap }, { number, pattern }) => {
      swap(QuranTextService, new FakeQuranTextService())

      const page = await visit(route('surahs.show', { number }))

      await page.assertPath(`/quran/${number}`)
      await page.assertVisible(page.getByRole('link', { name: 'All surahs', exact: true }))
      // oxlint-disable-next-line flow/playwright-locators-are-exact -- pattern is a RegExp, which exact does not apply to
      await page.assertNotExists(page.getByRole('link', { name: pattern }))
    })

  test('returns to the surah list from a surah', async ({ visit, route, swap }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 2 }))
    await page.getByRole('link', { name: 'All surahs', exact: true }).click()

    await page.assertPath(route('surahs.index'))
    await page.assertVisible(page.getByRole('heading', { name: 'The Quran', exact: true }))
  })

  test("shows the unavailable message when a surah can't be loaded", async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, FakeQuranTextService.unavailable())

    const page = await visit(route('surahs.show', { number: 2 }))

    await page.assertPath('/quran/2')
    await page.assertVisible(
      page.getByRole('heading', { name: 'Quran text unavailable', exact: true })
    )
    await page.assertVisible(
      page.getByText("The Quran text couldn't be loaded right now. Please try again in a moment.", {
        exact: true,
      })
    )
    await page.assertNotExists(page.getByRole('list', { name: 'Ayahs', exact: true }))
  })
})

test.group('Quran surah reading bookmarks', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('offers a bookmark action on every ayah to a signed-out reader', async ({
    visit,
    route,
    swap,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())

    const page = await visit(route('surahs.show', { number: 1 }))

    await page.assertPath('/quran/1')
    for (const ayah of [1, 2, 3, 4, 5, 6, 7]) {
      await page.assertVisible(page.getByRole('link', { name: `Bookmark 1:${ayah}`, exact: true }))
      await page.assertNotExists(
        page.getByRole('button', { name: `Bookmarked 1:${ayah}`, exact: true })
      )
    }
  })

  test('marks the ayahs the signed-in reader has bookmarked', async ({
    visit,
    route,
    swap,
    browserContext,
  }) => {
    swap(QuranTextService, new FakeQuranTextService())
    const reader = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret-password',
    })
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 2, note: null })
    await reader.related('bookmarks').create({ surahNumber: 1, ayahNumber: 5, note: null })
    await browserContext.loginAs(reader)

    const page = await visit(route('surahs.show', { number: 1 }))

    await page.assertPath('/quran/1')
    for (const ayah of [2, 5]) {
      await page.assertVisible(
        page.getByRole('button', { name: `Bookmarked 1:${ayah}`, exact: true })
      )
    }
    for (const ayah of [1, 3, 4, 6, 7]) {
      await page.assertVisible(
        page.getByRole('button', { name: `Bookmark 1:${ayah}`, exact: true })
      )
    }
  })
})
