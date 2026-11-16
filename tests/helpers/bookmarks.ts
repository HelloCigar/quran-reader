import { DateTime } from 'luxon'
import User from '#models/user'

/**
 * A reader with `count` Bookmarks, on the first Ayahs of Al-Baqarah (2), each
 * made a minute after the one before: 2:1 is the oldest.
 */
export async function readerWithBookmarks(count: number) {
  const reader = await User.create({
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'secret-password',
  })
  const first = DateTime.now().minus({ days: 1 })
  await reader.related('bookmarks').createMany(
    Array.from({ length: count }, (_, index) => ({
      surahNumber: 2,
      ayahNumber: index + 1,
      note: null,
      createdAt: first.plus({ minutes: index }),
    }))
  )
  return reader
}
