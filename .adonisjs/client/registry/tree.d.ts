/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  surahs: {
    index: typeof routes['surahs.index']
    show: typeof routes['surahs.show']
  }
  ayahs: {
    show: typeof routes['ayahs.show']
  }
  emailVerifications: {
    show: typeof routes['email_verifications.show']
    update: typeof routes['email_verifications.update']
    store: typeof routes['email_verifications.store']
    create: typeof routes['email_verifications.create']
  }
  passwordResets: {
    show: typeof routes['password_resets.show']
    update: typeof routes['password_resets.update']
    create: typeof routes['password_resets.create']
    store: typeof routes['password_resets.store']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  passkeyLoginChallenges: {
    store: typeof routes['passkey_login_challenges.store']
  }
  passkeySession: {
    store: typeof routes['passkey_session.store']
  }
  dashboard: typeof routes['dashboard']
  readingPosition: {
    update: typeof routes['reading_position.update']
  }
  settings: typeof routes['settings']
  profile: {
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
  }
  security: {
    show: typeof routes['security.show']
  }
  accountPassword: {
    update: typeof routes['account_password.update']
  }
  passkeyRegistrationChallenges: {
    store: typeof routes['passkey_registration_challenges.store']
  }
  passkeys: {
    store: typeof routes['passkeys.store']
    update: typeof routes['passkeys.update']
    destroy: typeof routes['passkeys.destroy']
  }
  bookmarks: {
    index: typeof routes['bookmarks.index']
    store: typeof routes['bookmarks.store']
    update: typeof routes['bookmarks.update']
    destroy: typeof routes['bookmarks.destroy']
  }
}
