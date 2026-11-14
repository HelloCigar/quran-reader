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

/**
 * When one Word is heard within the Surah's audio file.
 */
export type WordTiming = {
  /** The Word Location of the Recited Word. */
  location: string
  startMs: number
  endMs: number
}

/**
 * When one Ayah is heard within the Surah's audio file, and its timed Words.
 * Words with no timing are left out.
 */
export type AyahTiming = {
  number: number
  startMs: number
  endMs: number
  words: WordTiming[]
}

/**
 * One Reciter's audio of a whole Surah (docs/adr/0002), with when each Ayah
 * and Word is heard in it.
 */
export type Recitation = {
  audioUrl: string
  ayahs: AyahTiming[]
}

/**
 * One Ayah's timings as the SDK returns them (camel-cased). The SDK's
 * `ChapterRecitation` type leaves these out, so they are checked at runtime.
 */
export type RawRecitationTimestamp = {
  verseKey?: unknown
  timestampFrom?: unknown
  timestampTo?: unknown
  segments?: unknown
}
