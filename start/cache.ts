import cache from '@adonisjs/cache/services/main'

/**
 * The Quran text (surah list and surahs), fetched from Al Quran Cloud.
 */
export const quranCache = cache.namespace('quran')
