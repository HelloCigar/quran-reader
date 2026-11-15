import { BaseTransformer } from '@adonisjs/core/transformers'
import type ReadingPosition from '#models/reading_position'
import type { SurahSummary } from '#types/quran'

export default class ReadingPositionTransformer extends BaseTransformer<ReadingPosition> {
  #surahs: SurahSummary[] | null

  /**
   * `surahs` names the Surah on the dashboard; `null` when the Quran text is
   * unavailable. Only the dashboard passes it.
   */
  constructor(resource: ReadingPosition, surahs: SurahSummary[] | null = null) {
    super(resource)
    this.#surahs = surahs
  }

  /**
   * The Surah list's "Continue at 18:10" line.
   */
  toObject() {
    return {
      ...this.pick(this.resource, ['surahNumber', 'ayahNumber']),
      reference: `${this.resource.surahNumber}:${this.resource.ayahNumber}`,
    }
  }

  /**
   * The dashboard's Continue reading card: the Surah's name, or "Surah 18"
   * when the Quran text is unavailable.
   */
  async forContinuing() {
    const base = await this.toObject()
    const surah = this.#surahs?.find((candidate) => candidate.number === base.surahNumber)

    return { ...base, surahName: surah?.name ?? `Surah ${base.surahNumber}` }
  }
}
