---
capability: ayah-bookmarks
change: ayah-bookmarks
---

# Delta — ayah-bookmarks

## ADDED

### Bookmark action on every ayah

- Given a signed-in reader opens a surah, then every ayah offers a bookmark action, and the ayahs they have bookmarked show as bookmarked.
- Given a signed-out reader opens a surah, then every ayah offers the same bookmark action and none shows as bookmarked.

### Bookmarking an ayah

- Given a signed-in reader on an ayah they haven't bookmarked, when they bookmark it, then it is saved at once, shows as bookmarked, and they are asked for an optional note.
- Given the reader is asked for a note, when they dismiss the request without writing anything, then the bookmark stays, with no note.
- Given an ayah the reader has already bookmarked, when it is bookmarked again from another tab or device, then it stays a single bookmark.

### Bookmarking while signed out

- Given a signed-out reader on an ayah, when they bookmark it, then they are asked to sign in, or to sign up if they have no account.
- Given that reader signs in or signs up, then they return to the same ayah, it shows as bookmarked, and they are asked for an optional note.
- Given that ayah was already bookmarked on their account, when they sign in, then it stays a single bookmark and they are shown its existing note to edit.
- Given that reader abandons signing in, then nothing is bookmarked.

### Notes on a bookmark

- Given a bookmark, when the reader adds, changes, or clears its note, from the ayah or from the bookmarks list, then the note is saved.
- Given a note longer than 500 characters, when the reader saves it, then it is rejected with "Notes can be at most 500 characters." and the bookmark is kept.
- Given a note made only of spaces, when the reader saves it, then the bookmark has no note.
- Given the bookmark was removed elsewhere, when the reader saves a note on it, then it is rejected with "This bookmark was removed. Bookmark the ayah again to add a note." and the bookmark is not recreated.

### Removing a bookmark

- Given a bookmark with no note, when the reader removes it, from the ayah or from the bookmarks list, then it is removed at once.
- Given a bookmark with a note, when the reader removes it, then they are asked to confirm because the note will be lost; it is removed only if they confirm.
- Given a bookmark has been removed, then the ayah no longer shows as bookmarked and the bookmark is gone from the list.

### Reaching the bookmarks list

- Given a signed-in reader, then they can reach their bookmarks list from the signed-in navigation and from the surah list.
- Given a signed-out reader, when they try to open the bookmarks list, then they are asked to sign in and land on the list afterwards.

### Bookmarks list

- Given a reader with bookmarks, when they open the list, then bookmarks appear most recently bookmarked first, each showing the reference and surah name (e.g. "2:255 · Al-Baqara"), the ayah's Arabic and English, and its note if it has one.
- Given the list, when the reader chooses an entry, then that surah opens at that ayah.
- Given a reader with no bookmarks, when they open the list, then they are told they haven't bookmarked any ayahs yet and offered a way to the Quran.

### Bookmarks list when the Quran text is unavailable

- Given the Quran text can't be loaded right now, when the reader opens the bookmarks list, then every bookmark's reference and note still show, with a short line saying the ayah text couldn't be loaded right now.

### Bookmarks are private

- Given a reader's bookmarks, then no other reader can see or change them.

## MODIFIED

_None._

## REMOVED

_None._
