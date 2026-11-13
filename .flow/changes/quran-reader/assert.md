---
built: 2026-11-13
---

# Quran Reader — Test Plan

> Stack: AdonisJS + Inertia React
> Source: .flow/changes/quran-reader/blueprint.md
> Date: 2026-11-13

## Summary

Browser tests for the public Quran reader. They cover:

- the surah list;
- the reading view (heading, Bismillah rule, ayahs, credit line, pager);
- the 1–114 route matcher;
- the unavailable page;
- the "Read the Quran" link on the home page.

Every test swaps `QuranTextService` for an in-memory fake, so no test reaches Al Quran Cloud or the cache.

## Pre-implementation requirements

- `tests/helpers/quran/fake_quran_text_service.ts`: `FakeQuranTextService extends QuranTextService`. It's the container-swap fake for the service that wraps the Al Quran Cloud HTTP calls and the cache.
  - `listSurahs()` returns the 114 entries from `surahs.json`.
  - `readSurah(n)` returns the fixture surah when one exists. Otherwise it builds a surah from the list entry: `ayahCount` placeholder ayahs, and `bismillah` set to the Uthmani Bismillah "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" unless `n` is 1 or 9.
  - The static `unavailable()` returns an instance whose two methods throw `new QuranUnavailableException()`.
  - It returns a fresh copy (for example `structuredClone`) on every call and holds no state shared between instances.
- `tests/fixtures/quran/surahs.json` holds the 114 `SurahSummary` rows, recorded once from `GET https://api.alquran.cloud/v1/surah` and mapped to the domain shape in `types/quran.ts`.
- `tests/fixtures/quran/surah_1.json` holds surah 1 as a `Surah`, recorded once from `/surah/1/editions/quran-uthmani,en.sahih`, with the U+FEFF stripped and `bismillah: null`.
- View locator hooks, which build adds while writing the pages:
  - the surah list `List` in `quran/index` has the accessible name **"Surahs"**;
  - the ayah `List` in `quran/show` has the accessible name **"Ayahs"**, and every ayah renders as one list item;
  - the Bismillah line in `quran/show` carries **`data-testid="bismillah"`**. On surah 1 the identical text is also ayah 1:1, so no text locator can tell them apart.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| #   | Observable behavior                                                                                                   | Decision | Notes                                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The home page shows a "Read the Quran" link that leads to /quran                                                      | add      | —                                                                                                                                            |
