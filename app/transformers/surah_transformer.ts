import { BaseTransformer } from '@adonisjs/core/transformers'
import type { SurahSummary } from '#types/quran'

export default class SurahTransformer extends BaseTransformer<SurahSummary> {
  toObject() {
    return {
      ...this.pick(this.resource, ['number', 'name', 'meaning']),
      ayahCount: {
        raw: this.resource.ayahCount,
        formatted: `${this.resource.ayahCount} ayahs`,
      },
    }
  }

  /**
   * The surah heading on the reading page.
   */
  async forReading() {
    return {
      ...(await this.toObject()),
      ...this.pick(this.resource, ['arabicName', 'revelation']),
    }
  }

  /**
   * A Surah in the reading page's sidebar: its row, and the Ayah numbers
   * listed beside it.
   */
  async forNavigation() {
    return this.pick(this.resource, ['number', 'name', 'ayahCount'])
  }
}
