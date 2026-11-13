import vine from '@vinejs/vine'

/**
 * GET /quran/:number. `note` names the ayah whose note prompt opens.
 */
export const showSurahValidator = vine.create({
  note: vine.number().withoutDecimals().positive().optional(),
})
