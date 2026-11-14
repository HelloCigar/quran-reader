import { test } from '@japa/runner'
import QuranTextService from '#services/quran_text_service'
import RecitationService from '#services/recitation_service'
import { quranCache } from '#start/cache'
import FakeQuranFoundation from '#tests/helpers/quran/fake_quran_foundation'

/**
 * Each test runs the real services and SDK against an in-memory Quran
 * Foundation (the external Content API), with an empty Quran cache.
 */
test.group('RecitationService', (group) => {
  group.each.setup(() => quranCache.clear())

  test('times each Ayah and Word of the Surah by Word Location', async ({ assert, cleanup }) => {
    FakeQuranFoundation.install(cleanup)
    const surah = await new QuranTextService().readSurah(110)

    const recitation = await new RecitationService().readRecitation(surah)

    assert.deepEqual(recitation, {
      audioUrl: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/110.mp3',
      ayahs: [
        {
          number: 1,
          startMs: 0,
          endMs: 2000,
          words: [
            { location: '110:1:1', startMs: 0, endMs: 1000 },
            { location: '110:1:2', startMs: 1000, endMs: 2000 },
          ],
        },
        {
          number: 2,
          startMs: 2000,
          endMs: 4000,
          words: [
            { location: '110:2:1', startMs: 2000, endMs: 3000 },
            { location: '110:2:2', startMs: 3000, endMs: 4000 },
          ],
        },
        {
          number: 3,
          startMs: 4000,
          endMs: 6000,
          words: [
            { location: '110:3:1', startMs: 4000, endMs: 5000 },
            { location: '110:3:2', startMs: 5000, endMs: 6000 },
          ],
        },
      ],
    })
  })

  test('leaves out timings for positions that are not Words', async ({ assert, cleanup }) => {
    const quranFoundation = FakeQuranFoundation.install(cleanup)
    quranFoundation.audioFile(110).timestamps[0].segments.push([3, 2000, 2100], [0, 0, 10])
    const surah = await new QuranTextService().readSurah(110)

    const recitation = await new RecitationService().readRecitation(surah)

    assert.deepEqual(
      recitation?.ayahs[0].words.map(({ location }) => location),
      ['110:1:1', '110:1:2']
    )
  })

  test('leaves out a Word with no timing', async ({ assert, cleanup }) => {
    const quranFoundation = FakeQuranFoundation.install(cleanup)
    quranFoundation.audioFile(110).timestamps[1].segments.shift()
    const surah = await new QuranTextService().readSurah(110)

    const recitation = await new RecitationService().readRecitation(surah)

    assert.deepEqual(
      recitation?.ayahs[1].words.map(({ location }) => location),
      ['110:2:2']
    )
  })

  test('is unavailable without an audio file', async ({ assert, cleanup }) => {
    const quranFoundation = FakeQuranFoundation.install(cleanup)
    quranFoundation.audioFile(110).audio_url = null
    const surah = await new QuranTextService().readSurah(110)

    assert.isNull(await new RecitationService().readRecitation(surah))
  })

  test('is unavailable when an Ayah has no timing', async ({ assert, cleanup }) => {
    const quranFoundation = FakeQuranFoundation.install(cleanup)
    quranFoundation.audioFile(110).timestamps.pop()
    const surah = await new QuranTextService().readSurah(110)

    assert.isNull(await new RecitationService().readRecitation(surah))
  })
})
