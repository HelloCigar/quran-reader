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
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard']
  bookmarks: {
    index: typeof routes['bookmarks.index']
    store: typeof routes['bookmarks.store']
    update: typeof routes['bookmarks.update']
    destroy: typeof routes['bookmarks.destroy']
  }
}