| 2   | The home page's "Get started" and "Sign in" links reach sign-up and login                                             | keep     | tests/browser/navigation.spec.ts:guests can go from the home page to signup and login                                                        |
| 3   | Home → sign-up navigation happens without a full reload                                                               | keep     | tests/browser/navigation.spec.ts:navigates between pages without a full reload                                                               |
| 4   | /quran shows 114 surah rows                                                                                           | add      | —                                                                                                                                            |
| 5   | A list row reads "1 · Al-Faatiha" with "The Opening" and "7 ayahs"                                                    | add      | —                                                                                                                                            |
| 6   | Picking a list row opens that surah at /quran/<number>                                                                | add      | —                                                                                                                                            |
| 7   | A guest reaches /quran without being asked to sign in                                                                 | dedup    | → row 4 (every reader test runs as a guest)                                                                                                  |
| 8   | A signed-in visitor reaches /quran without a redirect                                                                 | skip     | the routes carry no auth or guest middleware, and nothing branches on auth state                                                             |
| 9   | When the text source fails, /quran shows "The Quran text couldn't be loaded right now. Please try again in a moment." | add      | —                                                                                                                                            |
| 10  | The /quran failure page shows no surah rows                                                                           | dedup    | → row 9 (the exception path never renders the list)                                                                                          |
| 11  | The surah heading shows the transliterated name, Arabic name and meaning                                              | add      | —                                                                                                                                            |
| 12  | The surah heading shows "Medinan · 286 ayahs"                                                                         | dedup    | → row 11 (one heading block, one visit)                                                                                                      |
| 13  | Surah 2 shows the Bismillah on its own line                                                                           | add      | —                                                                                                                                            |
| 14  | Surah 2's ayah 1 Arabic reads "الٓ", with no Bismillah prefix                                                          | skip     | `QuranTextService` is swapped, so this would only assert the fake's data. The lifting logic is left uncovered by choice (see Open questions) |
| 15  | Surah 1 shows no separate Bismillah line, and ayah 1:1 is the Bismillah                                               | dedup    | → row 16 (both render a surah whose `bismillah` is null; the 1:1 text would come from the fake)                                              |
| 16  | Surah 9 shows no Bismillah                                                                                            | add      | —                                                                                                                                            |
| 17  | Each ayah shows its Arabic, its English and a "<surah>:<ayah>" reference                                              | add      | —                                                                                                                                            |
| 18  | A surah page shows every one of its ayahs                                                                             | add      | —                                                                                                                                            |
| 19  | A surah page shows "Quran text from Al Quran Cloud (alquran.cloud) · English translation: Saheeh International."      | add      | —                                                                                                                                            |
| 20  | When the text source fails, /quran/<n> shows the unavailable message                                                  | add      | —                                                                                                                                            |
| 21  | An incomplete surah from the source shows the unavailable message                                                     | skip     | completeness checking lives in the swapped service                                                                                           |
| 22  | A Bismillah prefix that isn't an exact match stays in ayah 1                                                          | skip     | prefix matching lives in the swapped service                                                                                                 |
| 23  | /quran/0, /quran/115 and /quran/abc show the "Not found" page                                                         | add      | —                                                                                                                                            |
| 24  | Surah 2 offers "← Al-Faatiha" and "Aal-i-Imraan →" links that open those surahs                                       | add      | —                                                                                                                                            |
| 25  | Surah 1 offers no previous-surah link                                                                                 | add      | —                                                                                                                                            |
| 26  | Surah 114 offers no next-surah link                                                                                   | add      | —                                                                                                                                            |
| 27  | "All surahs" on a surah page returns to /quran                                                                        | add      | —                                                                                                                                            |
| 28  | A cached surah is shown again without calling the source                                                              | skip     | BentoCache `getOrSet` behavior, which belongs to the framework                                                                               |
| 29  | A stale cached copy is served during a source outage (grace)                                                          | skip     | BentoCache grace behavior, which belongs to the framework                                                                                    |
| 30  | A leading U+FEFF is removed from Arabic text                                                                          | skip     | stripping happens in the swapped service                                                                                                     |

## Test list (ordered)

Reads: testing.md

1. T1 [browser] — lists all 114 surahs
2. T2 [browser] — shows a surah's number, name, meaning and ayah count in its row
3. T3 [browser] — opens a surah from the list
4. T4 [browser] — shows the unavailable message when the surah list can't be loaded
5. T5 [browser] — shows the surah heading
6. T6 [browser] — shows the Bismillah on its own line before the first ayah
7. T7 [browser] — shows no separate Bismillah line on surah {number}
8. T8 [browser] — shows each ayah's Arabic, English and reference
9. T9 [browser] — shows every ayah of the surah
10. T10 [browser] — credits the text source and the translation
11. T11 [browser] — opens the {direction} surah from the pager
12. T12 [browser] — offers no {direction} link on surah {number}
13. T13 [browser] — returns to the surah list from a surah
14. T14 [browser] — shows the unavailable message when a surah can't be loaded
15. T15 [browser] — shows the "Not found" page for /quran/{value}
16. T16 [browser] — reaches the surah list from the home page

Suggested files, one per flow:

- `tests/browser/quran/index.spec.ts`: T1–T4
- `tests/browser/quran/show.spec.ts`: T5–T14
- `tests/browser/quran/not_found.spec.ts`: T15
- `tests/browser/quran/entry.spec.ts`: T16

## Per-test contracts

Reads: testing.md

All tests are in the **browser** suite, run as a **guest**, and use **no factories**. Every test except T15 sets up the fake as `swap(QuranTextService, new FakeQuranTextService())`. T4 and T14 use `FakeQuranTextService.unavailable()` instead. The fake is declared inside each test body.

### Test 1 — lists all 114 surahs

