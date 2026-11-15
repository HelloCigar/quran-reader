import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'surahs.index': { paramsTuple?: []; params?: {} }
    'ayahs.show': { paramsTuple?: []; params?: {} }
    'surahs.show': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'email_verifications.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'email_verifications.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password_resets.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password_resets.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'passkey_login_challenges.store': { paramsTuple?: []; params?: {} }
    'passkey_session.store': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'password_resets.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'email_verifications.store': { paramsTuple?: []; params?: {} }
    'email_verifications.create': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'settings': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'security.show': { paramsTuple?: []; params?: {} }
    'account_password.update': { paramsTuple?: []; params?: {} }
    'passkey_registration_challenges.store': { paramsTuple?: []; params?: {} }
    'passkeys.store': { paramsTuple?: []; params?: {} }
    'passkeys.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'passkeys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookmarks.index': { paramsTuple?: []; params?: {} }
    'bookmarks.store': { paramsTuple?: []; params?: {} }
    'bookmarks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookmarks.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'surahs.index': { paramsTuple?: []; params?: {} }
    'ayahs.show': { paramsTuple?: []; params?: {} }
    'surahs.show': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'email_verifications.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password_resets.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'email_verifications.create': { paramsTuple?: []; params?: {} }
    'settings': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'security.show': { paramsTuple?: []; params?: {} }
    'bookmarks.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'surahs.index': { paramsTuple?: []; params?: {} }
    'ayahs.show': { paramsTuple?: []; params?: {} }
    'surahs.show': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'email_verifications.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password_resets.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'email_verifications.create': { paramsTuple?: []; params?: {} }
    'settings': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'security.show': { paramsTuple?: []; params?: {} }
    'bookmarks.index': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'email_verifications.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password_resets.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'account_password.update': { paramsTuple?: []; params?: {} }
    'passkeys.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookmarks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'passkey_login_challenges.store': { paramsTuple?: []; params?: {} }
    'passkey_session.store': { paramsTuple?: []; params?: {} }
    'password_resets.store': { paramsTuple?: []; params?: {} }
    'email_verifications.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'passkey_registration_challenges.store': { paramsTuple?: []; params?: {} }
    'passkeys.store': { paramsTuple?: []; params?: {} }
    'bookmarks.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'passkeys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bookmarks.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'bookmarks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}