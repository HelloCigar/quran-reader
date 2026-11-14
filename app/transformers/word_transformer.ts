import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Word } from '#types/quran'

export default class WordTransformer extends BaseTransformer<Word> {
  /**
   * What the reader sees when they open a Word.
   */
  toObject() {
    return this.pick(this.resource, ['location', 'arabic', 'transliteration', 'translation'])
  }
}
