import { readFileSync } from 'node:fs'
import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import QuranUnavailableException from '#exceptions/quran_unavailable_exception'
import { quranCache } from '#start/cache'
import FakeQuranFoundation from '#tests/helpers/quran/fake_quran_foundation'
import type { Surah } from '#types/quran'

/**
 * Quran Foundation's 1:1, which is the Bismillah, as recorded in the fixture.
 */
const BISMILLAH = (
  JSON.parse(
    readFileSync(new URL('../../fixtures/quran/surah_1.json', import.meta.url), 'utf8')
  ) as Surah
).ayahs[0].arabic

/**
 * Each test runs the real service and SDK against an in-memory Quran
 * Foundation (the external Content API), with an empty Quran cache.
 */
test.group('QuranTextService', (group) => {
  group.each.setup(() => quranCache.clear())

  test('lists all 114 surahs with their details', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup)

    const surahs = await new QuranTextService().listSurahs()

    assert.lengthOf(surahs, 114)
    assert.deepEqual(surahs.slice(0, 2), [
      {
        number: 1,
        arabicName: 'سورة 1',
        name: 'Surah 1',
        meaning: 'Meaning 1',
        revelation: 'Meccan',
        ayahCount: 3,
      },
      {
        number: 2,
        arabicName: 'سورة 2',
        name: 'Surah 2',
        meaning: 'Meaning 2',
        revelation: 'Medinan',
        ayahCount: 3,
      },
    ])
  })

  test('treats a surah list without all 114 surahs as unavailable', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup).chapters.pop()

    await assert.rejects(() => new QuranTextService().listSurahs(), QuranUnavailableException)
  })

  test('reads every ayah of a surah longer than one page', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup).chapters[1].verses_count = 120

    const surah = await new QuranTextService().readSurah(2)

    assert.deepEqual(
      surah.ayahs.map(({ number }) => number),
      Array.from({ length: 120 }, (_, index) => index + 1)
    )
  })

  test('treats a surah with missing ayahs as unavailable', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup).verses(3).pop()

    await assert.rejects(() => new QuranTextService().readSurah(3), QuranUnavailableException)
  })

  test('gives each ayah its Words, without the ayah-end marker', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup)

    const surah = await new QuranTextService().readSurah(3)

    assert.deepEqual(surah.ayahs[1], {
      number: 2,
      arabic: 'كَلِمَة ثَانِيَة ۚ',
      english: 'Ayah 3:2',
      words: [
        { location: '3:2:1', arabic: 'كَلِمَة', transliteration: 'word-1', translation: 'word' },
        {
          location: '3:2:2',
          arabic: 'ثَانِيَة ۚ',
          transliteration: 'word-2',
          translation: 'second',
        },
      ],
    })
  })

  test('removes footnote markers from the translation', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup).verses(3)[0].translations[0].text =
      'In the name of Allāh,<sup foot_note=195932>1</sup> the Entirely Merciful.'

    const surah = await new QuranTextService().readSurah(3)

    assert.equal(surah.ayahs[0].english, 'In the name of Allāh, the Entirely Merciful.')
  })

  test('treats a translation with other markup as unavailable', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup).verses(3)[0].translations[0].text =
      'In the <i>name</i> of Allāh'

    await assert.rejects(() => new QuranTextService().readSurah(3), QuranUnavailableException)
  })

  test('treats a Word without its translation as unavailable', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup).verses(3)[0].words[0].translation.text = null

    await assert.rejects(() => new QuranTextService().readSurah(3), QuranUnavailableException)
  })

  test('treats a gap in Word positions as unavailable', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup).verses(3)[0].words[1].position = 4

    await assert.rejects(() => new QuranTextService().readSurah(3), QuranUnavailableException)
  })

  test('gives surah {surah} its Bismillah as {expected}')
    .with([
      { surah: 1, expected: 'none', bismillah: null },
      { surah: 2, expected: 'the Uthmani Bismillah', bismillah: BISMILLAH },
      { surah: 9, expected: 'none', bismillah: null },
    ])
    .run(async ({ assert, cleanup }, { surah, bismillah }) => {
      FakeQuranFoundation.install(cleanup)

      const read = await new QuranTextService().readSurah(surah)

      assert.equal(read.bismillah, bismillah)
    })
})
