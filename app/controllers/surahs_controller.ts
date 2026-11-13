import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
// @inject() reads the constructor's emitted type metadata, so this must stay a runtime import.
// oxlint-disable-next-line typescript/consistent-type-imports
import QuranTextService from '#services/quran_text_service'
import SurahTransformer from '#transformers/surah_transformer'
import AyahTransformer from '#transformers/ayah_transformer'

@inject()
export default class SurahsController {
  #quranText: QuranTextService

  constructor(quranText: QuranTextService) {
    this.#quranText = quranText
  }

  async index({ inertia }: HttpContext) {
    const surahs = await this.#quranText.listSurahs()

    return inertia.render('quran/index', {
      surahs: SurahTransformer.transform(surahs),
    })
  }

  async show({ inertia, params }: HttpContext) {
    const number: number = params.number
    const [surah, surahs] = await Promise.all([
      this.#quranText.readSurah(number),
      this.#quranText.listSurahs(),
    ])
    const previous = surahs[number - 2] ?? null
    const next = surahs[number] ?? null

    return inertia.render('quran/show', {
      surah: SurahTransformer.transform(surah).useVariant('forReading'),
      bismillah: surah.bismillah,
      ayahs: AyahTransformer.transform(surah.ayahs, surah.number),
      previous: previous ? SurahTransformer.transform(previous) : null,
      next: next ? SurahTransformer.transform(next) : null,
    })
  }
}
