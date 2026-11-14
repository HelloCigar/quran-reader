import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'surahs.index': { paramsTuple?: []; params?: {} }
    'ayahs.show': { paramsTuple?: []; params?: {} }
    'surahs.show': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
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
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'bookmarks.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'surahs.index': { paramsTuple?: []; params?: {} }
    'ayahs.show': { paramsTuple?: []; params?: {} }
    'surahs.show': { paramsTuple: [ParamValue]; params: {'number': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'bookmarks.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'bookmarks.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'bookmarks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'bookmarks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'bookmarks.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}