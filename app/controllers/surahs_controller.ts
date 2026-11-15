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
      surahs: SurahTransformer.transform(surahs),
      /** `null` for a signed-out reader, or one who hasn't read yet. */
      readingPosition: position ? ReadingPositionTransformer.transform(position) : null,
    })
  }

  async show({ inertia, params, request, auth }: HttpContext) {
    const { ayah, note } = await request.validateUsing(showSurahValidator)
    const number: number = params.number
    const noBookmarks: Bookmark[] = []
    const [surah, surahs, bookmarks] = await Promise.all([
      this.#quranText.readSurah(number),
      this.#quranText.listSurahs(),
      auth.user
        ? auth.user.related('bookmarks').query().where('surah_number', number)
        : noBookmarks,
    ])
    const previous = surahs[number - 2] ?? null
    const next = surahs[number] ?? null
    const noteFor =
      note !== undefined && bookmarks.some((bookmark) => bookmark.ayahNumber === note) ? note : null
    /**
     * A scroll up or down asks for the next block by a partial reload. Any
     * other visit opens the Surah: at `ayah`, or else at the Ayah whose note
     * opens.
     */
    const block = inertia.requestInfo().isPartialRequest
      ? AyahBlock.holding(ayah, surah.ayahCount)
      : AyahBlock.openingAt(ayah ?? noteFor ?? undefined, surah.ayahCount)

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
      /** Every Surah, for the sidebar. */
      surahs: SurahTransformer.transform(surahs).useVariant('forNavigation'),
      /**
       * The reader's sidebar choices, kept in cookies the page writes, so the
       * page renders with them in place. An unknown value is the default.
       */
      sidebar: {
        isShown: request.plainCookie('reader_sidebar', { encoded: false }) !== 'hidden',
        mode:
          request.plainCookie('reader_sidebar_mode', { encoded: false }) === 'surah'
            ? ('surah' as const)
            : ('verse' as const),
      },
      bookmarks: BookmarkTransformer.transform(bookmarks),
      noteFor,
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
