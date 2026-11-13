---
built: 2026-11-13
---

# Ayah Bookmarks — Test Plan

> Stack: AdonisJS + Inertia React
> Source: .flow/changes/ayah-bookmarks/blueprint.md
> Date: 2026-11-13

## Summary

Browser tests cover:

- bookmarking from the surah page;
- notes and removal, from the ayah and from the list;
- the signed-out bookmark carried through sign-in and sign-up;
- the bookmarks list, including when the Quran text is unavailable;
- per-reader privacy.

One parameterized unit test locks every surah's ayah bound in the bookmark validator.

## Coverage decisions

Reads: testing.md

> This is the scope inventory for this change — every behavior the change makes observable, with a coverage decision per row. It is not the test list.

| #   | Observable behavior                                                                                                                        | Decision | Notes                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| 1   | Signed-out surah page: every ayah shows a "Bookmark <ref>" action and none shows "Bookmarked"                                              | add      | —                                                                                          |
| 2   | Signed-in surah page: the reader's bookmarked ayahs show "Bookmarked <ref>"                                                                | add      | —                                                                                          |
| 3   | Another reader's bookmark doesn't show as bookmarked on the surah page                                                                     | dedup    | → row 30 (the privacy test covers both pages)                                              |
| 4   | Bookmarking (signed in) saves a row, marks the ayah and opens the "Note on <ref>" dialog                                                   | add      | —                                                                                          |
| 5   | Dismissing the note dialog ("Not now") leaves the bookmark with no note                                                                    | add      | —                                                                                          |
| 6   | Bookmarking an ayah already bookmarked elsewhere leaves exactly one row                                                                    | add      | —                                                                                          |
| 7   | Saving a note from the dialog stores it                                                                                                    | add      | —                                                                                          |
| 8   | A 501-character note shows "Notes can be at most 500 characters." and the bookmark stays                                                   | add      | —                                                                                          |
| 9   | Saving a blank or whitespace-only note leaves the bookmark with no note                                                                    | add      | —                                                                                          |
| 10  | Saving a note on a bookmark removed elsewhere shows "This bookmark was removed. Bookmark the ayah again to add a note." and creates no row | add      | —                                                                                          |
| 11  | "Edit note" on a bookmarked ayah opens the dialog with the existing note, and the change is saved                                          | add      | —                                                                                          |
| 12  | Removing a bookmark with no note removes it at once and the ayah shows "Bookmark <ref>" again                                              | add      | —                                                                                          |
| 13  | Removing a bookmark with a note asks "Remove bookmark <ref>? Your note will be lost."; confirming removes it                               | add      | —                                                                                          |
| 14  | Declining that confirmation ("Keep") keeps the bookmark and its note                                                                       | add      | —                                                                                          |
| 15  | Signed out: the ayah's bookmark action lands on the sign-in page                                                                           | add      | —                                                                                          |
| 16  | Signing in from a carried bookmark returns to the surah, the ayah bookmarked and its note dialog open                                      | add      | —                                                                                          |
| 17  | Signing up (via "Create an account" from the carried sign-in page) does the same                                                           | add      | —                                                                                          |
| 18  | Signing in when the carried ayah is already bookmarked keeps one row and shows the existing note in the dialog                             | add      | —                                                                                          |
| 19  | Leaving the carried sign-in page and later signing in normally ends on the dashboard with nothing bookmarked                               | add      | —                                                                                          |
| 20  | Sign-in without a carried bookmark lands on the dashboard                                                                                  | keep     | browser/auth/session.spec.ts:logs in with valid credentials                                |
| 21  | Sign-up without a carried bookmark lands on the dashboard                                                                                  | keep     | browser/auth/signup.spec.ts:creates an account and lands on the dashboard                  |
| 22  | Other sign-in and sign-up behaviors (wrong password, validation, logout, guest redirects, login link)                                      | keep     | session.spec.ts and signup.spec.ts, existing titles                                        |
| 23  | "Bookmarks" in the signed-in navigation opens the list                                                                                     | add      | —                                                                                          |
| 24  | "Your bookmarks" on the surah list (signed in) opens the list                                                                              | add      | —                                                                                          |
| 25  | Opening /bookmarks signed out goes to sign-in, then lands on the list after signing in                                                     | add      | —                                                                                          |
| 26  | The list orders bookmarks most recently bookmarked first                                                                                   | add      | —                                                                                          |
| 27  | A list entry shows "2:255 · Al-Baqara", the Arabic, the English and the note                                                               | add      | —                                                                                          |
| 28  | Choosing a list entry opens /quran/<surah> with that ayah's anchor                                                                         | add      | —                                                                                          |
| 29  | Editing a note and removing a bookmark work from the list                                                                                  | add      | —                                                                                          |
| 30  | One reader's bookmarks never appear on another reader's list or surah page                                                                 | add      | —                                                                                          |
| 31  | An empty list says "You haven't bookmarked any ayahs yet" and "Read the Quran" opens the surah list                                        | add      | —                                                                                          |
| 32  | With the text unavailable, the list still shows each reference and note, plus "The ayah text couldn't be loaded right now."                | add      | —                                                                                          |
| 33  | Partial outage (one surah's text down, others up)                                                                                          | skip     | Same `null` branch as row 32; the fake fails all-or-nothing and the code path is identical |
| 34  | Updating or removing another reader's bookmark id                                                                                          | skip     | Unreachable through the UI; no page renders another reader's ids (row 30 proves it)        |
| 35  | Ayah numbers beyond a surah's count are rejected (all 114 surahs)                                                                          | add      | Unit layer: the UI only renders real ayahs, so the bound can't be reached in a browser     |
| 36  | Existing surah-page behaviors (heading, Bismillah, ayahs, pager, credit, unavailable page)                                                 | keep     | browser/quran/show.spec.ts, existing titles                                                |
| 37  | Existing surah-list behaviors                                                                                                              | keep     | browser/quran/index.spec.ts, existing titles                                               |
| 38  | Existing navigation, entry and not-found behaviors                                                                                         | keep     | navigation.spec.ts, quran/entry.spec.ts, quran/not_found.spec.ts                           |

## Test list (ordered)

Reads: testing.md

Walk order follows the approved surface sequence. Test numbers stay as approved per surface.

Spec files (one per Surface):

- `tests/browser/bookmarks/store.spec.ts` (T3–T5)
- `tests/browser/quran/show.spec.ts` (T1–T2, added as a new group)
- `tests/browser/bookmarks/update.spec.ts` (T6–T10)
- `tests/browser/bookmarks/destroy.spec.ts` (T11–T13)
- `tests/browser/bookmarks/index.spec.ts` (T20–T29)
- `tests/browser/auth/session.spec.ts` (T14–T18, added as a new group)
- `tests/browser/auth/signup.spec.ts` (T19, added as a new group)
- `tests/unit/validators/bookmark.spec.ts` (T30)

1. T3 [browser] — bookmarks an ayah and asks for an optional note
2. T4 [browser] — keeps the bookmark without a note when the note request is dismissed
3. T5 [browser] — keeps one bookmark when the ayah was already bookmarked in another tab
4. T1 [browser] — offers a bookmark action on every ayah to a signed-out reader
5. T2 [browser] — marks the ayahs the signed-in reader has bookmarked
6. T6 [browser] — saves a note written in the note dialog
7. T7 [browser] — changes an existing note through "Edit note"
8. T8 [browser] — rejects a note longer than 500 characters and keeps the bookmark
9. T9 [browser] — stores "{label}" as no note
10. T10 [browser] — rejects saving a note on a bookmark removed in another tab
11. T11 [browser] — removes a bookmark without a note at once
12. T12 [browser] — asks before removing a bookmark that has a note, then removes it
13. T13 [browser] — keeps the bookmark and its note when removal is declined
14. T20 [browser] — opens the bookmarks list from the signed-in navigation
15. T21 [browser] — opens the bookmarks list from the surah list
16. T22 [browser] — shows each bookmark's reference, surah name, ayah text and note
17. T23 [browser] — lists the most recently bookmarked first
18. T24 [browser] — opens the surah at the ayah when an entry is chosen
19. T25 [browser] — edits a note from the list
20. T26 [browser] — removes a bookmark from the list
21. T27 [browser] — tells a reader with no bookmarks they haven't bookmarked any ayahs and offers the Quran
22. T28 [browser] — still shows references and notes when the Quran text can't be loaded
23. T29 [browser] — never shows another reader's bookmarks
24. T14 [browser] — sends a signed-out reader who bookmarks an ayah to sign in
25. T15 [browser] — signing in completes the carried bookmark and asks for a note
26. T16 [browser] — shows the existing note when the carried ayah was already bookmarked
27. T17 [browser] — bookmarks nothing when the reader leaves sign-in and signs in later
28. T18 [browser] — returns a signed-out reader to the bookmarks list after signing in
29. T19 [browser] — signing up from a carried bookmark completes it and asks for a note
30. T30 [unit] — accepts the last ayah of surah {surah} and rejects the one after it

## Per-test contracts

Reads: testing.md

**Shared conventions** (they apply to every browser test below and are restated only where a test differs):

- Every browser spec group truncates with `group.each.setup(() => testUtils.db().truncate())`.
- "Reader" means `User.create({ fullName: 'Ada Lovelace', email: 'ada@example.com', password: 'secret-password' })`.
- "Bookmark X:Y [note N]" means `reader.related('bookmarks').create({ surahNumber: X, ayahNumber: Y, note: N ?? null })`.
- Locators:
  - Ayah action, signed out: `getByRole('link', { name: 'Bookmark X:Y', exact: true })`.
  - Ayah action, signed in and not bookmarked: `getByRole('button', { name: 'Bookmark X:Y', exact: true })`.
  - Ayah action, bookmarked: `getByRole('button', { name: 'Bookmarked X:Y', exact: true })`.
  - Menu items: `getByRole('menuitem', { name: 'Edit note' | 'Remove', exact: true })`.
  - Note dialog: `getByRole('dialog', { name: 'Note on X:Y', exact: true })`, with field `getByLabel('Note', { exact: true })` and buttons "Save" and "Not now".
  - Remove confirmation: `getByRole('alertdialog')`, with buttons "Remove" and "Keep".
  - Bookmarks list: `getByRole('list', { name: 'Bookmarks', exact: true })`.
- Text is asserted through `page.assertVisible(page.getByText('…', { exact: true }))`, and rows through `db.assertHas`, `db.assertMissing` and `db.assertCount`.

### Test 1 — offers a bookmark action on every ayah to a signed-out reader

- **Surface:** SurahsController.show
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: `swap(QuranTextService, new FakeQuranTextService())`
  - Auth: none
  - Other: none
- **Action:** `visit(route('surahs.show', { number: 1 }))`.
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the links "Bookmark 1:1" through "Bookmark 1:7" are each visible. There's no button whose name starts with "Bookmarked 1:" (`assertNotExists` for each of 1:1–1:7).
  - DB / fake / exception assertions: none
- **Does NOT assert:** where the link points (T14 covers it), or the existing ayah text rendering.
- **Why:** Views: signed-out readers see the same action on every ayah, with nothing marked.

### Test 2 — marks the ayahs the signed-in reader has bookmarked

- **Surface:** SurahsController.show
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmarks on 1:2 and 1:5
  - Fakes: fake text service
  - Auth: `browserContext.loginAs(reader)` before the first visit
  - Other: none
- **Action:** visit `surahs.show` with number 1.
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: buttons "Bookmarked 1:2" and "Bookmarked 1:5" are visible. Buttons "Bookmark 1:1", "Bookmark 1:3", "Bookmark 1:4", "Bookmark 1:6" and "Bookmark 1:7" are visible.
  - DB / fake / exception assertions: none
- **Does NOT assert:** menu contents, or the note dialog.
- **Why:** Controllers: `Surahs.show` passes the reader's bookmarks for the surah.

### Test 3 — bookmarks an ayah and asks for an optional note

- **Surface:** BookmarksController.store
- **Suite:** browser
- **Setup:**
  - Factories: Reader, no bookmarks
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1`, then click the button "Bookmark 1:3".
- **Outcome contract:**
  - Post-action URL: `/quran/1` (`assertPath`)
  - Rendered DOM: the dialog "Note on 1:3" is visible
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null }, 1)`
- **Does NOT assert:** the `?note=3` query string (an implementation detail of how the dialog opens), or scroll position.
- **Why:** Controllers: `Bookmarks.store` keeps the bookmark and redirects with `note`, which opens the prompt.

### Test 4 — keeps the bookmark without a note when the note request is dismissed

- **Surface:** BookmarksController.store
- **Suite:** browser
- **Setup:** as Test 3.
- **Action:** visit `/quran/1`, click "Bookmark 1:3", then click "Not now" inside the dialog "Note on 1:3".
- **Outcome contract:**
  - Post-action URL: unchanged (`/quran/1`)
  - Rendered DOM: the dialog "Note on 1:3" isn't visible, and the button "Bookmarked 1:3" is visible
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null }, 1)`
- **Does NOT assert:** any toast.
- **Why:** Brief step 2: dismissing keeps the bookmark, with no note.

### Test 5 — keeps one bookmark when the ayah was already bookmarked in another tab

- **Surface:** BookmarksController.store
- **Suite:** browser
- **Setup:**
  - Factories: Reader, no bookmarks
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1` and wait until the button "Bookmark 1:3" is visible. Then insert a bookmark on 1:3 for the reader directly (another tab), and click "Bookmark 1:3" on the stale page.
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the dialog "Note on 1:3" is visible
  - DB / fake / exception assertions: `db.assertCount('bookmarks', 1)`, plus `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 }, 1)`
