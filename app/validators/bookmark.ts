import vine from '@vinejs/vine'

/**
 * POST /bookmarks
 */
export const createBookmarkValidator = vine.create({
  surah: vine.number().withoutDecimals().range([1, 114]),
  ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
})

/**
 * PATCH /bookmarks/:id
 * A blank or whitespace-only note becomes null.
 */
export const updateBookmarkValidator = vine.create({
  note: vine
    .string()
    .trim()
    .maxLength(500)
    .transform((value) => (value === '' ? null : value))
    .nullable(),
})

/**
 * GET /login and GET /signup: the bookmark carried in the query string.
 */
export const carriedBookmarkValidator = vine.create({
  bookmark: vine
    .object({
      surah: vine.number().withoutDecimals().range([1, 114]),
      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
    })
    .optional(),
})
