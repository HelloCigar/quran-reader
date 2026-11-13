# Quran Foundation is the only source of Quran text

Word Translations need every Word of every Ayah, with a stable Word Location. Recitation will later need per-word timings keyed on the same Word Locations. alquran.cloud has neither. Splitting its Uthmani text on spaces gives words that don't line up with any word-by-word data. So we moved the surah list, the Arabic, the Translation (Saheeh International) and the Words to the Quran Foundation Content API (`apis.quran.foundation`). It is called from the server through the official `@quranjs/api` SDK with OAuth client credentials. We did not add Quran Foundation next to alquran.cloud, because then the Arabic shown and the Words translated would come from two sources that can drift apart.

## Considered Options

- **Keep alquran.cloud and add Quran Foundation only for Words**: rejected. The Arabic shown and the tappable Words could differ.
- **The open legacy `api.quran.com/api/v4`**: it works without credentials, but Quran Foundation is moving clients off it.
- **A bundled word-by-word dataset (e.g. QUL)**: no live dependency, but we would have to store and update the files ourselves.

## Consequences

- The server holds a Quran Foundation client id and secret.
- Surah and ayah numbers are the same in both sources, so stored Bookmarks are unaffected.