- **Does NOT assert:** `created_at` of the row.
- **Why:** Business rule: `keepBookmark` returns the existing row, and the unique index holds.

### Test 6 — saves a note written in the note dialog

- **Surface:** BookmarksController.update
- **Suite:** browser
- **Setup:** as Test 3.
- **Action:** visit `/quran/1` and click "Bookmark 1:3". In the dialog "Note on 1:3", fill "Note" with "Remember this", then click "Save".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the toast text "Note saved" is visible, and the dialog "Note on 1:3" isn't visible
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'Remember this' }, 1)`
- **Does NOT assert:** that the prompt stays closed after a reload.
- **Why:** Controllers: `Bookmarks.update` merges the note, flashes "Note saved" and redirects back.

### Test 7 — changes an existing note through "Edit note"

- **Surface:** BookmarksController.update
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 1:3 with note "Old"
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1`, click "Bookmarked 1:3", then the menu item "Edit note". In the dialog, replace "Note" with "New" (fill), then click "Save".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: before the fill, the input value of `getByLabel('Note', { exact: true })` equals "Old" (`assert.equal` on `inputValue()`). After "Save", the toast "Note saved" is visible.
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'New' }, 1)`
- **Does NOT assert:** the menu's other items.
- **Why:** Brief step 4: add or change the note from the ayah.

### Test 8 — rejects a note longer than 500 characters and keeps the bookmark

- **Surface:** BookmarksController.update
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 1:3, no note
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1`, then open "Bookmarked 1:3" and "Edit note". Fill "Note" with 501 "a" characters, then click "Save".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the text "Notes can be at most 500 characters." is visible inside the dialog "Note on 1:3"
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null }, 1)`
- **Does NOT assert:** that the dialog keeps the typed text, or that no toast appears.
- **Why:** Validation: `note.maxLength` with the brief's exact copy.

### Test 9 — stores "{label}" as no note

- **Surface:** BookmarksController.update
- **Suite:** browser, parameterized with `.with([{ label: 'an empty note', value: '' }, { label: 'a whitespace-only note', value: '   ' }])`
- **Setup:**
  - Factories: Reader; bookmark on 1:3 with note "Old"
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1`, then open "Bookmarked 1:3" and "Edit note". Fill "Note" with `value`, then click "Save".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the toast "Note saved" is visible
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null }, 1)`
- **Does NOT assert:** how the list renders a missing note.
- **Why:** Validation: the trim and the empty-to-null transform; blank means no note.

### Test 10 — rejects saving a note on a bookmark removed in another tab

- **Surface:** BookmarksController.update
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 1:3, no note (keep the instance)
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1`, open "Bookmarked 1:3", then "Edit note". Delete the bookmark directly (`bookmark.delete()`, as if from another tab). Fill "Note" with "Late", then click "Save".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the text "This bookmark was removed. Bookmark the ayah again to add a note." is visible
  - DB / fake / exception assertions: `db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 })`
