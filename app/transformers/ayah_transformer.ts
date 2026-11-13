import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Ayah } from '#types/quran'

export default class AyahTransformer extends BaseTransformer<Ayah> {
  #surahNumber: number

  constructor(resource: Ayah, surahNumber: number) {
    super(resource)
    this.#surahNumber = surahNumber
  }

  /**
   * `arabic` passes through exactly as the service returns it.
   */
  toObject() {
    return {
      ...this.pick(this.resource, ['number', 'arabic', 'english']),
      reference: `${this.#surahNumber}:${this.resource.number}`,
    }
  }
}
