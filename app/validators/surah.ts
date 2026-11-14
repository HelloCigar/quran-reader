import vine from '@vinejs/vine'

/**
 * GET /quran/:number. `ayah` names the Ayah to open the Surah at, and the
 * block an infinite scroll asks for; `note` names the ayah whose note prompt
 * opens.
 */
export const showSurahValidator = vine.create({
  ayah: vine.number().withoutDecimals().positive().optional(),
  note: vine.number().withoutDecimals().positive().optional(),
})
