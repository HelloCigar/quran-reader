import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Recitation, SurahSummary } from '#types/quran'

export default class RecitationTransformer extends BaseTransformer<Recitation> {
  #surah: SurahSummary

  /**
   * `surah` is the Surah recited. A Recitation keeps playing on other pages,
   * which have no Surah of their own to name it by.
   */
  constructor(resource: Recitation, surah: SurahSummary) {
    super(resource)
    this.#surah = surah
  }

  /**
   * The Surah's audio file and when each Ayah and Word is heard in it, in
   * milliseconds from the start of the file.
   */
  toObject() {
    return {
      surahNumber: this.#surah.number,
      surahName: this.#surah.name,
      audioUrl: this.resource.audioUrl,
      ayahs: this.resource.ayahs.map((ayah) => ({
        number: ayah.number,
        reference: `${this.#surah.number}:${ayah.number}`,
        startMs: ayah.startMs,
        endMs: ayah.endMs,
        words: ayah.words.map((word) => ({
          location: word.location,
          startMs: word.startMs,
          endMs: word.endMs,
        })),
      })),
    }
  }
}
