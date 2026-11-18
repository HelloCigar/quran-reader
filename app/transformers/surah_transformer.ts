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
   * A Surah's row in the surah list: its names, where it was revealed and
   * how many ayahs it has.
   */
  async forIndex() {
    return {
      ...(await this.toObject()),
      ...this.pick(this.resource, ['arabicName', 'revelation']),
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
    return this.pick(this.resource, ['number', 'name', 'arabicName', 'ayahCount'])
  }
}
