import { BaseTransformer } from '@adonisjs/core/transformers'
import type Bookmark from '#models/bookmark'
import type { Surah } from '#types/quran'

export default class BookmarkTransformer extends BaseTransformer<Bookmark> {
  #texts: Map<number, Surah | null>

  /**
   * `texts` holds the Quran text per surah number, `null` when that surah's
   * text is unavailable. Only the bookmarks list passes it.
   */
  constructor(resource: Bookmark, texts: Map<number, Surah | null> = new Map()) {
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
   * The bookmarks list: a "2:255 · Al-Baqara" title, or just the reference
   * when the surah's text is unavailable, and the ayah's text or `null`.
   */
  async forList() {
    const base = await this.toObject()
    const surah = this.#texts.get(this.resource.surahNumber) ?? null
    const ayah = surah?.ayahs.find((candidate) => candidate.number === this.resource.ayahNumber)

    return {
      ...base,
      title: surah ? `${base.reference} · ${surah.name}` : base.reference,
      text: ayah ? { arabic: ayah.arabic, english: ayah.english } : null,
    }
  }
}