- **Surface:** SurahsController.index
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.index')`.
- **Outcome contract:**
  - Post-action URL: `/quran`
  - Rendered DOM:
    - the heading "The Quran" is visible;
    - the list named "Surahs" contains exactly 114 links.
  - DB / fake / exception assertions: none
- **Does NOT assert:** the row content (T2), the row order, the credit line.
- **Why:** `index` renders every row `listSurahs()` returns.

### Test 2 — shows a surah's number, name, meaning and ayah count in its row

- **Surface:** SurahsController.index
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.index')`.
- **Outcome contract:**
  - Post-action URL: `/quran`
  - Rendered DOM: inside the "Surahs" list, the texts "1 · Al-Faatiha", "The Opening" and "7 ayahs" are visible (exact).
  - DB / fake / exception assertions: none
- **Does NOT assert:** the other rows, the Arabic name (it isn't in the list), styling.
- **Why:** `SurahTransformer.toObject` drives the row format, including `ayahCount.formatted`.

### Test 3 — opens a surah from the list

- **Surface:** SurahsController.index (the row link)
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** on `/quran`, click the link in "Surahs" that contains "2 · Al-Baqara".
- **Outcome contract:**
  - Post-action URL: `route('surahs.show', { number: 2 })`
  - Rendered DOM: the heading "Al-Baqara" is visible.
  - DB / fake / exception assertions: none
- **Does NOT assert:** ayah content, the pager.
- **Why:** each row links to `surahs.show` with its number.

### Test 4 — shows the unavailable message when the surah list can't be loaded

- **Surface:** SurahsController.index → QuranUnavailableException
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, FakeQuranTextService.unavailable())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.index')`.
- **Outcome contract:**
  - Post-action URL: `/quran`
  - Rendered DOM:
    - the heading "Quran text unavailable" is visible;
    - the text "The Quran text couldn't be loaded right now. Please try again in a moment." is visible (exact);
    - there's no list named "Surahs".
  - DB / fake / exception assertions: none
- **Does NOT assert:** the HTTP status code, logging.
- **Why:** the exception's `handle()` renders `errors/quran_unavailable`.

### Test 5 — shows the surah heading

- **Surface:** SurahsController.show
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.show', { number: 2 })`.
- **Outcome contract:**
  - Post-action URL: `/quran/2`
  - Rendered DOM, each visible and exact:
    - the heading "Al-Baqara";
    - the text "سُورَةُ البَقَرَةِ";
    - the text "The Cow";
    - the text "Medinan · 286 ayahs".
  - DB / fake / exception assertions: none
- **Does NOT assert:** right-to-left direction, fonts, the Bismillah.
- **Why:** the `forReading` variant feeds `SurahHeading`.

### Test 6 — shows the Bismillah on its own line before the first ayah

- **Surface:** SurahsController.show
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.show', { number: 2 })`.
- **Outcome contract:**
  - Post-action URL: `/quran/2`
  - Rendered DOM: the `bismillah` test id is visible, with the exact text "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ".
  - DB / fake / exception assertions: none
- **Does NOT assert:** its exact placement relative to 2:1 (no assertion API covers order), ayah 1's text (the fake's data).
- **Why:** `show` renders the `bismillah` prop when it isn't null.

### Test 7 — shows no separate Bismillah line on surah {number}

- **Surface:** SurahsController.show
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: dataset `[{ number: 1, heading: 'Al-Faatiha' }, { number: 9, heading: 'At-Tawba' }]`
- **Action:** visit `route('surahs.show', { number })`.
- **Outcome contract:**
  - Post-action URL: `/quran/<number>`
  - Rendered DOM:
    - the heading `heading` is visible, which waits for the render to finish;
    - the `bismillah` test id does not exist.
  - DB / fake / exception assertions: none
- **Does NOT assert:** ayah 1:1's content.
- **Why:** with `bismillah: null`, the page renders no line.

### Test 8 — shows each ayah's Arabic, English and reference

- **Surface:** SurahsController.show → AyahTransformer
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.show', { number: 1 })`.
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM, inside the "Ayahs" list, each visible and exact:
    - "1:2";
    - "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ";
    - "[All] praise is [due] to Allah, Lord of the worlds -".
  - DB / fake / exception assertions: none
