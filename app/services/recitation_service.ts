import logger from '@adonisjs/core/services/logger'
import type { ChapterId } from '@quranjs/api'
import { quranCache } from '#start/cache'
import { quranFoundation } from '#start/quran_foundation'
import type { AyahTiming, RawRecitationTimestamp, Recitation, Surah } from '#types/quran'

/**
 * Mishary Rashid Alafasy, the one Reciter for now. Quran Foundation publishes
 * Word timings for his Surah audio files.
 */
const RECITER = '7'

const CACHE_OPTIONS = {
  ttl: '30 days',
  grace: '30 days',
  graceBackoff: '5 minutes',
} as const

/**
 * Reads a Surah's Recitation from Quran Foundation: the Reciter's one audio
 * file for the Surah (docs/adr/0002), with when each Ayah and Word is heard.
 */
export default class RecitationService {
  /**
   * The Recitation of the Surah, with Word timings matched to its Words by
   * Word Location. `null` when it can't be loaded, so reading carries on.
   */
  async readRecitation(surah: Surah): Promise<Recitation | null> {
    try {
      return await quranCache.getOrSet({
        key: `qf:recitation:${RECITER}:${surah.number}`,
        ...CACHE_OPTIONS,
        factory: () => this.#fetch(surah),
      })
    } catch (error) {
      logger.warn({ err: error }, 'Recitation unavailable')
      return null
    }
  }

  async #fetch(surah: Surah): Promise<Recitation> {
    const file: { audioUrl?: unknown; timestamps?: unknown } =
      await quranFoundation.audio.findChapterRecitationById(RECITER, surah.number as ChapterId, {
        segments: true,
      })

    if (typeof file?.audioUrl !== 'string' || !Array.isArray(file.timestamps)) {
      throw new Error(`Recitation of surah ${surah.number} has no audio or timings`)
    }

    const timestamps = new Map(
      (file.timestamps as RawRecitationTimestamp[]).map((timestamp) => [
        timestamp.verseKey,
        timestamp,
      ])
    )
    const ayahs = surah.ayahs.map((ayah): AyahTiming => {
      const reference = `${surah.number}:${ayah.number}`
      const timestamp = timestamps.get(reference)
      const { timestampFrom, timestampTo } = timestamp ?? {}

      if (typeof timestampFrom !== 'number' || typeof timestampTo !== 'number') {
        throw new Error(`Ayah ${reference} has no timing`)
      }

      const segments = Array.isArray(timestamp?.segments) ? timestamp.segments : []
      const words = segments.flatMap((segment) => {
        if (!Array.isArray(segment)) return []
        const [position, startMs, endMs] = segment
        const word = ayah.words[Number(position) - 1]

        if (!word || typeof startMs !== 'number' || typeof endMs !== 'number') return []
        return [{ location: word.location, startMs, endMs }]
      })

      return { number: ayah.number, startMs: timestampFrom, endMs: timestampTo, words }
    })

    return { audioUrl: file.audioUrl, ayahs }
  }
}
