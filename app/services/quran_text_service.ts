import { getSurah, getSurahByNumberEditionsByEditions } from '#integrations/alquran_cloud/index'
import QuranUnavailableException from '#exceptions/quran_unavailable_exception'
import { quranCache } from '#start/cache'
import type { Ayah, Surah, SurahSummary } from '#types/quran'

/**
 * The Bismillah as it appears in the `quran-uthmani` edition at 1:1,
 * without the leading U+FEFF.
 *
 * Written as escapes because the source puts shadda before the short vowel
 * (not NFC order), and any re-normalization would stop it matching.
 */
const BISMILLAH =
  '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'

const SURAH_COUNT = 114
const EDITIONS = 'quran-uthmani,en.sahih'
const REQUEST_TIMEOUT_MS = 10_000

const CACHE_OPTIONS = {
  ttl: '30 days',
  grace: '30 days',
  graceBackoff: '5 minutes',
} as const

type UpstreamSurah = {
  number?: number
  name?: string
  englishName?: string
  englishNameTranslation?: string
  revelationType?: string
  numberOfAyahs?: number
}

type UpstreamAyah = { numberInSurah?: number; text?: string }

/**
 * Reads the Quran text (Uthmani Arabic and Saheeh International English).
 * Every result is complete; anything less raises QuranUnavailableException.
 */
export default class QuranTextService {
  /**
   * All 114 surahs, in order.
   */
  async listSurahs(): Promise<SurahSummary[]> {
    return this.#cached('surahs', async () => {
      const result = await getSurah({ signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
      const rows = this.#unwrap(result)

      if (!Array.isArray(rows) || rows.length !== SURAH_COUNT) {
        throw this.#incomplete(`Expected ${SURAH_COUNT} surahs, got ${rows?.length}`)
      }

      return rows.map((row) => this.#toSummary(row))
    })
  }

  /**
   * One surah with every ayah, in Arabic and English.
   */
  async readSurah(number: number): Promise<Surah> {
    return this.#cached(`surah:${number}`, async () => {
      const result = await getSurahByNumberEditionsByEditions({
        path: { number, editions: EDITIONS },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const editions = this.#unwrap(result)

      if (!Array.isArray(editions) || editions.length !== 2) {
        throw this.#incomplete(`Expected 2 editions, got ${editions?.length}`)
      }

      const [arabicEdition, englishEdition] = editions
      const summary = this.#toSummary(arabicEdition)
      const arabicAyahs = arabicEdition.ayahs ?? []
      const englishAyahs = englishEdition.ayahs ?? []

      if (
        summary.number !== number ||
        arabicAyahs.length !== summary.ayahCount ||
        englishAyahs.length !== summary.ayahCount
      ) {
        throw this.#incomplete(`Surah ${number} came back incomplete`)
      }

      const ayahs = this.#pairAyahs(arabicAyahs, englishAyahs)
      const bismillah = this.#liftBismillah(number, ayahs)

      return { ...summary, bismillah, ayahs }
    })
  }

  /**
   * Each distinct surah, read at most once and in parallel through `readSurah`
   * (so cache hits and grace behave as on the reading page). A surah whose text
   * is unavailable maps to `null`; any other error is rethrown.
   */
  async readSurahsIfAvailable(numbers: number[]): Promise<Map<number, Surah | null>> {
    const distinct = [...new Set(numbers)]
    const entries = await Promise.all(
      distinct.map(async (number): Promise<[number, Surah | null]> => {
        try {
          return [number, await this.readSurah(number)]
        } catch (error) {
          if (error instanceof QuranUnavailableException) return [number, null]
          throw error
        }
      })
    )

    return new Map(entries)
  }

  /**
   * Cache-aside read. Any failure, including BentoCache wrapping a factory
   * error, surfaces as QuranUnavailableException.
   */
  async #cached<T>(key: string, factory: () => Promise<T>): Promise<T> {
    try {
      return await quranCache.getOrSet({ key, ...CACHE_OPTIONS, factory })
    } catch (error) {
      throw new QuranUnavailableException(undefined, { cause: error })
    }
  }

  #unwrap<T>(result: { data?: { code?: number; data?: T }; error?: unknown; response?: Response }) {
    if (result.error !== undefined || !result.response?.ok) {
      throw this.#incomplete(`Upstream HTTP ${result.response?.status}`, result.error)
    }
    if (result.data?.code !== 200) {
      throw this.#incomplete(`Upstream body code ${result.data?.code}`)
    }
    return result.data.data
  }

  #toSummary(row: UpstreamSurah): SurahSummary {
    const { number, name, englishName, englishNameTranslation, revelationType, numberOfAyahs } = row

    if (
      typeof number !== 'number' ||
      typeof numberOfAyahs !== 'number' ||
      !name ||
      !englishName ||
      !englishNameTranslation ||
      (revelationType !== 'Meccan' && revelationType !== 'Medinan')
    ) {
      throw this.#incomplete(`Surah ${number} has missing details`)
    }

    return {
      number,
      arabicName: name,
      name: englishName,
      meaning: englishNameTranslation,
      revelation: revelationType,
      ayahCount: numberOfAyahs,
    }
  }

  /**
   * Pairs the two editions ayah by ayah on `numberInSurah`, stripping a
   * leading U+FEFF from the Arabic.
   */
  #pairAyahs(arabicAyahs: UpstreamAyah[], englishAyahs: UpstreamAyah[]): Ayah[] {
    const english = new Map(englishAyahs.map((ayah) => [ayah.numberInSurah, ayah.text]))

    return arabicAyahs.map((ayah) => {
      const englishText = english.get(ayah.numberInSurah)
      if (typeof ayah.numberInSurah !== 'number' || !ayah.text || !englishText) {
        throw this.#incomplete(`Ayah ${ayah.numberInSurah} is missing a translation or text`)
      }

      return {
        number: ayah.numberInSurah,
        arabic: ayah.text.replace(/^﻿/, ''),
        english: englishText,
      }
    })
  }

  /**
   * Surahs 2–114 except 9 open with the Bismillah inside ayah 1. When ayah 1
   * starts with the exact Bismillah and a space, move it to its own value.
   */
  #liftBismillah(number: number, ayahs: Ayah[]): string | null {
    if (number === 1 || number === 9) return null

    const prefix = `${BISMILLAH} `
    const first = ayahs[0]
    if (!first.arabic.startsWith(prefix)) return null

    first.arabic = first.arabic.slice(prefix.length)
    return BISMILLAH
  }

  #incomplete(reason: string, cause?: unknown) {
    return new QuranUnavailableException(undefined, {
      cause: cause === undefined ? new Error(reason) : new Error(reason, { cause }),
    })
  }
}
