import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
// @inject() reads the constructor's emitted type metadata, so this must stay a runtime import.
// oxlint-disable-next-line typescript/consistent-type-imports
import QuranTextService from '#services/quran_text_service'
// oxlint-disable-next-line typescript/consistent-type-imports
import RecitationService from '#services/recitation_service'
import SurahTransformer from '#transformers/surah_transformer'
import AyahTransformer from '#transformers/ayah_transformer'
import BookmarkTransformer from '#transformers/bookmark_transformer'
import RecitationTransformer from '#transformers/recitation_transformer'
import ReadingPositionTransformer from '#transformers/reading_position_transformer'
import { showSurahValidator } from '#validators/surah'
import AyahBlock from '#ayah_block/ayah_block'
import type Bookmark from '#models/bookmark'

@inject()
export default class SurahsController {
  #quranText: QuranTextService
  #recitations: RecitationService

  constructor(quranText: QuranTextService, recitations: RecitationService) {
    this.#quranText = quranText
    this.#recitations = recitations
  }

  async index({ inertia, auth }: HttpContext) {
    const [surahs, position] = await Promise.all([
      this.#quranText.listSurahs(),
      auth.user ? auth.user.related('readingPosition').query().first() : null,
    ])

    return inertia.render('quran/index', {
      surahs: SurahTransformer.transform(surahs).useVariant('forIndex'),
      /** The count over the list: "114 Surahs". */
      surahCount: `${surahs.length} Surahs`,
      /** `null` for a signed-out reader, or one who hasn't read yet. */
      readingPosition: position
        ? ReadingPositionTransformer.transform(
            position,
            surahs.find((surah) => surah.number === position.surahNumber) ?? null
          ).useVariant('forIndex')
        : null,
    })
  }

  async show({ inertia, params, request, auth }: HttpContext) {
    // flow-allow request.md: a hand-edited ?ayah= that is no Ayah number opens the Surah at its start; the global handler's redirect back sends a reader with no previous page to the dashboard
    const [invalid, query] = await request.tryValidateUsing(showSurahValidator)
    const ayah = invalid ? undefined : query.ayah
    const number: number = params.number
    const [surah, surahs] = await Promise.all([
      this.#quranText.readSurah(number),
      this.#quranText.listSurahs(),
    ])
    const previous = surahs[number - 2] ?? null
    const next = surahs[number] ?? null
    /**
     * A scroll up or down asks for the next block by a partial reload. Any
     * other visit opens the Surah at `ayah`.
     */
    const block = inertia.requestInfo().isPartialRequest
      ? AyahBlock.holding(ayah, surah.ayahCount)
      : AyahBlock.openingAt(ayah, surah.ayahCount)

    /**
     * Every Surah, for the sidebar, in place of the shared prop of the same
     * name: here the page opens with them. Sent once; the client keeps them
     * from one Surah to the next.
     */
    inertia.share({
      sidebarSurahs: inertia.once(() =>
        SurahTransformer.transform(surahs).useVariant('forNavigation')
      ),
    })

    return inertia.render('quran/show', {
      surah: SurahTransformer.transform(surah).useVariant('forReading'),
      bismillah: surah.bismillah,
      /**
       * One block of Ayahs, or two when the Surah opens near the start of a
       * block. The page loads the blocks around them as the reader scrolls.
       */
      ayahs: inertia.scroll(
        () => AyahTransformer.paginate(block.slice(surah.ayahs), {}, surah.number),
        () => block.toScrollProps()
      ),
      /** The Ayah to scroll to when the page opens, if any. */
      openedAt: block.openedAt,
      previous: previous ? SurahTransformer.transform(previous) : null,
      next: next ? SurahTransformer.transform(next) : null,
      /**
       * The signed-in reader's Bookmarks in this Surah. Read only when the
       * visit asks for them: a block of Ayahs or the Recitation loads without.
       */
      bookmarks: async () => {
        const noBookmarks: Bookmark[] = []
        const bookmarks = auth.user
          ? await auth.user.related('bookmarks').query().where('surah_number', number)
          : noBookmarks
        return BookmarkTransformer.transform(bookmarks)
      },
      /**
       * Loaded by a partial reload on the first Play, and kept by the app
       * layout from then on. `null` when the Recitation is unavailable;
       * reading still works.
       */
      recitation: inertia.optional(async () => {
        const recitation = await this.#recitations.readRecitation(surah)
        return recitation ? RecitationTransformer.transform(recitation, surah) : null
      }),
    })
  }
}
