import vine from '@vinejs/vine'

/**
 * GET /quran/:number. `ayah` names the Ayah to open the Surah at, and the
 * block an infinite scroll asks for.
 */
export const showSurahValidator = vine.create({
  ayah: vine.number().withoutDecimals().positive().optional(),
})
