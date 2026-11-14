import vine from '@vinejs/vine'
import AyahReference from '#ayah_reference/ayah_reference'

/**
 * GET /quran/ayah. `reference` is the Ayah Reference the reader typed, such
 * as `2:255`.
 */
export const showAyahValidator = vine.create({
  reference: vine
    .string()
    .ayahReference()
    .transform((value) => AyahReference.parse(value)!),
})
