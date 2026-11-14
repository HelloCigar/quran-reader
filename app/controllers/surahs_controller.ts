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
import { showSurahValidator } from '#validators/surah'
import type Bookmark from '#models/bookmark'

@inject()
export default class SurahsController {
  #quranText: QuranTextService
  #recitations: RecitationService

  constructor(quranText: QuranTextService, recitations: RecitationService) {
    this.#quranText = quranText
    this.#recitations = recitations
  }

  async index({ inertia }: HttpContext) {
    const surahs = await this.#quranText.listSurahs()

    return inertia.render('quran/index', {
      surahs: SurahTransformer.transform(surahs),
    })
  }

  async show({ inertia, params, request, auth }: HttpContext) {
    const { note } = await request.validateUsing(showSurahValidator)
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

    return inertia.render('quran/show', {
      surah: SurahTransformer.transform(surah).useVariant('forReading'),
      bismillah: surah.bismillah,
      ayahs: AyahTransformer.transform(surah.ayahs, surah.number),
      previous: previous ? SurahTransformer.transform(previous) : null,
      next: next ? SurahTransformer.transform(next) : null,
      bookmarks: BookmarkTransformer.transform(bookmarks),
      noteFor,
      /**
       * Loaded by a partial reload on the first Play. `null` when the
       * Recitation is unavailable; reading still works.
       */
      recitation: inertia.optional(async () => {
        const recitation = await this.#recitations.readRecitation(surah)
        return recitation ? RecitationTransformer.transform(recitation) : null
      }),
    })
  }
}
