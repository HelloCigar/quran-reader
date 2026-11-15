# Quran Reader

A reader for the Quran in Uthmani Arabic with English translation, where readers can look up the meaning of each word and bookmark ayahs.

## Text

**Surah**:
One of the 114 chapters of the Quran, identified by its number.
_Avoid_: Chapter, sura

**Ayah**:
One verse of a Surah, identified by its number within that Surah.
_Avoid_: Verse, aya

**Ayah Reference**:
The address of an Ayah, written `surah:ayah` (e.g. `2:255`).
_Avoid_: Verse key

**Word**:
One word of an Ayah's Arabic text, as the reader sees it, including any pause sign that follows it. Pause signs and the ayah-end marker are not Words on their own.
_Avoid_: Token, segment

**Word Location**:
The address of a Word, written `surah:ayah:word` (e.g. `2:255:3`), counting Words from 1 within the Ayah.
_Avoid_: Word id, word key, word position

## Meaning

**Translation**:
The English rendering of a whole Ayah (Saheeh International).
_Avoid_: Meaning, tafsir

**Word Translation**:
The English meaning of a single Word, shown when the reader opens that Word.
_Avoid_: Gloss, word meaning, word-by-word

**Transliteration**:
A Word written in Latin letters so a reader can sound it out.
_Avoid_: Romanization, pronunciation

## Reading

**Reading Position**:
The Ayah a reader last reached, by reading past it, staying on it, or hearing it in a Recitation. A quick look at an Ayah does not move it. Only signed-in readers have one, and each has exactly one.
_Avoid_: Last read, progress, history

**Bookmark**:
An Ayah a reader has kept so they can come back to it. Unlike the Reading Position, it stays put until the reader removes it.
_Avoid_: Favourite, saved ayah

**Note**:
The reader's own text attached to a Bookmark.
_Avoid_: Comment, annotation

## Listening

**Recitation**:
A Reciter's audio of the Quran. It plays from a chosen Ayah through to the end of the Surah, and the Recited Word's meaning is shown as it goes.
_Avoid_: Dictation, audio, playback

**Reciter**:
The person whose voice a Recitation is.
_Avoid_: Qari, narrator, voice

**Recited Word**:
The Word being heard at the current moment of a Recitation.
_Avoid_: Current word, active word, playing word

**Recited Ayah**:
The Ayah being heard at the current moment of a Recitation. Moving to the previous or next Ayah, or dragging through the Recitation, always lands at the start of an Ayah. A Recitation stops at the end of its Surah and keeps playing while the reader goes to other pages.
_Avoid_: Current ayah, playing ayah, track