- **Does NOT assert:** right-to-left styling, the other ayahs.
- **Why:** `AyahTransformer` produces `reference` and passes `arabic` and `english` through unchanged.

### Test 9 — shows every ayah of the surah

- **Surface:** SurahsController.show
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.show', { number: 2 })`.
- **Outcome contract:**
  - Post-action URL: `/quran/2`
  - Rendered DOM:
    - the "Ayahs" list has exactly 286 list items;
    - the text "2:286" is visible (exact).
  - DB / fake / exception assertions: none
- **Does NOT assert:** the ayah text.
- **Why:** the whole surah renders on one page, with no paging.

### Test 10 — credits the text source and the translation

- **Surface:** SurahsController.show → QuranCredit
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.show', { number: 1 })`.
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM:
    - the text "Quran text from Al Quran Cloud (alquran.cloud) · English translation: Saheeh International." is visible. If the link splits the text node, match it with `exact: false` on that full string;
    - a link named "Al Quran Cloud" exists.
  - DB / fake / exception assertions: none
- **Does NOT assert:** the credit on /quran (the same component), the link's target attribute.
- **Why:** the source's terms require crediting the text and the translator.

### Test 11 — opens the {direction} surah from the pager

- **Surface:** SurahsController.show → SurahPager
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: dataset `[{ direction: 'previous', label: '← Al-Faatiha', number: 1, heading: 'Al-Faatiha' }, { direction: 'next', label: 'Aal-i-Imraan →', number: 3, heading: 'Aal-i-Imraan' }]`
- **Action:** on `route('surahs.show', { number: 2 })`, click the link named `label` (exact).
- **Outcome contract:**
  - Post-action URL: `route('surahs.show', { number })`
  - Rendered DOM: the heading `heading` is visible.
  - DB / fake / exception assertions: none
- **Does NOT assert:** a reload without a full page load, the other pager link.
- **Why:** `previous` and `next` are worked out from the list by the controller.

### Test 12 — offers no {direction} link on surah {number}

- **Surface:** SurahsController.show → SurahPager
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: dataset `[{ direction: 'previous', number: 1, pattern: /^←/ }, { direction: 'next', number: 114, pattern: /→$/ }]`
- **Action:** visit `route('surahs.show', { number })`.
- **Outcome contract:**
  - Post-action URL: `/quran/<number>`
  - Rendered DOM:
    - the link "All surahs" is visible, which waits for the render to finish;
    - no link whose name matches `pattern` exists.
  - DB / fake / exception assertions: none
- **Does NOT assert:** the other direction's link.
- **Why:** the ends of the list give `null` neighbours.

### Test 13 — returns to the surah list from a surah

- **Surface:** SurahsController.show → SurahPager
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** on `route('surahs.show', { number: 2 })`, click the link "All surahs" (exact).
- **Outcome contract:**
  - Post-action URL: `route('surahs.index')`
  - Rendered DOM: the heading "The Quran" is visible.
  - DB / fake / exception assertions: none
- **Does NOT assert:** the list content.
- **Why:** the pager links back to `surahs.index`.

### Test 14 — shows the unavailable message when a surah can't be loaded

- **Surface:** SurahsController.show → QuranUnavailableException
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, FakeQuranTextService.unavailable())`
  - Auth: guest
  - Other: none
- **Action:** visit `route('surahs.show', { number: 2 })`.
- **Outcome contract:**
  - Post-action URL: `/quran/2`
  - Rendered DOM:
    - the heading "Quran text unavailable" is visible;
    - the text "The Quran text couldn't be loaded right now. Please try again in a moment." is visible (exact);
    - there's no list named "Ayahs".
  - DB / fake / exception assertions: none
- **Does NOT assert:** the HTTP status code, logging.
- **Why:** the exception's `handle()` covers the `show` path too.

### Test 15 — shows the "Not found" page for /quran/{value}

- **Surface:** the `surahs.show` route matcher
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`, so a matcher that leaks fails loudly instead of calling the network
  - Auth: guest
  - Other: dataset `[{ value: '0' }, { value: '115' }, { value: 'abc' }]`
