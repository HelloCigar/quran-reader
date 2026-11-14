import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Recitation } from '#types/quran'

export default class RecitationTransformer extends BaseTransformer<Recitation> {
  /**
   * The Surah's audio file and when each Ayah and Word is heard in it, in
   * milliseconds from the start of the file.
   */
  toObject() {
    return {
      audioUrl: this.resource.audioUrl,
      ayahs: this.resource.ayahs.map((ayah) => ({
        number: ayah.number,
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
