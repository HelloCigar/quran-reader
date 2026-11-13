---
affects: [ayah-bookmarks]
briefed: 2026-11-13
---

# Ayah Bookmarks — Brief

## Entry point, user goal, status

A reader is reading a surah and wants to keep an ayah to come back to, optionally with a short personal note. Later they want to see everything they kept in one place and jump back to any of it.

Status: new capability, an extension of the public Quran reader.

## Prerequisites

- The Quran reader: the surah list and the surah reading view, where every ayah shows its "<surah>:<ayah>" reference.
- Accounts: sign-up and sign-in already exist. Bookmarks belong to a signed-in reader's account.

## The journey, step by step

1. **Reading a surah.** Every ayah offers a bookmark action. For a signed-in reader, ayahs they have already bookmarked are visibly marked as bookmarked. Signed-out readers see the same bookmark action on every ayah, with nothing marked.

2. **Bookmarking an ayah (signed in).** The reader bookmarks an ayah. It is saved at once and shows as bookmarked. The reader is then asked for an optional note.
   - If they dismiss the request without writing anything, the bookmark stays, with no note.
   - A note is plain text of at most 500 characters. A longer note is rejected with "Notes can be at most 500 characters." and the bookmark itself is kept.
   - A note made only of spaces counts as no note.
   - If the same ayah is bookmarked again, from another tab or device, it stays one bookmark.

3. **Bookmarking an ayah (signed out).** The reader bookmarks an ayah and is asked to sign in, or to sign up if they have no account.
   - After signing in or signing up, they return to the same ayah. It is now bookmarked, and they are asked for an optional note, exactly as in step 2.
   - If that ayah was already bookmarked on their account, it stays one bookmark, and they are shown its existing note to edit.
   - If they abandon signing in, nothing is bookmarked.

4. **Editing a note.** At any time, from the ayah or from the bookmarks list, the reader can add, change, or clear the note on a bookmark. The same rules as step 2 apply.
   - If the bookmark was removed elsewhere in the meantime, for example in another tab, saving the note is rejected with "This bookmark was removed. Bookmark the ayah again to add a note." The removed bookmark is not brought back.

5. **Removing a bookmark.** From the ayah or from the bookmarks list, the reader removes a bookmark.
   - A bookmark with no note is removed at once.
   - A bookmark with a note asks the reader to confirm first, because the note is lost with it. If they decline, nothing changes.
   - Once removed, the ayah no longer shows as bookmarked and the bookmark leaves the list.

6. **Finding the bookmarks list.** A signed-in reader reaches their bookmarks list from the signed-in navigation and from the surah list. A signed-out reader who tries to open it is asked to sign in first, and lands on the list afterwards.

7. **Reading the bookmarks list.** Bookmarks are listed most recently bookmarked first. Each entry shows the reference and surah name ("2:255 · Al-Baqara"), the ayah's Arabic and English, and the note if there is one.
   - Choosing an entry opens that surah at that ayah.
   - The reader can edit notes and remove bookmarks from the list, as in steps 4 and 5.
   - With no bookmarks, the list says they haven't bookmarked any ayahs yet and offers a way to the Quran.
   - If the Quran text can't be loaded right now, the list still shows every bookmark's reference and note, with a short line saying the ayah text couldn't be loaded right now. Bookmarks are never hidden because the text is unavailable.

## Research

