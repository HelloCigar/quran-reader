import { BaseTransformer } from '@adonisjs/core/transformers'
import type ReadingPosition from '#models/reading_position'

export default class ReadingPositionTransformer extends BaseTransformer<ReadingPosition> {
  #surahName: string | null

  /**
   * `surahName` names the Surah on the dashboard; `null` when the Quran text
   * is unavailable. Only the dashboard passes it.
   */
  constructor(resource: ReadingPosition, surahName: string | null = null) {
    super(resource)
    this.#surahName = surahName
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
   * reader starts. The title is "Al-Kahf · Ayah 18:10", or "Surah 18 · Ayah
   * 18:10" when the Quran text is unavailable.
   */
  async forContinuing() {
    const base = await this.toObject()
    const heading = this.resource.$isPersisted ? 'Continue reading' : 'Start reading'
    const surahName = this.#surahName ?? `Surah ${base.surahNumber}`

    return {
      ...base,
      heading,
      title: `${surahName} · Ayah ${base.reference}`,
      label: `${heading} at ${base.reference}`,
    }
  }
}
