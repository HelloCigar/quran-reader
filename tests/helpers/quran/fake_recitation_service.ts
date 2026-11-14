import { setTimeout as delay } from 'node:timers/promises'
import RecitationService from '#services/recitation_service'
import type { AyahTiming, Recitation, Surah } from '#types/quran'

/**
 * Silence before the first Word, so Play is pressed before any Word is heard.
 */
const LEAD_IN_MS = 600
const SAMPLE_RATE = 8000

/**
 * Container-swap fake for RecitationService. Times every Word of the Surah
 * one after another, `wordMs` each, after a LEAD_IN_MS lead-in, and serves a
 * silent clip of that length as a data URL. Never touches the network.
 */
export default class FakeRecitationService extends RecitationService {
  /** How long each Word is heard: long enough to see, short enough to wait for. */
  readonly wordMs: number
  /** Word Locations heard in the audio but left out of the timings. */
  readonly untimed: string[]
  /**
   * How long after its first Word each Ayah is said to start, as in Quran
   * Foundation's timings, where a first Word can begin before its Ayah.
   */
  readonly ayahLagMs: number
  /** How long Quran Foundation takes to answer, so a test can act while Play loads. */
  readonly delayMs: number

  constructor({
    wordMs = 1000,
    untimed = [],
    ayahLagMs = 0,
    delayMs = 0,
  }: { wordMs?: number; untimed?: string[]; ayahLagMs?: number; delayMs?: number } = {}) {
    super()
    this.wordMs = wordMs
    this.untimed = untimed
    this.ayahLagMs = ayahLagMs
    this.delayMs = delayMs
  }

  /**
   * A fake whose Recitation can't be loaded, as when Quran Foundation is down.
   */
  static unavailable({ delayMs = 0 }: { delayMs?: number } = {}) {
    return new UnavailableRecitationService({ delayMs })
  }

  async readRecitation(surah: Surah): Promise<Recitation | null> {
    await delay(this.delayMs)
    const before = surah.ayahs.map((_, index) =>
      surah.ayahs.slice(0, index).reduce((count, ayah) => count + ayah.words.length, 0)
    )
    const at = (wordIndex: number) => LEAD_IN_MS + wordIndex * this.wordMs
    const ayahs = surah.ayahs.map((ayah, index): AyahTiming => ({
      number: ayah.number,
      startMs: at(before[index]) + this.ayahLagMs,
      endMs: at(before[index] + ayah.words.length),
      words: ayah.words
        .map((word, position) => ({
          location: word.location,
          startMs: at(before[index] + position),
          endMs: at(before[index] + position + 1),
        }))
        .filter(({ location }) => !this.untimed.includes(location)),
    }))
    const lengthMs = at(surah.ayahs.reduce((count, ayah) => count + ayah.words.length, 0))

    return { audioUrl: FakeRecitationService.#silence(lengthMs), ayahs }
  }

  /**
   * A mono 8-bit PCM WAV of silence, `ms` long, as a data URL.
   */
  static #silence(ms: number): string {
    const samples = Math.ceil((SAMPLE_RATE * ms) / 1000)
    const wav = Buffer.alloc(44 + samples, 128)
    wav.write('RIFF', 0)
    wav.writeUInt32LE(36 + samples, 4)
    wav.write('WAVEfmt ', 8)
    wav.writeUInt32LE(16, 16)
    wav.writeUInt16LE(1, 20)
    wav.writeUInt16LE(1, 22)
    wav.writeUInt32LE(SAMPLE_RATE, 24)
    wav.writeUInt32LE(SAMPLE_RATE, 28)
    wav.writeUInt16LE(1, 32)
    wav.writeUInt16LE(8, 34)
    wav.write('data', 36)
    wav.writeUInt32LE(samples, 40)
    return `data:audio/wav;base64,${wav.toString('base64')}`
  }
}

class UnavailableRecitationService extends FakeRecitationService {
  async readRecitation(_surah: Surah): Promise<Recitation | null> {
    await delay(this.delayMs)
    return null
  }
}
