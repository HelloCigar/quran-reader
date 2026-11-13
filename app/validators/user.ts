import vine from '@vinejs/vine'

/**
 * Validator to use when performing self-signup.
 *
 * The "passwordConfirmation" field is declared explicitly, so that it is part
 * of the request body type shared with the frontend. Otherwise the signup form
 * has no way to know about the errors reported for this field.
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: vine.string().email().maxLength(254).unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).maxLength(32),
  passwordConfirmation: vine.string().minLength(8).maxLength(32).sameAs('password'),
  bookmark: vine
    .object({
      surah: vine.number().withoutDecimals().range([1, 114]),
      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
    })
    .optional(),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: vine.string().email().maxLength(254),
  password: vine.string(),
  bookmark: vine
    .object({
      surah: vine.number().withoutDecimals().range([1, 114]),
      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
    })
    .optional(),
})
