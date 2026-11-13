import { test } from '@japa/runner'
import { createBookmarkValidator } from '#validators/bookmark'
import { surahAyahCounts } from '#tests/helpers/quran/surah_ayah_counts'

test.group('createBookmarkValidator', () => {
  test('accepts the last ayah of surah {surah} and rejects the one after it')
    .with(surahAyahCounts())
    .run(async ({ assert }, { surah, ayahCount }) => {
      const payload = await createBookmarkValidator.validate({ surah, ayah: ayahCount })
      assert.deepEqual(payload, { surah, ayah: ayahCount })

      await assert.rejects(() => createBookmarkValidator.validate({ surah, ayah: ayahCount + 1 }))
    })
})
