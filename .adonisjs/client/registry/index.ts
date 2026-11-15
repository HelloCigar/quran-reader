/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [[0,"/"]],
    types: placeholder as Registry['home']['types'],
  },
  'surahs.index': {
    methods: ["GET","HEAD"],
    pattern: '/quran',
    tokens: [[0,"quran"]],
    types: placeholder as Registry['surahs.index']['types'],
  },
  'ayahs.show': {
    methods: ["GET","HEAD"],
    pattern: '/quran/ayah',
    tokens: [[0,"quran"],[0,"ayah"]],
    types: placeholder as Registry['ayahs.show']['types'],
  },
  'surahs.show': {
    methods: ["GET","HEAD"],
    pattern: '/quran/:number',
    tokens: [[0,"quran"],[1,"number"]],
    types: placeholder as Registry['surahs.show']['types'],
  },
  'email_verifications.show': {
    methods: ["GET","HEAD"],
    pattern: '/email-verifications/:token',
    tokens: [[0,"email-verifications"],[1,"token"]],
    types: placeholder as Registry['email_verifications.show']['types'],
  },
  'email_verifications.update': {
    methods: ["PUT"],
    pattern: '/email-verifications/:token',
    tokens: [[0,"email-verifications"],[1,"token"]],
    types: placeholder as Registry['email_verifications.update']['types'],
  },
  'password_resets.show': {
    methods: ["GET","HEAD"],
    pattern: '/password-resets/:token',
    tokens: [[0,"password-resets"],[1,"token"]],
    types: placeholder as Registry['password_resets.show']['types'],
  },
  'password_resets.update': {
    methods: ["PUT"],
    pattern: '/password-resets/:token',
    tokens: [[0,"password-resets"],[1,"token"]],
    types: placeholder as Registry['password_resets.update']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.store']['types'],
  },
  'passkey_login_challenges.store': {
    methods: ["POST"],
    pattern: '/login/passkey/challenge',
    tokens: [[0,"login"],[0,"passkey"],[0,"challenge"]],
    types: placeholder as Registry['passkey_login_challenges.store']['types'],
  },
  'passkey_session.store': {
    methods: ["POST"],
    pattern: '/login/passkey',
    tokens: [[0,"login"],[0,"passkey"]],
    types: placeholder as Registry['passkey_session.store']['types'],
  },
  'password_resets.create': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [[0,"forgot-password"]],
    types: placeholder as Registry['password_resets.create']['types'],
  },
  'password_resets.store': {
    methods: ["POST"],
    pattern: '/password-resets',
    tokens: [[0,"password-resets"]],
    types: placeholder as Registry['password_resets.store']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [[0,"dashboard"]],
    types: placeholder as Registry['dashboard']['types'],
  },
  'email_verifications.store': {
    methods: ["POST"],
    pattern: '/email-verifications',
    tokens: [[0,"email-verifications"]],
    types: placeholder as Registry['email_verifications.store']['types'],
  },
  'email_verifications.create': {
    methods: ["GET","HEAD"],
    pattern: '/account/activate',
    tokens: [[0,"account"],[0,"activate"]],
    types: placeholder as Registry['email_verifications.create']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [[0,"logout"]],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'reading_position.update': {
    methods: ["PUT"],
    pattern: '/reading-position',
    tokens: [[0,"reading-position"]],
    types: placeholder as Registry['reading_position.update']['types'],
  },
  'settings': {
    methods: ["GET","HEAD"],
    pattern: '/settings',
    tokens: [[0,"settings"]],
    types: placeholder as Registry['settings']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/settings/profile',
    tokens: [[0,"settings"],[0,"profile"]],
    types: placeholder as Registry['profile.show']['types'],
  },
  'profile.update': {
    methods: ["PUT"],
    pattern: '/settings/profile',
    tokens: [[0,"settings"],[0,"profile"]],
    types: placeholder as Registry['profile.update']['types'],
  },
  'security.show': {
    methods: ["GET","HEAD"],
    pattern: '/settings/security',
    tokens: [[0,"settings"],[0,"security"]],
    types: placeholder as Registry['security.show']['types'],
  },
  'account_password.update': {
    methods: ["PUT"],
    pattern: '/settings/password',
    tokens: [[0,"settings"],[0,"password"]],
    types: placeholder as Registry['account_password.update']['types'],
  },
  'passkey_registration_challenges.store': {
    methods: ["POST"],
    pattern: '/settings/passkeys/challenge',
    tokens: [[0,"settings"],[0,"passkeys"],[0,"challenge"]],
    types: placeholder as Registry['passkey_registration_challenges.store']['types'],
  },
  'passkeys.store': {
    methods: ["POST"],
    pattern: '/settings/passkeys',
    tokens: [[0,"settings"],[0,"passkeys"]],
    types: placeholder as Registry['passkeys.store']['types'],
  },
  'passkeys.update': {
    methods: ["PUT"],
    pattern: '/settings/passkeys/:id',
    tokens: [[0,"settings"],[0,"passkeys"],[1,"id"]],
    types: placeholder as Registry['passkeys.update']['types'],
  },
  'passkeys.destroy': {
    methods: ["DELETE"],
    pattern: '/settings/passkeys/:id',
    tokens: [[0,"settings"],[0,"passkeys"],[1,"id"]],
    types: placeholder as Registry['passkeys.destroy']['types'],
  },
  'bookmarks.index': {
    methods: ["GET","HEAD"],
    pattern: '/bookmarks',
    tokens: [[0,"bookmarks"]],
    types: placeholder as Registry['bookmarks.index']['types'],
  },
  'bookmarks.store': {
    methods: ["POST"],
    pattern: '/bookmarks',
    tokens: [[0,"bookmarks"]],
    types: placeholder as Registry['bookmarks.store']['types'],
  },
  'bookmarks.update': {
    methods: ["PUT","PATCH"],
    pattern: '/bookmarks/:id',
    tokens: [[0,"bookmarks"],[1,"id"]],
    types: placeholder as Registry['bookmarks.update']['types'],
  },
  'bookmarks.destroy': {
    methods: ["DELETE"],
    pattern: '/bookmarks/:id',
    tokens: [[0,"bookmarks"],[1,"id"]],
    types: placeholder as Registry['bookmarks.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
