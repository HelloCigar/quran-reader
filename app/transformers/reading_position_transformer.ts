import { BaseTransformer } from '@adonisjs/core/transformers'
import type ReadingPosition from '#models/reading_position'
import type { ContinuingSurah } from '#types/quran'

export default class ReadingPositionTransformer extends BaseTransformer<ReadingPosition> {
  #surah: ContinuingSurah | null

  /**
   * `surah` describes the Surah on the dashboard; `null` when the Quran text
   * is unavailable. Only the dashboard passes it.
   */
  constructor(resource: ReadingPosition, surah: ContinuingSurah | null = null) {
    super(resource)
    this.#surah = surah
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
   * The dashboard's main card: "Continue reading" at the reader's Reading
   * Position, or "Start reading" at a position not yet saved, where a new
   * reader starts. It names the Surah ("Al-Kahf", or "Surah 18" when the
   * Quran text is unavailable), the Ayah ("Ayah 18:10 · The Cave"), the
   * Ayah's Arabic, and how far into the Surah it is ("10 of 110 ayahs").
   * The Arabic and the progress are `null` when the text is not at hand, and
   * the progress for a reader who hasn't read yet.
   */
  async forContinuing() {
    const base = await this.toObject()
    const heading = this.resource.$isPersisted ? 'Continue reading' : 'Start reading'
    const surah = this.#surah
    const ayah = surah?.ayahs?.find((candidate) => candidate.number === base.ayahNumber)

    return {
      ...base,
      heading,
      label: `${heading} at ${base.reference}`,
      surahName: surah?.name ?? `Surah ${base.surahNumber}`,
      subtitle: surah ? `Ayah ${base.reference} · ${surah.meaning}` : `Ayah ${base.reference}`,
      arabic: ayah?.arabic ?? null,
      progress:
        surah && this.resource.$isPersisted
          ? {
              percent: Math.round((base.ayahNumber / surah.ayahCount) * 100),
              label: `${base.ayahNumber} of ${surah.ayahCount} ayahs`,
            }
          : null,
    }
  }
}
