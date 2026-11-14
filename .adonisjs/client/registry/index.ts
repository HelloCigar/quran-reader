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
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [[0,"dashboard"]],
    types: placeholder as Registry['dashboard']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [[0,"logout"]],
    types: placeholder as Registry['session.destroy']['types'],
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
