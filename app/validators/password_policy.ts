import { definePasswordPolicy } from '@adonisplus/persona/password_policy'

export const passwordPolicy = definePasswordPolicy({
  minLength: 8,
  maxLength: 32,
  minScore: 3,
})