- **Does NOT assert:** the state of the ayah's action after the redirect.
- **Why:** Controllers: a null scoped lookup in `update` flashes the removed error and creates nothing.

### Test 11 — removes a bookmark without a note at once

- **Surface:** BookmarksController.destroy
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 1:3, no note
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1`, click "Bookmarked 1:3", then the menu item "Remove".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the button "Bookmark 1:3" is visible, and the toast "Bookmark removed" is visible. `assertNotExists(page.getByRole('alertdialog'))`.
  - DB / fake / exception assertions: `db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 })`
- **Does NOT assert:** the effect on other ayahs.
- **Why:** Views: `useRemoveBookmark` deletes at once when `note` is null.

### Test 12 — asks before removing a bookmark that has a note, then removes it

- **Surface:** BookmarksController.destroy
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 1:3 with note "Keep me"
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/quran/1`, then click "Bookmarked 1:3" and the menu item "Remove". Inside the `alertdialog`, click "Remove".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: before confirming, the text "Remove bookmark 1:3? Your note will be lost." is visible. After confirming, the button "Bookmark 1:3" is visible.
  - DB / fake / exception assertions: `db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3 })`
- **Does NOT assert:** the toast (T11 covers it).
- **Why:** Brief step 5: confirm only when the note would be lost.

