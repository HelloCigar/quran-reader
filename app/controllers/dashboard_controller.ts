import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
// @inject() reads the method's emitted type metadata, so this must stay a runtime import.
// oxlint-disable-next-line typescript/consistent-type-imports
import QuranTextService from '#services/quran_text_service'
import BookmarkTransformer from '#transformers/bookmark_transformer'
import ReadingPositionTransformer from '#transformers/reading_position_transformer'
import ReadingPosition from '#models/reading_position'

/**
 * How many of the newest Bookmarks the dashboard shows.
 */
const RECENT_BOOKMARKS = 5

/**
 * Where a reader with no Reading Position starts. Named here, so a new
 * reader's dashboard needs no Quran text.
 */
const START = {
  surahNumber: 1,
  ayahNumber: 1,
  surah: { name: 'Al-Fatihah', meaning: 'The Opener', ayahCount: 7 },
}

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
    // The Quran text only fills the page out (names, the Arabic), so it still
    // renders without it, and a new reader's page needs none.
    const texts = await quranText.readSurahsIfAvailable([
      ...(position ? [position.surahNumber] : []),
      ...bookmarks.map((bookmark) => bookmark.surahNumber),
    ])
    // A reader who hasn't read yet starts at a position not saved for them.
    const continueAt =
      position ??
      new ReadingPosition().merge({ surahNumber: START.surahNumber, ayahNumber: START.ayahNumber })
    const surah = position ? (texts.get(position.surahNumber) ?? null) : START.surah

    return inertia.render('app/dashboard', {
      continueReading: ReadingPositionTransformer.transform(continueAt, surah).useVariant(
        'forContinuing'
      ),
      bookmarks: BookmarkTransformer.transform(bookmarks, texts).useVariant('forRecent'),
    })
  }
}
