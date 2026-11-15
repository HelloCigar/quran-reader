import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
// @inject() reads the method's emitted type metadata, so this must stay a runtime import.
// oxlint-disable-next-line typescript/consistent-type-imports
import QuranTextService from '#services/quran_text_service'
import QuranUnavailableException from '#exceptions/quran_unavailable_exception'
import BookmarkTransformer from '#transformers/bookmark_transformer'
import ReadingPositionTransformer from '#transformers/reading_position_transformer'

/**
 * How many of the newest Bookmarks the dashboard shows.
 */
const RECENT_BOOKMARKS = 5

/**
 * The signed-in reader's home page: where to continue reading, and their
 * newest Bookmarks.
 */
export default class DashboardController {
  @inject()
  async show({ inertia, auth }: HttpContext, quranText: QuranTextService) {
    const user = auth.getUserOrFail()
    const [position, bookmarks] = await Promise.all([
      user.related('readingPosition').query().first(),
      user
        .related('bookmarks')
        .query()
        .withScopes((scopes) => scopes.newestFirst())
        .limit(RECENT_BOOKMARKS),
    ])
    // The Surah names only label the page, so it still renders without them,
    // and a new reader's page has none to label.
    const surahs =
      position || bookmarks.length > 0
        ? await quranText.listSurahs().catch((error) => {
            if (error instanceof QuranUnavailableException) return null
            throw error
          })
        : null
    const names = new Map((surahs ?? []).map((surah) => [surah.number, surah]))

    return inertia.render('app/dashboard', {
      /** `null` until the reader has read; the page then offers to start at 1:1. */
      readingPosition: position
        ? ReadingPositionTransformer.transform(position, surahs).useVariant('forContinuing')
        : null,
      bookmarks: BookmarkTransformer.transform(bookmarks, names).useVariant('forRecent'),
    })
  }
}
