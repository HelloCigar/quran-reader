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

## Listening

**Recitation**:
A reciter's audio of the Quran, played while the Word being recited is highlighted.
_Avoid_: Dictation, audio, playback
