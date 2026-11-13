import { readFileSync } from 'node:fs'
import type { SurahSummary } from '#types/quran'

/**
 * Every surah's number and ayah count, from the recorded surah list fixture.
 */
export function surahAyahCounts(): { surah: number; ayahCount: number }[] {
  const url = new URL('../../fixtures/quran/surahs.json', import.meta.url)
  const surahs = JSON.parse(readFileSync(url, 'utf8')) as SurahSummary[]

  return surahs.map(({ number, ayahCount }) => ({ surah: number, ayahCount }))
}