### Test 13 — keeps the bookmark and its note when removal is declined

- **Surface:** BookmarksController.destroy
- **Suite:** browser
- **Setup:** as Test 12.
- **Action:** visit `/quran/1`, then click "Bookmarked 1:3" and "Remove". Inside the `alertdialog`, click "Keep".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the `alertdialog` isn't visible, and the button "Bookmarked 1:3" is visible
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'Keep me' }, 1)`
- **Does NOT assert:** the absence of a toast.
- **Why:** Brief step 5: declining changes nothing.

### Test 14 — sends a signed-out reader who bookmarks an ayah to sign in

- **Surface:** SessionController.create
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: fake text service
  - Auth: none
  - Other: none
- **Action:** visit `/quran/1`, then click the link "Bookmark 1:3".
- **Outcome contract:**
  - Post-action URL: `/login` (`assertPath(route('session.create'))`), with `assertQueryString({ bookmark: { surah: '1', ayah: '3' } })` (the helper parses `?bookmark[surah]=1&bookmark[ayah]=3` into nested objects)
  - Rendered DOM: the text "Sign in to bookmark 1:3" is visible
  - DB / fake / exception assertions: none
- **Does NOT assert:** the signup link's href (T19 covers it).
- **Why:** Controllers: `Session.create` passes the carried bookmark to the login page.

### Test 15 — signing in completes the carried bookmark and asks for a note

- **Surface:** SessionController.store
- **Suite:** browser
- **Setup:**
  - Factories: Reader (signed out)
  - Fakes: fake text service
  - Auth: none
  - Other: none
- **Action:** visit `/quran/1`, then click the link "Bookmark 1:3". On `/login`, fill "Email" with `ada@example.com` and "Password" with `secret-password`, then click "Sign in".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the dialog "Note on 1:3" is visible
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: null }, 1)`
- **Does NOT assert:** that the intended URL was cleared (unobservable here).
- **Why:** Controllers: `Session.store` calls `keepBookmark` and redirects to `surahs.show` with `note`.

