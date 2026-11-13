import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
// @inject() reads the method's emitted type metadata, so this must stay a runtime import.
// oxlint-disable-next-line typescript/consistent-type-imports
import QuranTextService from '#services/quran_text_service'
import BookmarkTransformer from '#transformers/bookmark_transformer'
import { createBookmarkValidator, updateBookmarkValidator } from '#validators/bookmark'

export default class BookmarksController {
  @inject()
  async index({ inertia, auth }: HttpContext, quranText: QuranTextService) {
    const user = auth.getUserOrFail()
    const bookmarks = await user
      .related('bookmarks')
      .query()
      .withScopes((scopes) => scopes.newestFirst())
    const texts = await quranText.readSurahsIfAvailable(
      bookmarks.map((bookmark) => bookmark.surahNumber)
    )

    return inertia.render('bookmarks/index', {
      bookmarks: BookmarkTransformer.transform(bookmarks, texts).useVariant('forList'),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const { surah, ayah } = await request.validateUsing(createBookmarkValidator)
    const user = auth.getUserOrFail()

    await user.keepBookmark(surah, ayah)

    return response.redirect().toRoute('surahs.show', { number: surah }, { qs: { note: ayah } })
  }

  async update({ params, request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    // Looked up before validation, so a removed bookmark always gets the removed message.
    const bookmark = await user.related('bookmarks').query().where('id', params.id).first()

    if (!bookmark) {
      session.flash('error', 'This bookmark was removed. Bookmark the ayah again to add a note.')
      return response.redirect().back()
    }

    const { note } = await request.validateUsing(updateBookmarkValidator)
    await bookmark.merge({ note }).save()

    session.flash('success', 'Note saved')
    return response.redirect().back()
  }

  async destroy({ params, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const bookmark = await user.related('bookmarks').query().where('id', params.id).first()

    // Already gone counts as done.
    if (!bookmark) {
      return response.redirect().back()
    }

    await bookmark.delete()

    session.flash('success', 'Bookmark removed')
    return response.redirect().back()
  }
}
