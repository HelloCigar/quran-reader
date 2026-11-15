import { BaseTransformer } from '@adonisjs/core/transformers'
import type Bookmark from '#models/bookmark'
import type { Surah, SurahSummary } from '#types/quran'

export default class BookmarkTransformer extends BaseTransformer<Bookmark> {
  #texts: Map<number, (SurahSummary & Partial<Pick<Surah, 'ayahs'>>) | null>

  /**
   * `texts` holds the Quran text per surah number, `null` when that surah's
   * text is unavailable. The bookmarks list passes each whole Surah; the
   * dashboard passes only the summaries, for the Surah names.
   */
  constructor(
    resource: Bookmark,
    texts: Map<number, (SurahSummary & Partial<Pick<Surah, 'ayahs'>>) | null> = new Map()
  ) {
    super(resource)
    this.#texts = texts
  }

  /**
   * The surah page: `reference` titles the note dialog and the remove
   * confirmation.
   */
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'surahNumber', 'ayahNumber', 'note']),
      reference: `${this.resource.surahNumber}:${this.resource.ayahNumber}`,
    }
  }

  /**
   * The bookmarks list: a "2:255 · Al-Baqarah" title, or just the reference
   * when the surah's text is unavailable, and the ayah's text or `null`.
   */
  async forList() {
    const base = await this.forRecent()
    const surah = this.#texts.get(this.resource.surahNumber) ?? null
    const ayah = surah?.ayahs?.find((candidate) => candidate.number === this.resource.ayahNumber)

    return {
      ...base,
      text: ayah ? { arabic: ayah.arabic, english: ayah.english } : null,
    }
  }

  /**
   * The dashboard's recent bookmarks: the "2:255 · Al-Baqarah" title, or
   * just the reference when the surah's name is unavailable, and the note.
   */
  async forRecent() {
    const base = await this.toObject()
    const surah = this.#texts.get(this.resource.surahNumber) ?? null

    return {
      ...base,
      title: surah ? `${base.reference} · ${surah.name}` : base.reference,
    }
  }
}
