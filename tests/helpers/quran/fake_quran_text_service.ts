import { readFileSync } from 'node:fs'
import QuranTextService from '#services/quran_text_service'
import QuranUnavailableException from '#exceptions/quran_unavailable_exception'
import type { Surah, SurahSummary } from '#types/quran'

/**
 * The Uthmani Bismillah, as the real service lifts it out of ayah 1.
 *
 * Written as escapes because the source puts shadda before the short vowel
 * (not NFC order), and any re-normalization would stop it matching.
 */
const BISMILLAH =
  '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064E\u0647\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650'

function readFixture<T>(name: string): T {
  const url = new URL(`../../fixtures/quran/${name}`, import.meta.url)
  return JSON.parse(readFileSync(url, 'utf8')) as T
}

const SURAHS = readFixture<SurahSummary[]>('surahs.json')
const FIXTURE_SURAHS: Record<number, Surah> = {
  1: readFixture<Surah>('surah_1.json'),
}

/**
 * Container-swap fake for QuranTextService. Serves recorded fixtures and never
 * touches the network or the cache. Every call returns a fresh copy.
 */
export default class FakeQuranTextService extends QuranTextService {
  /**
   * A fake whose every read fails, as when the text source is down.
   */
  static unavailable() {
    return new UnavailableQuranTextService()
  }

  async listSurahs(): Promise<SurahSummary[]> {
    return structuredClone(SURAHS)
  }

  async readSurah(number: number): Promise<Surah> {
    const recorded = FIXTURE_SURAHS[number]
    if (recorded) return structuredClone(recorded)

    const summary = SURAHS[number - 1]
    return {
      ...structuredClone(summary),
      bismillah: number === 1 || number === 9 ? null : BISMILLAH,
      ayahs: Array.from({ length: summary.ayahCount }, (_, index) => ({
        number: index + 1,
        arabic: `آية ${index + 1}`,
        english: `Ayah ${number}:${index + 1}`,
      })),
    }
  }
}

class UnavailableQuranTextService extends FakeQuranTextService {
  async listSurahs(): Promise<SurahSummary[]> {
    throw new QuranUnavailableException()
  }

  async readSurah(_number: number): Promise<Surah> {
    throw new QuranUnavailableException()
  }
}
