/**
 * Plain JSON domain shapes for the Quran reader. These are what the
 * QuranTextService caches and returns; they are never Lucid models.
 */
export type SurahSummary = {
  number: number
  arabicName: string
  name: string
  meaning: string
  revelation: 'Meccan' | 'Medinan'
  ayahCount: number
}

/**
 * One Word of an Ayah, with any pause sign that follows it.
 */
export type Word = {
  /** The Word Location, `surah:ayah:word`, counting Words from 1. */
  location: string
  arabic: string
  transliteration: string
  translation: string
}

export type Ayah = {
  number: number
  /** The Ayah's Words, joined by spaces. */
  arabic: string
  english: string
  words: Word[]
}

export type Surah = SurahSummary & {
  bismillah: string | null
  ayahs: Ayah[]
}