- **Action:** visit `route('surahs.show', { number: value })`. If the typed `route()` helper rejects a non-numeric or out-of-range param, build uses the narrowest typed escape for that one argument, and never `page.goto`.
- **Outcome contract:**
  - Post-action URL: `/quran/<value>`
  - Rendered DOM:
    - the heading "Not found" is visible;
    - there's no list named "Ayahs".
  - DB / fake / exception assertions: none
- **Does NOT assert:** the 404 status, the debug page (tests render status pages).
- **Why:** the custom matcher allows only 1–114.

### Test 16 — reaches the surah list from the home page

- **Surface:** marketing/home → SurahsController.index
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: guest
  - Other: none
- **Action:** on `route('home')`, click the link "Read the Quran" (exact).
- **Outcome contract:**
  - Post-action URL: `route('surahs.index')`
  - Rendered DOM: the heading "The Quran" is visible.
  - DB / fake / exception assertions: none
- **Does NOT assert:** the existing home buttons (covered by `navigation.spec.ts`).
- **Why:** the brief's entry point is a "Read the Quran" link on the home page.

## Factories audit

Reads: testing.md

No factories are used, existing or new. None of the reader's behavior touches app tables, and every test runs as a guest.

## Fakes audit

Reads: testing.md

- `FakeQuranTextService` (new, `tests/helpers/quran/fake_quran_text_service.ts`) is a **container swap** of the `QuranTextService` binding, set inside each test body with `swap(...)`, which restores itself.
  - **Used by:** T1–T16. T4 and T14 use the `unavailable()` variant.
  - **Why this boundary:** `QuranTextService` wraps external IO, namely the outbound HTTP calls to Al Quran Cloud and the cache in front of them. Swapping it keeps the suite off the network. The cost was accepted knowingly: the service's own Bismillah lifting, U+FEFF stripping, completeness checks and error mapping aren't covered (coverage rows 14, 21, 22, 30).
- No built-in fakes (mail, emitter, hash, drive) are used.

## Order rationale

- The list comes first because it's the thinnest slice that can be built: one service method, one transformer, one page.
- T3 lands on a surah page, so it only goes green once `show` exists. Build can leave T3 red until run 2 is green, or write T3 after T5.
- Home (T16) comes last because it only adds a button that points at a page that already works.

## Runner-model risks

Reads: testing.md

No violations found. Things to watch, each already handled by the plan:

1. **The container swap leaking between tests.** Every test calls `swap(QuranTextService, …)` inside its own body, and `swap` restores itself when the test ends. No swap goes in group hooks.
2. **Shared fixture data.** `FakeQuranTextService` returns a fresh copy of the fixture data on every call, so a module-level JSON import shared across instances can't carry a change from one test into the next.
3. **The real service reaching the network.** Every test that renders a reader page swaps the fake in. `navigation.spec.ts` only renders the home page, which never calls `QuranTextService`.
4. **Database and cache state.** No test writes rows, and with the service swapped the cache is never touched. The Quran spec files need no truncate and no cache clearing.
5. **Waiting.** Every test waits on a visible heading or link with `page.assert*` before any "not exists" check (T7, T12), so there are no sleeps and no false greens from an unrendered page.

## Arabic text in contracts

The Arabic strings above are the exact Al Quran Cloud codepoints. The source puts shadda before the short vowel, which is not NFC order, so code writes them as `\u` escapes that no editor or formatter can re-normalize (amended at build, 2026-11-13).

## Open questions

- **The service's own logic is untested by choice.** Nothing in the suite covers `QuranTextService`'s Bismillah lifting, its exact-prefix guard, U+FEFF stripping, the completeness checks or the error wrapping.
  - Covering them later needs an injectable boundary under the service, for example a thin `AlQuranCloudClient` class that tests can `swap()`.
  - Until then, the build step should check those behaviors by hand against the live API: 1:1, 2:1 and 9:1, plus one incomplete response.
  - **Answered (2026-11-13):** accepted as planned. Build runs the manual live-API check (1:1, 2:1, 9:1, one incomplete response) and reports the results; no test is added for the service.

---