### Test 16 — shows the existing note when the carried ayah was already bookmarked

- **Surface:** SessionController.store
- **Suite:** browser
- **Setup:**
  - Factories: Reader (signed out); bookmark on 1:3 with note "Earlier thought"
  - Fakes: fake text service
  - Auth: none
  - Other: none
- **Action:** same as Test 15.
- **Outcome contract:**
  - Post-action URL: not asserted (Test 15 covers it)
  - Rendered DOM: the dialog "Note on 1:3" is visible, and the input value of its "Note" field equals "Earlier thought" (`assert.equal`)
  - DB / fake / exception assertions: `db.assertCount('bookmarks', 1)`, plus `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 1, ayah_number: 3, note: 'Earlier thought' }, 1)`
- **Does NOT assert:** the path.
- **Why:** Brief step 3: stays one bookmark and shows its existing note to edit.

### Test 17 — bookmarks nothing when the reader leaves sign-in and signs in later

- **Surface:** SessionController.store
- **Suite:** browser
- **Setup:**
  - Factories: Reader (signed out)
  - Fakes: fake text service
  - Auth: none
  - Other: none
- **Action:**
  - visit `/quran/1` and click the link "Bookmark 1:3", then wait for `/login`.
  - visit `route('home')`.
  - Click "Sign in" in the "Main navigation".
  - Fill in the credentials and click "Sign in".
- **Outcome contract:**
  - Post-action URL: `/dashboard`
  - Rendered DOM: none beyond the path
  - DB / fake / exception assertions: `db.assertEmpty('bookmarks')`
- **Does NOT assert:** dashboard content.
- **Why:** Brief step 3: abandoning sign-in bookmarks nothing; the carry is per-URL, not per-session.

### Test 18 — returns a signed-out reader to the bookmarks list after signing in

- **Surface:** SessionController.store (`toIntended`) together with the intended URL the framework's auth redirect records
- **Suite:** browser
- **Setup:**
  - Factories: Reader (signed out)
  - Fakes: fake text service
  - Auth: none
  - Other: none
- **Action:** visit `route('bookmarks.index')` and wait for `/login`. Then fill in the credentials and click "Sign in".
- **Outcome contract:**
  - Post-action URL: `/bookmarks`
  - Rendered DOM: the heading "Bookmarks" (level 1) is visible
  - DB / fake / exception assertions: none
- **Does NOT assert:** the list contents.
- **Why:** Controllers: the auth failure redirect (`withIntendedUrl()`) records the GET intended URL, and `Session.store` uses `toIntended`.