1. One bookmark action on each ayah saves it to a default Favorites list, with collections as an optional extra layer — Quran.com ([collections update](https://quran.com/product-updates/save-verses-to-collections-organize-your-quran-study), [API docs](https://api-docs.quran.foundation/docs/user_related_apis_versioned/1.0.0/add-collection-bookmark/)).
2. Account-held bookmarks follow the reader across devices; a guest's reading position is kept only on their device — Quran.com ([reading bookmark update](https://explore.quran.com/product-updates/reading-bookmark-easily-track-your-quran-progress)).
3. An automatic "last read" position, for resuming, is a separate concept from bookmarks the reader chooses — iQuran, Read Quran, Quran Foundation ([iQuran](https://apps.apple.com/gb/app/id285944183), [Read Quran](https://mwm.ai/apps/read-quran/1575575260), [reading sessions](https://api-docs.quran.foundation/docs/user-related-apis/reading-sessions-vs-activity-days/)).
4. Mixing the resume position with chosen bookmarks is the most common complaint; readers ask for the two to be kept separate — GTAF Quran app feedback ([Improve Last Read](https://feedback.gtaf.org/quran/p/improve-last-read-bugs-ux-issues), [Mark as last read](https://feedback.gtaf.org/board/p/mark-as-last-read)).

## Decisions made

| Decision                                                                                                              | Rejected alternatives                                                                        | Why                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Only signed-in readers can bookmark                                                                                   | Bookmarks kept on the device for anyone; device bookmarks merged into the account on sign-in | Bookmarks follow the reader to any device; the merge path is complex and no prior art confirmed it (Research 2). |
| A signed-out reader who bookmarks is asked to sign in or sign up, returns to the same ayah, and the bookmark is saved | Return without saving, so they bookmark again; hide the bookmark action when signed out      | The reader's intent survives signing in, and the action is discoverable to everyone.                             |
| Signing up completes the pending bookmark just like signing in                                                        | Sign-up ends as it does today and the pending bookmark is dropped                            | A new reader shouldn't lose the ayah that made them create an account.                                           |
| One flat list of bookmarks, each with an optional note                                                                | No notes; named collections                                                                  | Keeps the app simple; collections remain a later extension (Research 1).                                         |
| The reader is asked for the note right after bookmarking                                                              | Note only added later from the bookmark                                                      | Invites reflection at the moment of reading.                                                                     |
| Dismissing the note request keeps the bookmark                                                                        | Dismissing cancels the bookmark                                                              | The bookmark action is what saves the ayah; the note is only an extra.                                           |
| After a signed-out bookmark completes, the reader is asked for a note too                                             | No note request after signing in                                                             | Same experience whether or not they were signed in.                                                              |
| Notes are at most 500 characters of plain text                                                                        | 280 characters; 2,000 characters                                                             | Room for a few sentences of reflection, still a note rather than a journal.                                      |
| Removing asks for confirmation only when the bookmark has a note                                                      | Always remove at once; always confirm                                                        | Only the note is lost by accident; a bare bookmark is one action to restore.                                     |
| Bookmarks list ordered most recently bookmarked first                                                                 | Quran order                                                                                  | Matches "come back to this later".                                                                               |
| The bookmarks list is its own destination, reached from the signed-in navigation and the surah list                   | Shown on the dashboard                                                                       | Easy to find from both reading and the account.                                                                  |
| Each list entry shows reference, surah name, full Arabic and English, and the note                                    | Reference, surah name and note only                                                          | The list is useful on its own, without opening each ayah.                                                        |
| Notes can be edited and bookmarks removed from the list as well as from the ayah                                      | Read-only list                                                                               | Managing bookmarks shouldn't require opening each surah.                                                         |
| When the Quran text is unavailable, the list still shows references and notes                                         | Show the "Quran text unavailable" message instead of the list                                | Bookmarks and notes are the reader's own data and don't depend on the text source.                               |
| Saving a note on a bookmark removed elsewhere is rejected                                                             | Saving the note brings the bookmark back                                                     | A removal is never silently undone.                                                                              |
| No automatic "last read" position in this change                                                                      | Combine a resume position with bookmarks                                                     | They are different concepts, and mixing them is the top complaint about Quran apps (Research 3, 4).              |

## Constraints the journey places on implementation

- A bookmark belongs to exactly one reader, and no other reader can see or change it.
- A reader has at most one bookmark per ayah. Bookmarking an already-bookmarked ayah never creates a second one.
- A bookmark identifies an ayah by surah and ayah number, for any of the 6,236 ayahs (surah 1–114, ayah within that surah's count). Anything else is rejected.
- Notes are plain text of at most 500 characters. Longer notes are rejected with exactly "Notes can be at most 500 characters." A note of only spaces is stored as no note.
- Saving a note on a bookmark that no longer exists is rejected with exactly "This bookmark was removed. Bookmark the ayah again to add a note." and does not recreate the bookmark.
- A bookmark with a note is only removed after the reader confirms.
- A signed-out reader's bookmark request survives signing in or signing up: afterwards they return to the same ayah, bookmarked, and are asked for a note.
- The bookmarks list orders bookmarks most recently bookmarked first.
- The bookmarks list never depends on the Quran text source being available: references and notes always show, and a missing ayah text says it couldn't be loaded right now.
- The Quran reader stays public. Signed-out readers can still read every surah; only bookmarking asks them to sign in.
