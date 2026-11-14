import type { RawChapter, RawVerse, RawWord } from '#tests/helpers/types'

/**
 * An in-memory Quran Foundation Content API. `install()` routes `fetch` to it
 * for one test, so the real QuranTextService and `@quranjs/api` SDK run
 * against it: the token endpoint, the chapter list, one chapter, and verses by
 * chapter with `page` and `per_page`. It starts with all 114 surahs, each ayah
 * two Words long; tests change the raw responses to reach each case.
 */
export default class FakeQuranFoundation {
  chapters: RawChapter[] = Array.from({ length: 114 }, (_, index) =>
    FakeQuranFoundation.#chapter(index + 1)
  )

  #verses = new Map<number, RawVerse[]>()

  /**
   * The raw verses of a surah, built on first use from its `verses_count`.
   */
  verses(surah: number): RawVerse[] {
    const existing = this.#verses.get(surah)
    if (existing) return existing

    const built = Array.from({ length: this.chapters[surah - 1].verses_count }, (_, index) =>
      FakeQuranFoundation.#verse(surah, index + 1)
    )
    this.#verses.set(surah, built)
    return built
  }

  /**
   * A fake that `fetch` is routed to until the test ends: `cleanup` puts the
   * real `fetch` back.
   */
  static install(cleanup: (restore: () => void) => void): FakeQuranFoundation {
    const fake = new FakeQuranFoundation()
    const realFetch = globalThis.fetch
    globalThis.fetch = async (input, init) => fake.#respond(new URL(String(input)), init)
    cleanup(() => {
      globalThis.fetch = realFetch
    })
    return fake
  }

  #respond(url: URL, init?: RequestInit): Response {
    if (url.pathname.endsWith('/oauth2/token')) {
      const scope = new URLSearchParams(String(init?.body)).get('scope')
      return Response.json({ access_token: 'fake', token_type: 'bearer', expires_in: 3600, scope })
    }

    const chapter = url.pathname.match(/\/chapters\/(\d+)$/)
    if (chapter) {
      const found = this.chapters.find(({ id }) => id === Number(chapter[1]))
      return found ? Response.json({ chapter: found }) : Response.json({}, { status: 404 })
    }

    if (url.pathname.endsWith('/chapters')) {
      return Response.json({ chapters: this.chapters })
    }

    const byChapter = url.pathname.match(/\/verses\/by_chapter\/(\d+)$/)
    if (byChapter) {
      const page = Number(url.searchParams.get('page') ?? 1)
      const perPage = Number(url.searchParams.get('per_page') ?? 10)
      const verses = this.verses(Number(byChapter[1]))
      return Response.json({
        verses: verses.slice((page - 1) * perPage, page * perPage),
        pagination: { per_page: perPage, current_page: page, total_records: verses.length },
      })
    }

    return Response.json({}, { status: 404 })
  }

  static #chapter(id: number): RawChapter {
    return {
      id,
      revelation_place: id % 2 === 0 ? 'madinah' : 'makkah',
      bismillah_pre: id !== 1 && id !== 9,
      name_simple: `Surah ${id}`,
      name_arabic: `سورة ${id}`,
      verses_count: 3,
      translated_name: { language_name: 'english', name: `Meaning ${id}` },
    }
  }

  static #verse(surah: number, ayah: number): RawVerse {
    const word = (position: number, arabic: string, meaning: string): RawWord => ({
      position,
      char_type_name: 'word',
      text_uthmani: arabic,
      translation: { text: meaning, language_name: 'english' },
      transliteration: { text: `word-${position}`, language_name: 'english' },
    })

    return {
      verse_number: ayah,
      verse_key: `${surah}:${ayah}`,
      words: [
        word(1, 'كَلِمَة', 'word'),
        word(2, 'ثَانِيَة ۚ', 'second'),
        {
          position: 3,
          char_type_name: 'end',
          text_uthmani: String(ayah),
          translation: { text: null, language_name: 'english' },
          transliteration: { text: null, language_name: 'english' },
        },
      ],
      translations: [{ resource_id: 20, text: `Ayah ${surah}:${ayah}` }],
    }
  }
}