### Test 19 — signing up from a carried bookmark completes it and asks for a note

- **Surface:** NewAccountController.store
- **Suite:** browser
- **Setup:**
  - Factories: none
  - Fakes: fake text service
  - Auth: none
  - Other: none
- **Action:**
  - visit `/quran/1`, then click the link "Bookmark 1:3".
  - On `/login`, click the link "Create an account".
  - Fill "Full name" with "Grace Hopper", "Email" with `grace@example.com`, and both "Password" and "Confirm password" with `secret-password`.
  - Click "Create account".
- **Outcome contract:**
  - Post-action URL: `/quran/1`
  - Rendered DOM: the dialog "Note on 1:3" is visible
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { surah_number: 1, ayah_number: 3, note: null }, 1)`, plus `db.assertHas('users', { email: 'grace@example.com' }, 1)`
- **Does NOT assert:** the intermediate signup URL's query string.
- **Why:** Brief decisions: signing up completes the pending bookmark exactly like signing in.

### Test 20 — opens the bookmarks list from the signed-in navigation

- **Surface:** BookmarksController.index
- **Suite:** browser
- **Setup:**
  - Factories: Reader
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `route('dashboard')`, then click the link "Bookmarks" in the "Main navigation".
- **Outcome contract:**
  - Post-action URL: `/bookmarks`
  - Rendered DOM: the heading "Bookmarks" (level 1) is visible
  - DB / fake / exception assertions: none
- **Does NOT assert:** the nav item's selected state.
- **Why:** Views: the "Bookmarks" entry in the `AppLayout` nav.

### Test 21 — opens the bookmarks list from the surah list

- **Surface:** BookmarksController.index
- **Suite:** browser
- **Setup:** as Test 20.
- **Action:** visit `route('surahs.index')`, then click the link "Your bookmarks".
- **Outcome contract:**
  - Post-action URL: `/bookmarks`
  - Rendered DOM: the heading "Bookmarks" (level 1) is visible
  - DB / fake / exception assertions: none
- **Does NOT assert:** that the link is hidden from signed-out readers.
- **Why:** Views: `quran/index` shows "Your bookmarks" to signed-in readers.

### Test 22 — shows each bookmark's reference, surah name, ayah text and note

- **Surface:** BookmarksController.index
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 2:255 with note "Ayat al-Kursi"
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `route('bookmarks.index')`.
- **Outcome contract:**
  - Post-action URL: `/bookmarks`
  - Rendered DOM: within the list "Bookmarks", the texts "2:255 · Al-Baqara", "آية 255", "Ayah 2:255" and "Ayat al-Kursi" are each visible (exact)
  - DB / fake / exception assertions: none
- **Does NOT assert:** layout or text direction.
- **Why:** Response layer: the `forList` `title` and `text`, with the note passed through.

### Test 23 — lists the most recently bookmarked first

- **Surface:** BookmarksController.index
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmarks on 1:1 (`createdAt` = now − 2 days), 2:255 (now − 1 day) and 1:7 (now)
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `route('bookmarks.index')`.
- **Outcome contract:**
  - Post-action URL: `/bookmarks`
  - Rendered DOM: the `listitem`s of the list "Bookmarks", read in order, have titles starting "1:7", "2:255", "1:1". Assert by reading each item's title link text in order (`allTextContents` on `getByRole('listitem')`, then `assert.deepEqual` on the reference prefixes).
  - DB / fake / exception assertions: none
- **Does NOT assert:** ties on equal timestamps.
- **Why:** Models: the `newestFirst` scope.

### Test 24 — opens the surah at the ayah when an entry is chosen

- **Surface:** BookmarksController.index
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 2:255
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/bookmarks`, then click the link "2:255 · Al-Baqara".
- **Outcome contract:**
  - Post-action URL: `/quran/2`, with `assertUrlContains('#ayah-255')`
  - Rendered DOM: the heading "Al-Baqara" is visible
  - DB / fake / exception assertions: none
- **Does NOT assert:** the scroll position.
- **Why:** Views: the `BookmarkListItem` link to `surahs.show` with `#ayah-<n>`.

### Test 25 — edits a note from the list

