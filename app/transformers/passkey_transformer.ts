import type { Passkey } from '@adonisplus/persona/passkeys'
import { BaseTransformer } from '@adonisjs/core/transformers'

/** A day as the page shows it: "Nov 16, 2026". */
const dayFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' })

export default class PasskeyTransformer extends BaseTransformer<Passkey> {
  toObject() {
    return {
      id: String(this.resource.identifier),
      ...this.pick(this.resource, ['name', 'backedUp']),
      addedOn: dayFormat.format(this.resource.createdAt),
      /** `null` for a passkey never used to sign in. */
      lastUsedOn: this.resource.lastUsedAt ? dayFormat.format(this.resource.lastUsedAt) : null,
    }
  }
}
