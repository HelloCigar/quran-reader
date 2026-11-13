---
capability: quran-reading
change: quran-reader
---

# Delta — quran-reading

## ADDED

### Reaching the reader

- Given any visitor, signed in or not, on the home page, when they follow "Read the Quran", then they reach the surah list without being asked to sign in.

### Surah list

- Given the Quran text is available, when a visitor opens the surah list, then they see all 114 surahs in order. Each shows its number, transliterated name, English meaning and ayah count, e.g. "1 · Al-Fatihah · The Opener · 7 ayahs".
- Given the surah list, when the visitor picks a surah, then that surah opens at its top.
- Given the Quran text can't be loaded, when a visitor opens the surah list, then they see "The Quran text couldn't be loaded right now. Please try again in a moment." and no partial list.

### Surah heading and Bismillah

- Given a visitor opens a surah, then they see its Arabic name, transliterated name, English meaning, Meccan or Medinan, and ayah count.
- Given a visitor opens any surah other than 1 or 9, then the Bismillah is shown on its own line above ayah 1.
- Given a visitor opens Al-Fatihah (1), then no separate Bismillah line is shown, because the Bismillah is ayah 1.
- Given a visitor opens At-Tawbah (9), then no Bismillah is shown.

### Reading a surah

- Given a visitor opens a surah, then every ayah of that surah is on one continuous page. Each ayah shows the unaltered Arabic reading right to left, the Saheeh International English beneath it, and a "<surah>:<ayah>" reference such as "2:255".
- Given a visitor reads a surah, then the page credits the source of the Quran text and names the translation, Saheeh International.
- Given the Quran text can't be loaded, when a visitor opens a surah, then they see "The Quran text couldn't be loaded right now. Please try again in a moment." and no partial surah.

### Shareable surah address

- Given a visitor has a surah's address, when they open it, then that surah opens at its top.
- Given an address for a surah outside 1 to 114, or not a number at all, when a visitor opens it, then they see the app's "page not found" page.

### Moving between surahs

- Given a visitor is reading a surah from 2 to 113, then they can go to the previous and the next surah, each shown by name, or back to the surah list.
- Given a visitor is reading Al-Fatihah (1), then no previous surah is offered.
- Given a visitor is reading An-Nas (114), then no next surah is offered.

## MODIFIED

_None._

## REMOVED

_None._
