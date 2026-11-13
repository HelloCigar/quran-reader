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

export type Ayah = {
  number: number
  arabic: string
  english: string
}

export type Surah = SurahSummary & {
  bismillah: string | null
  ayahs: Ayah[]
}
