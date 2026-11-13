---
affects: [quran-reading]
briefed: 2026-11-12
---

# Quran Reader — Brief

## Entry point, user goal, status

Any visitor, signed in or not, starts on the public home page and follows a clear "Read the Quran" link. They want to pick a surah and read it in Arabic with an English translation, then move on to the next one. Status: **new**. The app has no Quran reading today.

## Prerequisites

- The public home page, which gains the "Read the Quran" link.
- The app's existing "page not found" page, used for surahs that don't exist.

## The journey, step by step

1. **Getting in.** From the home page, the visitor follows "Read the Quran" to the surah list. No account or sign-in is needed at any point.
2. **The surah list.**
   - **Sees:** all 114 surahs, in order. Each row shows the surah number, transliterated name, English meaning and ayah count, e.g. "1 · Al-Fatihah · The Opener · 7 ayahs". There is no search or filter.
   - **Can:** pick any surah to open it.
   - **Failure:** if the Quran text can't be loaded, the visitor sees "The Quran text couldn't be loaded right now. Please try again in a moment." instead of the list. They never see a partial list.
3. **Opening a surah.**
   - **Address:** every surah has its own shareable address, which opens the surah at its top. Individual ayahs do not have their own addresses.
   - **Heading:** the Arabic name, transliterated name, English meaning, where the surah was revealed (Meccan or Medinan) and the ayah count.
   - **Bismillah:** shown on its own line above ayah 1 in every surah except Al-Fatihah (surah 1), where it _is_ ayah 1, and At-Tawbah (surah 9), which has none.
   - **Failure, surah doesn't exist:** an address for a surah that doesn't exist (such as 0, 115 or "abc") shows the app's existing "page not found" page.
   - **Failure, text can't load:** the visitor sees the same message as on the list, "The Quran text couldn't be loaded right now. Please try again in a moment." They never see a partial surah.
4. **Reading.** The whole surah is on one continuous scrolling page, even long ones like Al-Baqarah with 286 ayahs. Each ayah shows:
   - the Arabic text, unchanged and reading right to left;
   - the Saheeh International English translation beneath it;
   - its reference label, e.g. "2:255".

   The translation is always shown. The page credits the source of the Quran text and names the translation (Saheeh International).

5. **Moving on.** At the end of the surah the visitor can go to the previous or the next surah, each shown by name, or back to the surah list. Al-Fatihah has no previous surah and An-Nas (114) has no next surah.

## Research

1. **Surah list.** quran.com lists all 114 surahs. Each row shows the number, transliterated name, English meaning and ayah count. (https://quran.com/)
2. **Surah heading.** The Arabic name and Meccan/Medinan appear in the surah heading rather than in the list. (https://quran.com/2, https://tanzil.net/docs/quran_metadata)
3. **Reading layout.** A surah is one continuous scrolling list. Each ayah shows the Arabic with an English translation beneath and a "2:1"-style label. (https://quran.com/2)
4. **Bismillah.** It appears above ayah 1 of every surah except At-Tawbah. (https://quran.com/9)
5. **Translations.** quran.com defaults to The Clear Quran (Khattab), but Saheeh International is very common. (github.com/quran/quran.com-frontend-next)
6. **Navigation.**
   - Basic: a "Next surah" link at the end of a surah, and a shareable address for every ayah.
   - Extras: "continue reading", progress and reading goals, which require an account. (https://quran.com/)
7. **Text sources and terms.**
   - The Tanzil Arabic text must be reproduced exactly, with credit to "Tanzil Project". (https://tanzil.net/docs/text_license)
   - Al Quran Cloud is free and needs no key, with a soft per-visitor rate limit. It offers the full surah list with metadata, and Arabic plus Saheeh International together. Its terms require the text to be unaltered, the source acknowledged and translators credited by name. (https://alquran.cloud/api, https://alquran.cloud/terms-and-conditions)

## Decisions made

| Decision                    | Chosen                                                                 | Rejected                                                                              | Why                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Who can read                | Anyone, no sign-in                                                     | Signed-in only                                                                        | Nothing personal is stored, and reading should never be blocked by an account.                             |
| Way in                      | "Read the Quran" link from the existing home page                      | Home page becomes the surah list                                                      | Leaves the current home page and sign-up flow untouched.                                                   |
| What each list row shows    | Number, transliterated name, English meaning, ayah count               | Everything, including the Arabic name and Meccan/Medinan; or the number and name only | Matches quran.com (Research 1). The extra details go in the surah heading (Research 2).                    |
| Finding a surah in the list | Scroll the 114 in order                                                | Filter by name or number                                                              | 114 rows is short enough, and it keeps the reader really simple. Search can come later.                    |
| What each ayah shows        | Arabic plus English, always together                                   | English that can be hidden; Arabic only                                               | Readable for the widest audience with no extra controls (Research 3).                                      |
| Translation                 | Saheeh International                                                   | The Clear Quran (Khattab); Yusuf Ali or Pickthall                                     | Widely used and available from the source the user named (Research 5, 7).                                  |
| Top of a surah              | Full heading, plus the Bismillah except in surahs 1 and 9              | Heading only                                                                          | Matches every major reader (Research 2, 4).                                                                |
| How a surah is laid out     | The whole surah on one continuous page                                 | Split into pages                                                                      | Matches quran.com (Research 3). There are no page controls to learn.                                       |
| Moving between surahs       | Previous, next and back to the list                                    | Next only; back to the list only                                                      | Readers can move both ways without returning to the list.                                                  |
| Shareable addresses         | Surahs only                                                            | Individual ayahs too                                                                  | Keeps it really simple, and avoids having to handle ayahs that don't exist. Ayah addresses can come later. |
| When the text can't load    | A clear message asking the visitor to try again; nothing partial shown | Keep showing previously loaded text during outages                                    | Simpler. A sacred text must never appear broken or incomplete.                                             |

## Constraints the journey places on implementation

- **The Arabic text is shown exactly as the source provides it.** It is never altered, re-spelled or stripped of diacritics. It reads right to left.
- **Every surah's text is complete or not shown at all.** A partial list or surah is never shown.
- **Credit is required.** Any page that shows Quran text credits its source and names the translation, Saheeh International. Both are required by the text sources' terms (Research 7).
- **The Bismillah rule.** The Bismillah shows above ayah 1 of every surah except surah 1 (where it is ayah 1) and surah 9 (which has none).
- **Surah numbers.** Only 1 to 114 are valid. Any other surah address shows the existing "page not found" page.
- **Message when the text can't load:** "The Quran text couldn't be loaded right now. Please try again in a moment."
- **Ayah reference format:** `<surah>:<ayah>`, e.g. "2:255".
- **No sign-in.** Reading never requires an account.
