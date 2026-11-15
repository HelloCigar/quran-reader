import vine from '@vinejs/vine'

/**
 * PUT /reading-position
 */
export const updateReadingPositionValidator = vine.create({
  surah: vine.number().withoutDecimals().range([1, 114]),
  ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
})
