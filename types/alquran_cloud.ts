/**
 * The fields QuranTextService reads from Al Quran Cloud responses. Every field
 * is optional: the service checks each one and treats a missing field as an
 * incomplete response.
 */
export type UpstreamSurah = {
  number?: number
  name?: string
  englishName?: string
  englishNameTranslation?: string
  revelationType?: string
  numberOfAyahs?: number
}

export type UpstreamAyah = { numberInSurah?: number; text?: string }
