/**
 * Quran Foundation Content API shapes (snake_case, as sent over HTTP), used by
 * FakeQuranFoundation.
 */
export type RawWord = {
  position: number
  char_type_name: 'word' | 'end'
  text_uthmani: string
  translation: { text: string | null; language_name: 'english' }
  transliteration: { text: string | null; language_name: 'english' }
}

export type RawVerse = {
  verse_number: number
  verse_key: string
  words: RawWord[]
  translations: { resource_id: number; text: string }[]
}

export type RawChapter = {
  id: number
  revelation_place: 'makkah' | 'madinah'
  bismillah_pre: boolean
  name_simple: string
  name_arabic: string
  verses_count: number
  translated_name: { language_name: 'english'; name: string }
}
