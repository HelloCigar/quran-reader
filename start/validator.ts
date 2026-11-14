/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate, VineNumber, VineString } from '@vinejs/vine'
import { SURAH_AYAH_COUNTS } from '#values/surah_ayah_counts'
import AyahReference from '#ayah_reference/ayah_reference'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * `ayahOfSurah(surahField)`: the ayah number must fall within the surah named
 * by the sibling `surahField`, checked against the static ayah counts so it
 * never depends on the Quran text source. When the sibling isn't a valid
 * surah number the rule skips, because that field reports its own error.
 */
const ayahOfSurahRule = vine.createRule<{ surahField: string }>((value, options, field) => {
  if (!field.isValid || typeof value !== 'number') return

  const surah = Number(field.parent[options.surahField])
  if (!Number.isInteger(surah) || surah < 1 || surah > SURAH_AYAH_COUNTS.length) return

  if (value > SURAH_AYAH_COUNTS[surah - 1]) {
    field.report('The {{ field }} field is not an ayah of this surah', 'ayahOfSurah', field)
  }
})

declare module '@vinejs/vine' {
  interface VineNumber {
    ayahOfSurah(surahField: string): this
  }
}

VineNumber.macro('ayahOfSurah', function (this: VineNumber, surahField: string) {
  return this.use(ayahOfSurahRule({ surahField }))
})

/**
 * `ayahReference()`: the string must be an Ayah Reference (`2:255`) of an Ayah
 * in the Quran.
 */
const ayahReferenceRule = vine.createRule((value, _options, field) => {
  if (typeof value !== 'string') return

  if (!AyahReference.parse(value)) {
    field.report('The {{ field }} field must be an ayah reference', 'ayahReference', field)
  }
})

declare module '@vinejs/vine' {
  interface VineString {
    ayahReference(): this
  }
}

VineString.macro('ayahReference', function (this: VineString) {
  return this.use(ayahReferenceRule())
})

vine.messagesProvider = new SimpleMessagesProvider({
  'ayahReference': 'Enter an ayah of the Quran, such as 2:255.',
  'note.maxLength': 'Notes can be at most 500 characters.',
  'ayahOfSurah': 'That ayah is not in this surah.',
})
