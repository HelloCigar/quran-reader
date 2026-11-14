import { SURAH_AYAH_COUNTS } from '#values/surah_ayah_counts'

/**
 * The address of an Ayah, written `surah:ayah` (e.g. `2:255`). Only an Ayah
 * that is in the Quran has one.
 */
export default class AyahReference {
  readonly surah: number
  readonly ayah: number

  private constructor(surah: number, ayah: number) {
    this.surah = surah
    this.ayah = ayah
  }

  /**
   * The Ayah Reference `text` names, or `null` when it isn't written
   * `surah:ayah` or names an Ayah that isn't in the Quran (`115:1`, `2:287`).
   * Spaces around the colon are allowed.
   */
  static parse(text: string): AyahReference | null {
    const match = /^\s*(\d{1,3})\s*:\s*(\d{1,3})\s*$/.exec(text)
    if (!match) return null

    const surah = Number(match[1])
    const ayah = Number(match[2])
    const ayahCount = SURAH_AYAH_COUNTS[surah - 1]
    if (ayahCount === undefined || ayah < 1 || ayah > ayahCount) return null

    return new AyahReference(surah, ayah)
  }
}
