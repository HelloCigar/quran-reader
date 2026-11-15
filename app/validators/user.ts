import vine from '@vinejs/vine'
import { passwordPolicy } from '#validators/password_policy'

/**
 * Schema factories every screen that takes an email or sets a password builds
 * its field from (signup now, password reset and account settings later), so
 * the credential rules live in one place.
 */
// oxlint-disable-next-line flow/no-top-level-functions -- shared VineJS schema factory, see above
const email = () => vine.string().email().maxLength(254)
// oxlint-disable-next-line flow/no-top-level-functions -- shared VineJS schema factory, see above
const newEmail = () => email()
// oxlint-disable-next-line flow/no-top-level-functions -- shared VineJS schema factory, see above
const password = () => vine.string().passwordPolicy(passwordPolicy).uncompromised()

/**
 * Validator to use when performing self-signup.
 *
 * The "passwordConfirmation" field is declared explicitly, so that it is part
 * of the request body type shared with the frontend. Otherwise the signup form
 * has no way to know about the errors reported for this field.
 */
export const signupValidator = vine.create({
  fullName: vine.string().trim().maxLength(100).nullable(),
  // flow-allow review-response-exposure: signup reports a registered email so a returning reader knows to sign in or reset instead; formsThrottle limits probing.
  email: newEmail().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: vine.string().sameAs('password'),
  bookmark: vine
    .object({
      surah: vine.number().withoutDecimals().range([1, 114]),
      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
    })
    .optional(),
})

/**
 * Validator to use before validating user credentials during login. Existing
 * accounts may predate the password policy, so the password is not checked
 * against it here.
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
  bookmark: vine
    .object({
      surah: vine.number().withoutDecimals().range([1, 114]),
      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
    })
    .optional(),
})

/**
 * Validator to use when requesting a password reset link.
 */
export const forgotPasswordValidator = vine.create({
  email: email(),
})

/**
 * Validator to use when setting a new password from a reset link. The new
 * password meets the same rules signup enforces. "passwordConfirmation" is
 * declared explicitly for the same reason as on signup.
 */
export const resetPasswordValidator = vine.create({
  password: password(),
  passwordConfirmation: vine.string().sameAs('password'),
})

/**
 * The browser's response when creating a passkey. SimpleWebAuthn verifies
 * it; this only checks its shape. 1364 is the 1023-byte credential id cap in
 * base64url.
 */
export const passkeyRegistrationValidator = vine.create({
  response: vine.object({
    id: vine.string().maxLength(1364),
    rawId: vine.string().maxLength(1364),
    type: vine.literal('public-key'),
    response: vine.object({
      clientDataJSON: vine.string(),
      attestationObject: vine.string(),
      transports: vine.array(vine.string()).optional(),
    }),
    clientExtensionResults: vine.object({}),
  }),
})

/**
 * The browser's response when signing in with a passkey.
 */
export const passkeyAuthenticationValidator = vine.create({
  response: vine.object({
    id: vine.string().maxLength(1364),
    rawId: vine.string().maxLength(1364),
    type: vine.literal('public-key'),
    response: vine.object({
      clientDataJSON: vine.string(),
      authenticatorData: vine.string(),
      signature: vine.string(),
      userHandle: vine.string().optional(),
    }),
    clientExtensionResults: vine.object({}),
  }),
  bookmark: vine
    .object({
      surah: vine.number().withoutDecimals().range([1, 114]),
      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
    })
    .optional(),
})

/**
 * Renaming a passkey.
 */
export const passkeyNameValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100),
})

/**
 * Updating the name and email from the profile page. The email is unique
 * against every row except the user's own, so submitting the unchanged
 * email is not a duplicate.
 */
export const updateProfileValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: vine.string().trim().maxLength(100).nullable(),
  email: newEmail().unique({
    table: 'users',
    column: 'email',
    filter: async (db, _, field) => {
      db.whereNot('id', field.meta.userId)
    },
  }),
})

/**
 * Changing the password from the security page. The new password meets the
 * same rules signup enforces; "passwordConfirmation" is declared explicitly
 * for the same reason as on signup.
 */
export const changePasswordValidator = vine.create({
  currentPassword: vine.string(),
  password: password(),
  passwordConfirmation: vine.string().sameAs('password'),
})