- **Surface:** BookmarksController.index (using update through the shared dialog)
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 2:255 with note "Ayat al-Kursi"
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/bookmarks`, click "Bookmarked 2:255", then "Edit note". In the dialog "Note on 2:255", fill "Note" with "Updated", then click "Save".
- **Outcome contract:**
  - Post-action URL: `/bookmarks`
  - Rendered DOM: the text "Updated" is visible within the list "Bookmarks"
  - DB / fake / exception assertions: `db.assertHas('bookmarks', { user_id: reader.id, surah_number: 2, ayah_number: 255, note: 'Updated' }, 1)`
- **Does NOT assert:** the toast (T6 covers it).
- **Why:** Brief step 7: notes are editable from the list.

### Test 26 — removes a bookmark from the list

- **Surface:** BookmarksController.index (using destroy)
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmarks on 2:255 (no note) and 1:1 (no note)
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/bookmarks`, click "Bookmarked 2:255", then "Remove".
- **Outcome contract:**
  - Post-action URL: `/bookmarks`
  - Rendered DOM: `assertNotExists(getByText('2:255 · Al-Baqara', { exact: true }))`, and the link "1:1 · Al-Faatiha" is still visible
  - DB / fake / exception assertions: `db.assertMissing('bookmarks', { user_id: reader.id, surah_number: 2, ayah_number: 255 })`
- **Does NOT assert:** confirmation behavior (T12 and T13 cover it).
- **Why:** Brief step 5: removal from the list.

### Test 27 — tells a reader with no bookmarks they haven't bookmarked any ayahs and offers the Quran

- **Surface:** BookmarksController.index
- **Suite:** browser
- **Setup:**
  - Factories: Reader, no bookmarks
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/bookmarks`, then click the link "Read the Quran".
- **Outcome contract:**
  - Post-action URL: `/quran`
  - Rendered DOM: before the click, the text "You haven't bookmarked any ayahs yet" is visible
  - DB / fake / exception assertions: none
- **Does NOT assert:** the empty state's icon.
- **Why:** Views: the `BookmarksEmpty` branch.

### Test 28 — still shows references and notes when the Quran text can't be loaded

- **Surface:** BookmarksController.index
- **Suite:** browser
- **Setup:**
  - Factories: Reader; bookmark on 2:255 with note "Ayat al-Kursi"
  - Fakes: `swap(QuranTextService, FakeQuranTextService.unavailable())`
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/bookmarks`.
- **Outcome contract:**
  - Post-action URL: `/bookmarks`. It doesn't render the "Quran text unavailable" page: `assertNotExists(getByRole('heading', { name: 'Quran text unavailable', exact: true }))`.
  - Rendered DOM: the texts "2:255", "Ayat al-Kursi" and "The ayah text couldn't be loaded right now." are visible. `assertNotExists(getByText('2:255 · Al-Baqara', { exact: true }))`.
  - DB / fake / exception assertions: none
- **Does NOT assert:** behavior on a partial outage.
- **Why:** Service design: `readSurahsIfAvailable` turns unavailable into `null`, and the transformer's title falls back.

### Test 29 — never shows another reader's bookmarks

- **Surface:** BookmarksController.index (and SurahsController.show segregation)
- **Suite:** browser
- **Setup:**
  - Factories: Reader; Other (`User.create` with email `other@example.com`), who has a bookmark on 1:5 with note "Not yours"
  - Fakes: fake text service
  - Auth: `loginAs(reader)`
  - Other: none
- **Action:** visit `/bookmarks`, then visit `/quran/1`.
- **Outcome contract:**
  - Post-action URL: `/bookmarks`, then `/quran/1`
  - Rendered DOM:
    - On `/bookmarks`: the text "You haven't bookmarked any ayahs yet" is visible, and `assertNotExists(getByText('Not yours', { exact: true }))`.
    - On `/quran/1`: the button "Bookmark 1:5" is visible, and `assertNotExists` for the button "Bookmarked 1:5".
  - DB / fake / exception assertions: none
- **Does NOT assert:** direct requests to another reader's ids (unreachable through the UI).
- **Why:** Authorization + segregation: every query goes through `user.related('bookmarks')`.

### Test 30 — accepts the last ayah of surah {surah} and rejects the one after it

- **Surface:** createBookmarkValidator (`ayahOfSurah` macro + `SURAH_AYAH_COUNTS`)
- **Suite:** unit, in `tests/unit/validators/bookmark.spec.ts`, parameterized with `.with(rows)`. Each row is `{ surah: number, ayahCount }` from `tests/fixtures/quran/surahs.json`, loaded through a helper under `tests/helpers/quran/` (no top-of-file helpers).
- **Setup:**
  - Factories: none
  - Fakes: none
  - Auth: none
  - Other: no DB
