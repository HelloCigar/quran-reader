import type { Chapter, ChapterId, Verse } from '@quranjs/api'
import QuranUnavailableException from '#exceptions/quran_unavailable_exception'
import { quranCache } from '#start/cache'
import { quranFoundation } from '#start/quran_foundation'
import type { Ayah, Surah, SurahSummary, Word } from '#types/quran'

/**
 * The Bismillah as Quran Foundation gives it at 1:1 (its Words, joined).
 *
 * Written as escapes because the source puts shadda before the short vowel
 * (not NFC order), and any re-normalization would stop it matching.
 */
const BISMILLAH =
  '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0640\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'

const SURAH_COUNT = 114
const SAHEEH_INTERNATIONAL = 20
const VERSES_PER_PAGE = 50

/**
 * A footnote marker inside a Translation, e.g. `<sup foot_note=195932>1</sup>`.
 */
const FOOTNOTE_MARKER = /<sup foot_note=\d+>\d*<\/sup>/g

const CACHE_OPTIONS = {
  ttl: '30 days',
  grace: '30 days',
  graceBackoff: '5 minutes',
} as const

/**
 * Reads the Quran text from Quran Foundation: Uthmani Arabic, split into
 * Words with their Transliteration and Word Translation, and the Saheeh
 * International Translation. Every result is complete; anything less raises
 * QuranUnavailableException.
 */
export default class QuranTextService {
  /**
   * All 114 surahs, in order.
   */
  async listSurahs(): Promise<SurahSummary[]> {
    return this.#cached('qf:surahs', async () => {
      const chapters = await quranFoundation.chapters.findAll()

      if (!Array.isArray(chapters) || chapters.length !== SURAH_COUNT) {
        throw this.#incomplete(`Expected ${SURAH_COUNT} surahs, got ${chapters?.length}`)
      }

      return chapters.map((chapter) => this.#toSummary(chapter))
    })
  }

  /**
   * One surah with every ayah, in Arabic and English.
   */
  async readSurah(number: number): Promise<Surah> {
    return this.#cached(`qf:surah:${number}`, async () => {
      const id = number as ChapterId
      const chapter = await quranFoundation.chapters.findById(id)
      const summary = this.#toSummary(chapter)

      if (summary.number !== number) {
        throw this.#incomplete(`Asked for surah ${number}, got ${summary.number}`)
      }

      const pages = Math.ceil(summary.ayahCount / VERSES_PER_PAGE)
      const versePages = await Promise.all(
        Array.from({ length: pages }, (_, index) =>
          quranFoundation.verses.findByChapter(id, {
            page: index + 1,
            perPage: VERSES_PER_PAGE,
            words: true,
            translations: [SAHEEH_INTERNATIONAL],
            wordFields: { textUthmani: true },
          })
        )
      )
      const verses = versePages.flat()

      if (verses.length !== summary.ayahCount) {
        throw this.#incomplete(`Surah ${number} came back with ${verses.length} ayahs`)
      }

      const ayahs = verses.map((verse, index) => this.#toAyah(number, index + 1, verse))

      return { ...summary, bismillah: chapter.bismillahPre ? BISMILLAH : null, ayahs }
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

  #toSummary(chapter: Chapter | undefined): SurahSummary {
    const { id, nameArabic, nameSimple, translatedName, revelationPlace, versesCount } =
      chapter ?? {}
    const revelation =
      revelationPlace === 'makkah' ? 'Meccan' : revelationPlace === 'madinah' ? 'Medinan' : null

    if (
      typeof id !== 'number' ||
      typeof versesCount !== 'number' ||
      !nameArabic ||
      !nameSimple ||
      !translatedName?.name ||
      !revelation
    ) {
      throw this.#incomplete(`Surah ${id} has missing details`)
    }

    return {
      number: id,
      arabicName: nameArabic,
      name: nameSimple,
      meaning: translatedName.name,
      revelation,
      ayahCount: versesCount,
    }
  }

  /**
   * Keeps the real Words (not the ayah-end marker) and requires each to have
   * its Arabic, Transliteration and Word Translation, numbered 1..n. The
   * Ayah's Arabic is its Words joined, so it always matches the Words shown.
   */
  #toAyah(surah: number, expected: number, verse: Verse): Ayah {
    const reference = `${surah}:${expected}`
    const english = verse.translations?.[0]?.text?.replace(FOOTNOTE_MARKER, '').trim()

    if (verse.verseNumber !== expected || !english || /[<>]/.test(english)) {
      throw this.#incomplete(`Ayah ${reference} is missing or has an unreadable translation`)
    }

    const words: Word[] = (verse.words ?? [])
      .filter((word) => word.charTypeName === 'word')
      .map((word, index) => {
        const arabic = word.textUthmani
        const transliteration = word.transliteration?.text
        const translation = word.translation?.text

        if (word.position !== index + 1 || !arabic || !transliteration || !translation) {
          throw this.#incomplete(`Word ${reference}:${index + 1} is incomplete`)
        }

        return { location: `${reference}:${word.position}`, arabic, transliteration, translation }
      })

    if (words.length === 0) {
      throw this.#incomplete(`Ayah ${reference} has no words`)
    }

    return {
      number: expected,
      arabic: words.map((word) => word.arabic).join(' '),
      english,
      words,
    }
  }

  #incomplete(reason: string) {
    return new QuranUnavailableException(undefined, { cause: new Error(reason) })
  }
}
