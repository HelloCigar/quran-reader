import { setTimeout as delay } from 'node:timers/promises'
import type User from '#models/user'
import ReadingPosition from '#models/reading_position'

/**
 * The `reader`'s Reading Position as an Ayah Reference (`18:10`), or `null`
 * when they have none.
 */
export async function readingPositionOf(reader: User): Promise<string | null> {
  const position = await ReadingPosition.findBy('user_id', reader.id)
  return position ? `${position.surahNumber}:${position.ayahNumber}` : null
}

/**
 * Waits until the `reader`'s Reading Position is the Ayah `reference`. The
 * reading page saves it in the background, out of the page's sight, so the
 * test waits on the database instead.
 */
export async function waitForReadingPosition(reader: User, reference: string) {
  const deadline = Date.now() + 10_000
  for (;;) {
    const current = await readingPositionOf(reader)
    if (current === reference) return
    if (Date.now() > deadline) {
      throw new Error(`The Reading Position is ${current}, not ${reference}`)
    }
    await delay(50)
  }
}
