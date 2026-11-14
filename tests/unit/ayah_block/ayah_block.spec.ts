import { test } from '@japa/runner'
import AyahBlock from '#ayah_block/ayah_block'

const AL_BAQARAH = Array.from({ length: 286 }, (_, index) => index + 1)

test.group('AyahBlock.openingAt', () => {
  test('opens at {ayah} with ayahs {first}–{last}')
    .with([
      { ayah: undefined, first: 1, last: 20, openedAt: null, previous: null, next: 21 },
      { ayah: 7, first: 1, last: 20, openedAt: 7, previous: null, next: 21 },
      { ayah: 250, first: 241, last: 260, openedAt: 250, previous: 221, next: 261 },
      { ayah: 246, first: 241, last: 260, openedAt: 246, previous: 221, next: 261 },
      { ayah: 244, first: 221, last: 260, openedAt: 244, previous: 201, next: 261 },
      { ayah: 241, first: 221, last: 260, openedAt: 241, previous: 201, next: 261 },
      { ayah: 283, first: 261, last: 286, openedAt: 283, previous: 241, next: null },
      { ayah: 287, first: 1, last: 20, openedAt: null, previous: null, next: 21 },
    ])
    .run(({ assert }, { ayah, first, last, openedAt, previous, next }) => {
      const block = AyahBlock.openingAt(ayah, 286)

      const ayahs = block.slice(AL_BAQARAH)
      assert.deepEqual([ayahs[0], ayahs.at(-1)], [first, last])
      assert.equal(block.openedAt, openedAt)
      assert.include(block.toScrollProps(), { previousPage: previous, nextPage: next })
    })

  test('names the opened range by the block that holds the opened ayah', ({ assert }) => {
    assert.equal(AyahBlock.openingAt(243, 286).toScrollProps().currentPage, 241)
  })

  test('opens a surah shorter than a block whole, with nothing before or after', ({ assert }) => {
    const block = AyahBlock.openingAt(3, 7)

    assert.deepEqual(block.slice([1, 2, 3, 4, 5, 6, 7]), [1, 2, 3, 4, 5, 6, 7])
    assert.deepEqual(block.toScrollProps(), {
      pageName: 'ayah',
      currentPage: 1,
      previousPage: null,
      nextPage: null,
    })
  })
})

test.group('AyahBlock.holding', () => {
  test('gives ayahs {first}–{last} for a scroll to ayah {ayah}')
    .with([
      { ayah: 241, first: 241, last: 260 },
      { ayah: 21, first: 21, last: 40 },
      { ayah: 281, first: 281, last: 286 },
      { ayah: 300, first: 1, last: 20 },
    ])
    .run(({ assert }, { ayah, first, last }) => {
      const block = AyahBlock.holding(ayah, 286)

      const ayahs = block.slice(AL_BAQARAH)
      assert.deepEqual([ayahs[0], ayahs.at(-1)], [first, last])
      assert.isNull(block.openedAt)
    })
})