- **Action:** run `createBookmarkValidator.validate(...)` twice per row.
- **Outcome contract:**
  - Post-action URL: n/a
  - Rendered DOM: n/a
  - DB / fake / exception assertions:
    - `await createBookmarkValidator.validate({ surah, ayah: ayahCount })` resolves to `{ surah, ayah: ayahCount }`.
    - `await assert.rejects(() => createBookmarkValidator.validate({ surah, ayah: ayahCount + 1 }))`.
- **Does NOT assert:** message text, or the surah-range rule (it's declarative).
- **Why:** Validation: `ayahOfSurah` against the static count table, a bound no browser test can reach.

## Factories audit

Reads: testing.md

No factories exist (`database/factories/` is absent), and none are added. Following `testing.md` ("keep simple setup simple") and the suite's existing convention, users are made with `User.create({...})` and bookmarks with `user.related('bookmarks').create({ surahNumber, ayahNumber, note, createdAt? })`. A factory would only forward those calls.

| Test            | Factory                                                                    | Existing / New                  |
| --------------- | -------------------------------------------------------------------------- | ------------------------------- |
| T1              | none (signed out)                                                          | —                               |
| T2–T13, T20–T29 | `User.create` inline; bookmarks through `user.related('bookmarks').create` | existing model API (no factory) |
| T14–T18         | `User.create` inline with known credentials                                | existing model API              |
| T19             | none (the user is created by the signup form)                              | —                               |
| T30             | none (validator plus fixture JSON)                                         | —                               |

## Fakes audit

Reads: testing.md

| Test                 | Fake / swap                                                                                                                                                      | Binding + file                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| T1–T16, T19–T27, T29 | `swap(QuranTextService, new FakeQuranTextService())`                                                                                                             | `QuranTextService` → `tests/helpers/quran/fake_quran_text_service.ts` (existing) |
| T28                  | `swap(QuranTextService, FakeQuranTextService.unavailable())`                                                                                                     | same file, existing `.unavailable()`                                             |
| T17, T18             | none needed (the dashboard reads no text; `/bookmarks` with no rows calls no text). T18 swaps the existing fake anyway, so a later change can't hit the network. | —                                                                                |
| T30                  | none                                                                                                                                                             | —                                                                                |

**Boundary justification:** `QuranTextService` wraps outbound HTTP to alquran.cloud, so swapping it fakes external IO, not app logic. `readSurahsIfAvailable` stays real: the fake inherits it and only overrides `readSurah` and `listSurahs`, so T22 and T28 exercise the real new method.

## Order rationale

- **`Bookmarks.store` goes first.** It builds the thinnest slice end to end: migration, model, `keepBookmark`, the route, the bookmark button and the note dialog shell. `Surahs.show`'s "marked" state (T2) then has a real write path behind it. T1 doesn't depend on it, but it lands in the same build pass.
- **`Bookmarks.index` comes before the sign-in surfaces.** T18 ends on the bookmarks list.
- **The validator unit test comes last.** `ayahOfSurah` is already exercised indirectly by every store from T3 onward; T30 then locks every surah's bound.

## Runner-model risks

Reads: testing.md

No runner-model violations. Two points need care, and each has a mitigation:

1. **T23 sets `createdAt` explicitly on rows whose `created_at` uses `autoCreate`.** If Lucid overwrites a provided value on insert, the order assertion would compare equal timestamps. Mitigation: if the build finds the value overwritten, it sets `createdAt` with `bookmark.merge({ createdAt }).save()` after the create. That stays inside the test and is reset by truncate.
2. **T5 and T10 write to the DB in the middle of a test** to stand in for another tab. That's safe here: the state belongs to the test, and the per-test `truncate()` in `group.each.setup` resets it. No container or module state is touched.

Checked and clear:

- Swaps use `swap(...)`, which restores automatically.
- No test uses another test's data.
- Waits are `page.assert*` condition waits; nothing uses fixed sleeps.
- `loginAs` always runs before the first `visit`.
- T30 runs in the existing `unit` suite (`tests/unit/**`, 2000 ms timeout). Each dataset row is its own test, needs no DB, and depends only on the `start/validator.ts` preload, which boots with the app.

## Open questions

_Resolved 2026-11-13:_

- The bookmarks page renders `Heading level={1}` "Bookmarks" (T18, T20, T21 locate it as `getByRole('heading', { name: 'Bookmarks', level: 1 })`).
- The note dialog's `TextArea` has the visible label "Note" (T6–T10, T16, T25 locate it as `getByLabel('Note', { exact: true })`).

---
