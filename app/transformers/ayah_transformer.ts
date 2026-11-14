import { BaseTransformer } from '@adonisjs/core/transformers'
import WordTransformer from '#transformers/word_transformer'
import type { Ayah } from '#types/quran'

/**
 * Formats ayah numbers in Arabic-Indic digits (`٢٥٥`), as the Mushaf does.
 */
const ARABIC_DIGITS = new Intl.NumberFormat('ar-EG', { useGrouping: false })

/**
 * U+06DD ARABIC END OF AYAH: fonts that support it draw it around the digits
 * that follow.
 */
const END_OF_AYAH = '۝'

export default class AyahTransformer extends BaseTransformer<Ayah> {
  #surahNumber: number

  constructor(resource: Ayah, surahNumber: number) {
    super(resource)
    this.#surahNumber = surahNumber
  }

  /**
   * The Arabic as its Words, each passed through exactly as the service
   * returns it, then the ayah-end marker.
   */
  toObject() {
    return {
      ...this.pick(this.resource, ['number', 'english']),
      reference: `${this.#surahNumber}:${this.resource.number}`,
      words: WordTransformer.transform(this.resource.words),
      endMarker: `${END_OF_AYAH}${ARABIC_DIGITS.format(this.resource.number)}`,
    }
  }
}
