import type { ScrollProps } from '@adonisjs/inertia/types'

/**
 * The Ayahs of a Surah that the reading page holds after one response. Blocks
 * have fixed edges (1–20, 21–40, …) and are named by their first Ayah, which
 * is the `ayah` the reading page's URL carries.
 *
 * Opening a Surah at an Ayah near the start of its block also takes the block
 * before it, so the reader sees some Ayahs above the one they opened.
 */
export default class AyahBlock {
  /**
   * Ayahs in one block.
   */
  static readonly SIZE = 20

  /**
   * How close to its block's start an opened Ayah has to be for the block
   * before it to come too.
   */
  static readonly CONTEXT = 5

  /**
   * The Ayah the reader opened the Surah at, when it is one of the Surah's.
   */
  readonly openedAt: number | null

  readonly #first: number
  readonly #last: number
  readonly #named: number
  readonly #ayahCount: number

  private constructor(openedAt: number | null, first: number, named: number, ayahCount: number) {
    this.openedAt = openedAt
    this.#first = first
    this.#named = named
    this.#last = Math.min(named + AyahBlock.SIZE - 1, ayahCount)
    this.#ayahCount = ayahCount
  }

  /**
   * The block that holds `ayah`, as a scroll up or down asks for it. An Ayah
   * that isn't in the Surah gets the first block.
   */
  static holding(ayah: number | undefined, ayahCount: number) {
    if (ayah === undefined || ayah > ayahCount) return new AyahBlock(null, 1, 1, ayahCount)

    const start = AyahBlock.#startOf(ayah)
    return new AyahBlock(null, start, start, ayahCount)
  }

  /**
   * What a reader opening the Surah at `ayah` gets: the block that holds it,
   * and the block before when `ayah` is within CONTEXT of its block's start.
   * An Ayah that isn't in the Surah is ignored, and the Surah opens at Ayah 1.
   */
  static openingAt(ayah: number | undefined, ayahCount: number) {
    if (ayah === undefined || ayah > ayahCount) return new AyahBlock(null, 1, 1, ayahCount)

    const start = AyahBlock.#startOf(ayah)
    const first = start > 1 && ayah - start < AyahBlock.CONTEXT ? start - AyahBlock.SIZE : start
    return new AyahBlock(ayah, first, start, ayahCount)
  }

  /**
   * The first Ayah of the block that holds `ayah`.
   */
  static #startOf(ayah: number) {
    return Math.floor((ayah - 1) / AyahBlock.SIZE) * AyahBlock.SIZE + 1
  }

  /**
   * This range's Ayahs, from the Surah's Ayahs in order.
   */
  slice<T>(ayahs: T[]): T[] {
    return ayahs.slice(this.#first - 1, this.#last)
  }

  /**
   * The infinite-scroll cursor: this block's name, and the names of the
   * blocks just before and after the range, `null` past either end.
   */
  toScrollProps(): ScrollProps {
    return {
      pageName: 'ayah',
      currentPage: this.#named,
      previousPage: this.#first > 1 ? this.#first - AyahBlock.SIZE : null,
      nextPage: this.#last < this.#ayahCount ? this.#last + 1 : null,
    }
  }
}
