---
planned: 2026-11-13
built: 2026-11-13
---

# Ayah Bookmarks — Implementation Plan

> Task type: extension
> Stack: AdonisJS + Inertia React
> Database: SQLite

## Summary

Signed-in readers bookmark any ayah from the surah reading view, attach an optional note of up to 500 characters, and manage their bookmarks from a new `/bookmarks` list. A signed-out reader's bookmark survives sign-in or sign-up. The list keeps showing references and notes when the Quran text is unavailable.

## Pre-implementation requirements

- Authorization stack (`@adonisjs/bouncer` + `@adonisplus/permissions`, owners of the policy / permission-key path in `authorization.md`) — **explicitly declined**. User's reason: "Bookmarks have no assignable permissions; privacy is per-owner and enforced by relationship scoping." Ownership is enforced by query segregation through `user.related('bookmarks')` (see Authorization + segregation).

## Out of scope

- Pagination of the bookmarks list — the list is unpaginated for now; add pagination as its own change if lists grow long.

## Current shape

- Quran text is not in the database. `QuranTextService` (`app/services/quran_text_service.ts`) reads alquran.cloud through a 30-day cache with grace and returns plain `SurahSummary` / `Surah` / `Ayah` shapes from `types/quran.ts`. Any failure raises `QuranUnavailableException` (self-handled 503 page `errors/quran_unavailable`).
- Per-surah ayah counts are only available through `listSurahs()`, which depends on the upstream.
- Auth: one session guard `web`. `auth_middleware` redirects to `/login`; on that failure `@adonisjs/auth` already records the intended URL via `redirect().withIntendedUrl()` (navigational GET, routed requests only). `SessionController.store` and `NewAccountController.store` hard-redirect to `dashboard`. Login and signup sit behind `guest` middleware. `silent_auth_middleware` runs on every routed request.
- `quran/index` and `quran/show` render inside `MarketingLayout` for everyone. The signed-in `AppLayout` nav has only Dashboard.
- Shared Inertia props: `errors`, `user`, `preferences`. Flash carries `success` / `error` only.
- `AyahItem` has no DOM anchor.
- `useRouteForm` cannot fill route params (it calls `urlFor(route)` without params).
- No authorization package is installed.
- `tests/helpers/quran/fake_quran_text_service.ts` already swaps the text source in tests.

## Target shape

A new `bookmarks` table holds one row per (reader, surah, ayah), with an optional trimmed note. Ayah ranges are checked against a static table of the 114 ayah counts, never against the upstream text.

On the surah page every ayah has a bookmark action:

- Signed out: a link to `/login?bookmark[surah]=S&bookmark[ayah]=A`.
- Signed in, not bookmarked: a "Bookmark" button.
- Bookmarked: a marked menu with "Edit note" and "Remove". Remove asks for confirmation only when there is a note.

After any bookmark is saved, including one completed by `SessionController.store` or `NewAccountController.store` from the carried `bookmark` field, the reader is redirected to `/quran/S?note=A`. The surah page then opens the note dialog for that ayah and scrolls to it. Without a carried bookmark, sign-in and sign-up redirect with `toIntended('dashboard')`. The framework's auth failure redirect already records the intended URL for GET requests, so a signed-out reader opening `/bookmarks` lands back on the list.

`/bookmarks` renders in `AppLayout` with a "Bookmarks" nav item. It lists bookmarks newest first, with reference, surah name, Arabic, English and note. When a surah's text is unavailable, that entry still shows its reference and note, plus a line saying the text couldn't be loaded right now. `quran/index` links to the list for signed-in readers.

## Invariants

_n/a (task type: extension)_

## Blast radius

_n/a (task type: extension)_

## Migration path

_n/a (task type: extension)_

## Rollback

_n/a (task type: extension)_

## Logical schema

Reads: models.md, model-relationships.md, migrations.md, schema-rules.md

```dbml
Table users {
  id integer [pk]
  // unchanged
}

Table bookmarks {
  id integer [pk, increment]
  user_id integer [not null, ref: > users.id] // onDelete: CASCADE
  surah_number integer [not null] // check between 1 and 114
  ayah_number integer [not null]  // check >= 1; per-surah upper bound is app-layer
  note text [null]                // null = no note; never an empty or blank string
  created_at timestamp [not null]
  updated_at timestamp [null]

  indexes {
    (user_id, surah_number, ayah_number) [unique, name: 'bookmarks_user_ayah_unique']
  }
}
```

- **One bookmark per ayah per reader** is enforced by the database through the unique index. Bookmarking again from another tab hits the existing row and never creates a second one.
- **Ayah range:**
  - The database check covers only `surah_number` 1–114 and `ayah_number ≥ 1`.
  - The per-surah upper bound is checked by the app against the static `SURAH_AYAH_COUNTS` table in `app/values/surah_ayah_counts.ts`, with 114 entries summing to 6,236. The database can't express this bound.
- **Note storage:**
  - Stored trimmed of surrounding whitespace, at most 500 characters.
  - A blank or whitespace-only note is stored as `NULL`, so "has a note" is simply `note IS NOT NULL`.
  - The 500 limit is enforced by the validator, not by a database check, so the exact error message comes from one place.
- **Hard delete:** removing a bookmark deletes the row; there is no soft delete. A removed bookmark is gone, so a later note save finds no row and is rejected. That gives the "removed elsewhere" error without extra state.
- **Sort key:** the list is ordered by `created_at DESC, id DESC`. `id` breaks ties between bookmarks made in the same second. Re-bookmarking an existing ayah doesn't touch `created_at`, so its position in the list doesn't change.
- **No schema rules:** the generator's defaults (`number`, `string | null`, `DateTime`) are correct, so no entries are needed in `schema_rules.ts`.

## Migrations + models

Reads: migrations.md, models.md

`node ace make:migration bookmarks --create=bookmarks`

Migration files, in order:

- `database/migrations/<timestamp>_create_bookmarks_table.ts` creates the `bookmarks` table exactly as in the Logical schema DBML:
  - `user_id` is `.unsigned().references('users.id').onDelete('CASCADE')`.
  - `surah_number` has `.checkBetween([1, 114])` and `ayah_number` has `.checkPositive()`.
  - The composite unique index is named `bookmarks_user_ayah_unique`.
  - `created_at` and `updated_at` are two explicit `timestamp` calls; `timestamps(true, true)` isn't used, per `migrations.md`.

`node ace make:model Bookmark`

Model files:

- `app/models/bookmark.ts` (new): `Bookmark extends BookmarkSchema`.
  - `@belongsTo(() => User) declare user: BelongsTo<typeof User>`
  - `static newestFirst = scope(...)` orders by `created_at desc, id desc`. It's the single source of list order.
- `app/models/user.ts` (modified):
  - `@hasMany(() => Bookmark) declare bookmarks: HasMany<typeof Bookmark>`
  - `keepBookmark(surah: number, ayah: number): Promise<Bookmark>` finds or creates through `this.related('bookmarks')`. If a concurrent insert hits `bookmarks_user_ayah_unique`, it catches that and re-reads the existing row. It never creates a second row and never touches an existing row's `note` or `created_at`.
  - Reads and writes always go through `user.related('bookmarks')`, so the foreign key and ownership filter are never written by hand (`model-relationships.md`).

Values file (not a model; constants belong in `app/values/` per `models.md`):

- `app/values/surah_ayah_counts.ts` (new) exports `SURAH_AYAH_COUNTS` as a `readonly number[]`, with index 0 for surah 1, 114 entries summing to 6,236.
  - It's the only source for ayah-range checks and never depends on `QuranTextService`.

`node ace migration:run` (regenerates `database/schema.ts` with `BookmarkSchema`)

## Service design

Reads: controllers.md, services.md

`QuranTextService` already exists, so it's modified and nothing new is scaffolded.

- `app/services/quran_text_service.ts`, `QuranTextService` (modified):
  - New method `readSurahsIfAvailable(numbers: number[]): Promise<Map<number, Surah | null>>` reads each distinct surah number at most once through the existing `readSurah`, in parallel.
    - `QuranUnavailableException` for one surah becomes `null` for that key. Any other error is rethrown.
    - It goes through the same `#cached` path, so cache hits and grace behave exactly as on the reading page.
    - An empty `numbers` returns an empty `Map` without touching the cache or upstream.
  - Existing `listSurahs` and `readSurah` are unchanged.
  - Does NOT:
    - know about bookmarks, users or notes. Callers pass plain surah numbers and get back text.
    - format references or display strings; that's the transformer's job.
    - take `HttpContext`.
- `tests/helpers/quran/fake_quran_text_service.ts` doesn't need its own version of the method, as long as the fake extends or delegates to `readSurah`. Build should confirm this. If the fake overrides whole methods, it needs a way to make chosen surahs unavailable for the list's "text unavailable" test.

## Validation

Reads: validation.md, vine/types/string.md, vine/types/number.md, vine/types/object.md

### Input validation

`node ace make:validator bookmark`

```ts title="app/validators/bookmark.ts"
import vine from '@vinejs/vine'

/**
 * POST /bookmarks
 */
export const createBookmarkValidator = vine.create({
  surah: vine.number().withoutDecimals().range([1, 114]),
  ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
})

/**
 * PATCH /bookmarks/:id
 * A blank or whitespace-only note becomes null.
 */
export const updateBookmarkValidator = vine.create({
  note: vine
    .string()
    .trim()
    .maxLength(500)
    .transform((value) => (value === '' ? null : value))
    .nullable(),
})

/**
 * GET /login and GET /signup: the bookmark carried in the query string.
 */
export const carriedBookmarkValidator = vine.create({
  bookmark: vine
    .object({
      surah: vine.number().withoutDecimals().range([1, 114]),
      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
    })
    .optional(),
})
```

```diff title="app/validators/user.ts"
 export const signupValidator = vine.create({
   fullName: vine.string().nullable(),
   email: email().unique({ table: 'users', column: 'email' }),
   password: password(),
   passwordConfirmation: password().sameAs('password'),
+  bookmark: vine
+    .object({
+      surah: vine.number().withoutDecimals().range([1, 114]),
+      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
+    })
+    .optional(),
 })

 export const loginValidator = vine.create({
   email: email(),
   password: vine.string(),
+  bookmark: vine
+    .object({
+      surah: vine.number().withoutDecimals().range([1, 114]),
+      ayah: vine.number().withoutDecimals().positive().ayahOfSurah('surah'),
+    })
+    .optional(),
 })
```

`node ace make:validator surah`

```ts title="app/validators/surah.ts"
import vine from '@vinejs/vine'

/**
 * GET /quran/:number. `note` names the ayah whose note prompt opens.
 */
export const showSurahValidator = vine.create({
  note: vine.number().withoutDecimals().positive().optional(),
})
```

```diff title="start/validator.ts"
+// ayahOfSurah(surahField): VineNumber macro built with vine.createRule.
+// It reads field.parent[surahField]. When that is a valid surah number, it checks
+// value <= SURAH_AYAH_COUNTS[surah - 1]. Otherwise it skips, because the surah
+// field reports its own error. Augment VineNumber in '@vinejs/vine' so the macro is typed.
+
+vine.messagesProvider = new SimpleMessagesProvider({
+  'note.maxLength': 'Notes can be at most 500 characters.',
+  ayahOfSurah: 'That ayah is not in this surah.',
+})
```

- **Query string shape.** The bookmark carried through sign-in is the nested object `?bookmark[surah]=2&bookmark[ayah]=255`, which AdonisJS parses with `qs`. That's a change from the literal `?bookmark=2:255` agreed during discovery, because `validation.md` forbids regex-parsing typed data. The behaviour is the same.
- **Duplicated chains.** The bookmark chain is repeated in `bookmark.ts` and `user.ts`. `validation.md` prefers duplicating chains, and allows field factories only across 3+ resources that no validator owns.
- **Custom copy.** The note message is the exact copy the brief requires, so it's an explicit copy request. VineJS defaults cover everything else.
- **Empty strings.** `convertEmptyStringsToNull` is on in `config/bodyparser.ts`, so `""` arrives as `null`. The `.transform` handles `"   "`, which `.trim()` turns into `""`.

### Business rules

- **Bookmarking an already-bookmarked ayah returns the existing row and never creates a second one.**
  - Owner: model method `user.keepBookmark(surah, ayah)`.
  - It finds or creates through `user.related('bookmarks')`. If a concurrent insert hits `bookmarks_user_ayah_unique`, it catches that and re-reads the row.
- **Saving a note on a bookmark that isn't among the reader's bookmarks is rejected.** This covers both a bookmark removed elsewhere and someone else's id.
  - Owner: controller branch in `Bookmarks.update`.
  - It flashes `error` "This bookmark was removed. Bookmark the ayah again to add a note." and redirects back. Nothing is created.
- **Removing a bookmark that's already gone is a no-op** that redirects back. Owner: controller branch in `Bookmarks.destroy`.
- **Confirming before removing a bookmark with a note happens only in the UI.** Owner: view (`use_remove_bookmark`). The server doesn't require a confirmation token; `destroy` always removes.
- **`noteFor` is null when `note` doesn't name one of the reader's bookmarked ayahs in this surah.** That covers signed out, not bookmarked, and out of range. Owner: controller branch in `Surahs.show`.

## Authorization + segregation

Reads: authentication.md, authorization.md

- **Authentication:** every `/bookmarks` route sits behind `middleware.auth()`, which uses the default `web` guard. Actions read the reader with `auth.getUserOrFail()` (`authentication.md`).
- **Authorization:** there are no policies and no permission keys (an explicit opt-out; see Pre-implementation requirements).
- **Query segregation:** every read and write goes through the signed-in reader's relationship, and no query filters `user_id` by hand.
  - `Bookmarks.index` uses `user.related('bookmarks').query().withScopes((s) => s.newestFirst())`.
  - `Bookmarks.update` and `Bookmarks.destroy` use `user.related('bookmarks').query().where('id', params.id).first()`. When that returns null, update shows the "removed" message and destroy does nothing. A foreign id can't be told apart from a removed one.
  - `Bookmarks.store`, `Session.store` and `NewAccount.store` use `user.keepBookmark(surah, ayah)`, which works only through `this.related('bookmarks')`.
  - `Surahs.show` uses `auth.user?.related('bookmarks').query().where('surah_number', number)`. When signed out (`auth.user` is null, from `silent_auth_middleware`) it skips the query and passes `[]`.
- **Shared props:** none are added. The page reads `user` from the shared props it already gets.

## Controllers

Reads: controllers.md, http-context.md, request.md, middleware.md, model-relationships.md, url-builder.md

`node ace make:controller bookmarks`

- `app/controllers/bookmarks_controller.ts` (new).
  - `index`: uses `auth.getUserOrFail()`, `user.related('bookmarks').query().withScopes(newestFirst)`, `QuranTextService.readSurahsIfAvailable`, and `BookmarkTransformer` (`forList` variant). Renders `bookmarks/index`.
    - It passes `readSurahsIfAvailable` the distinct `surahNumber`s from the loaded bookmarks. With no bookmarks that list is empty and nothing upstream is called.
    - The resulting `Map<number, Surah | null>` goes to the transformer as an extra constructor argument, the same way `AyahTransformer` already takes `surahNumber`.
    - Non-default path: the text lookup lives in `QuranTextService`, because that's where "unavailable is a normal outcome" belongs.
  - `store`: uses `createBookmarkValidator`, `auth.getUserOrFail()` and `user.keepBookmark(surah, ayah)`. Redirects with `toRoute('surahs.show', { number: surah }, { qs: { note: ayah } })`.
    - No flash; the note dialog is the feedback.
    - Non-default path: `keepBookmark` is a model method shared by three controllers. It owns the idempotent find-or-create and the unique-race retry.
  - `update`: uses `auth.getUserOrFail()`, `user.related('bookmarks').query().where('id', params.id).first()`, then `updateBookmarkValidator`, `bookmark.merge({ note }).save()`, a `success` flash "Note saved" and a redirect back.
    - **The lookup comes before validation**, so a removed bookmark always gets the removed message, even when the submitted note is too long.
    - On a null lookup it flashes `error` "This bookmark was removed. Bookmark the ayah again to add a note." and redirects back without creating anything.
  - `destroy`: uses `auth.getUserOrFail()` and the same scoped lookup, then `bookmark.delete()`, a `success` flash "Bookmark removed" and a redirect back.
    - On a null lookup it redirects back with no flash: already gone counts as done.
  - DI: method-level `@inject()` on `index` only, for `QuranTextService`. No other action needs it (`controllers.md`).
  - The `:id` route param is cast to a number by a route matcher (Routes); it isn't validated (`request.md`).

- `app/controllers/session_controller.ts` (modified).
  - `create`: uses `carriedBookmarkValidator` on the query and renders `auth/login` with `{ bookmark: payload.bookmark ?? null }`.
  - `store`: uses `loginValidator` (now with `bookmark?`), `User.verifyCredentials` and `auth.use('web').login`, then branches:
    - With `bookmark`: calls `user.keepBookmark(...)` and `session.clearIntendedUrl()`, then `toRoute('surahs.show', { number }, { qs: { note: ayah } })`. Clearing the intended URL keeps a stale one from hijacking a later sign-in.
    - Without it: `response.redirect().toIntended(urlFor('dashboard'))`. `urlFor` is backend `@adonisjs/core/services/url_builder`, because `toIntended` takes a URL string (`session.md`).
    - The bookmark is kept only after `login` succeeds, so failed credentials create nothing.
  - `destroy`: unchanged.

- `app/controllers/new_account_controller.ts` (modified).
  - `create`: like `Session.create`, but renders `auth/signup`.
  - `store`: uses `signupValidator` (now with `bookmark?`), `User.create` and `auth.use('web').login`. After that it branches exactly as `Session.store` does.

- `app/controllers/surahs_controller.ts` (modified).
  - `show`: uses `showSurahValidator` on the query, then the existing `readSurah`/`listSurahs` `Promise.all`.
    - **Bookmarks:** for a signed-in reader (`auth.user` is set by the global `silent_auth_middleware`, no `getUserOrFail` on this public route), `auth.user.related('bookmarks').query().where('surah_number', number)`; for a signed-out reader, `[]`.
    - **`noteFor`:** the validated `note` when it matches one of those bookmarks' `ayahNumber`, otherwise `null`.
    - **New props:** `bookmarks: BookmarkTransformer.transform(bookmarks)` (default variant) and `noteFor`. Existing props are unchanged.
    - The bookmark query runs alongside the text reads. If the text is unavailable, `QuranUnavailableException` still produces the 503 page as it does today; only the list page tolerates missing text.
  - `index`: unchanged. The link to the bookmarks list is decided on the page from the shared `user`.
  - DI: the existing constructor `@inject()` stays.

- `app/middleware/auth_middleware.ts`: unchanged (amended during build). `@adonisjs/auth`'s `AuthenticationException` redirect calls `withIntendedUrl()`, which `@adonisjs/session` limits to navigational, routed **GET** requests, so the intended URL is already recorded and a POST is never replayed.

## Response layer

Reads: transformers.md, response.md, session.md, exception-handling.md

`node ace make:transformer bookmark`

- `app/transformers/bookmark_transformer.ts`, `BookmarkTransformer extends BaseTransformer<Bookmark>`.
  - Constructor: `(resource: Bookmark, texts: Map<number, Surah | null> = new Map())`. This is per-request data passed as an extended constructor argument, the same pattern as `AyahTransformer`. `Surahs.show` leaves it out; `Bookmarks.index` passes the result of `readSurahsIfAvailable`.
- Fields that need transformation:
  - `toObject()` (default; the surah page):
    - `reference: string` is `"<surahNumber>:<ayahNumber>"`, used in the note dialog title and the remove confirmation.
  - `forList()` variant (the bookmarks page) spreads `toObject()` and adds:
    - `title: string` is `"2:255 · Al-Baqara"`, or just `"2:255"` when that surah's text is unavailable. It's formatted on the backend, so the page renders it as is.
    - `text: { arabic: string, english: string } | null` is the matching ayah from `texts.get(surahNumber)?.ayahs`. It's `null` when the surah is unavailable (or the ayah is somehow missing), and the page then shows the "couldn't be loaded right now" line.
- Pass-through fields: `id`, `surahNumber`, `ayahNumber`, `note`.
- Relationships to preload before transform: none.
- Runtime context required: none from `HttpContext`. The text map is passed as data through the constructor, and the transformer runs no queries or upstream calls of its own (`transformers.md`).

**Flash and exceptions.** These follow `session.md` and `response.md`: only the standard `success` and `error` keys, and each write ends with a flash and a redirect.

- `success` "Note saved" (update) and `success` "Bookmark removed" (destroy).
- `error` "This bookmark was removed. Bookmark the ayah again to add a note." (update with nothing found).
- No new exceptions. `QuranUnavailableException` stays as it is, and the list page never sees it because `readSurahsIfAvailable` turns it into `null`.

## Routes

Reads: routing.md

```diff title="start/routes.ts"
 router
   .group(() => {
     router.on('/dashboard').renderInertia('app/dashboard', {}).as('dashboard')
     router.post('logout', [controllers.Session, 'destroy'])
   })
   .use(middleware.auth())
+
+router
+  .resource('bookmarks', controllers.Bookmarks)
+  .only(['index', 'store', 'update', 'destroy'])
+  .where('id', router.matchers.number())
+  .use('*', middleware.auth())
```

- **Unchanged routes:** `/login`, `/signup` and `/quran/:number` keep their routes; only their controller actions change (Controllers).
- **Names:** the auto-generated names are `bookmarks.index`, `bookmarks.store`, `bookmarks.update` and `bookmarks.destroy`, so there's no `.as(...)`.
- **`:id`:** `router.matchers.number()` casts it to a number, so non-numeric ids get a 404 before reaching the controller.
- **Registered once:** `.only([...])` and `.use('*', ...)` are applied to a single `router.resource` call (`routing.md`).

Verify route names with `node ace list:routes`.

## Events + side effects

Reads: events.md

- **No events or listeners.** Saving, noting and removing a bookmark don't notify anything independent of them. There's no mail, queue, cache invalidation or analytics reaction. Every step (keep, flash, redirect) is a required, ordered part of the action, and `events.md` says those stay in the owning controller.
- **Cache:** writing a bookmark never touches `quranCache`. The text cache is keyed by surah and has nothing to do with bookmarks.
- **No existing listeners** depend on `SessionController.store` or `NewAccountController.store`, so changing their redirects breaks nothing off-screen. The only invariant is the existing test expectation that sign-in without a bookmark ends on `dashboard`. It still holds, because `toIntended` falls back to `dashboard` when no intended URL is stored.

## Views

Reads: frontend.md, transformers.md, design-system.md

These Astryx components already exist and the plan reuses them: `List`/`ListItem`, `Dialog`, `AlertDialog`, `TextArea`, `DropdownMenu`, `Button`, `IconButton`, `EmptyState` and `Text`. The plan introduces no new visual convention. Icons are Heroicons `BookmarkIcon` (outline when not bookmarked, `20/solid` when bookmarked).

**Pages**

- `inertia/pages/quran/show.tsx` (modified): page component, owns state and composition only.
  - Props: the existing ones, plus `bookmarks: Data.Bookmark[]` (`{ id, surahNumber, ayahNumber, note: string | null, reference: string }`) and `noteFor: number | null`. The signed-out state comes from the shared `user`.
  - State: the bookmark whose note dialog is open, set once at mount from `noteFor`.
    - A store redirect is a fresh visit, so the page remounts and opens the prompt.
    - Update and destroy submit with `preserveState` and `preserveScroll`, so the prompt doesn't reopen when they redirect back to `?note=…`.
    - A `useEffect` scrolls `#ayah-<noteFor>` into view; browser APIs are only touched inside effects (`frontend.md`).
  - Builds a `Map<ayahNumber, Data.Bookmark>` and gives each `AyahItem` its bookmark (or `null`).
  - Layout: `MarketingLayout` (unchanged).
  - Composes: `AyahItem`, `NoteDialog` and `useRemoveBookmark`.
- `inertia/pages/quran/index.tsx` (modified): when the shared `user` is set, it shows a "Your bookmarks" `Button href={urlFor('bookmarks.index')}` under the heading.
- `inertia/pages/bookmarks/index.tsx` (new, `node ace make:page bookmarks/index`): page component.
  - Props: `bookmarks: Data.Bookmark.Variants['forList'][]`, which adds `title: string` and `text: { arabic: string, english: string } | null`.
  - Layout: `AppLayout`. The page sits in a `Layout` with `contentWidth={720}`, matching the Quran pages.
  - Composes: `BookmarkListItem` in a `List hasDividers` labelled "Bookmarks", or the `BookmarksEmpty` branch, plus `NoteDialog` and `useRemoveBookmark`. It owns the state for which dialog is open.
- `inertia/pages/auth/login.tsx` and `inertia/pages/auth/signup.tsx` (modified):
  - Props: `bookmark: { surah: number, ayah: number } | null`.
  - When `bookmark` is set, the form adds it to the submitted data with `form.transform(...)`. It isn't a text field, since `useRouteForm` fields are strings only.
  - A supporting line reads "Sign in to bookmark 2:255" ("Create an account…" on signup).
  - The login ↔ signup cross-links carry it along with `urlFor(..., [], { qs: { bookmark } })`.
  - Submit targets stay `session.store` and `new_account.store`.

**Components**

- `inertia/components/quran/ayah_item.tsx` (modified): adds the `id="ayah-<number>"` anchor and takes a `bookmark: Data.Bookmark | null` prop. Its `endContent` is `AyahBookmarkAction`.
- `inertia/components/bookmarks/ayah_bookmark_action.tsx` (new) chooses between the two branch components below, based on `bookmark` and the shared `user`. It's extracted as a page subcomponent.
- `inertia/components/bookmarks/bookmark_button.tsx` (new): the "not bookmarked" branch content, an outline `BookmarkIcon` `IconButton` labelled "Bookmark 2:255".
  - Signed in: `useRouter().post({ route: 'bookmarks.store' }, { surah, ayah })`.
  - Signed out: `href={urlFor('session.create', [], { qs: { bookmark: { surah, ayah } } })}`.
- `inertia/components/bookmarks/bookmarked_menu.tsx` (new): the "bookmarked" branch, a solid `BookmarkIcon` `DropdownMenu` trigger labelled "Bookmarked 2:255", with "Edit note" and "Remove" items. It calls back to `onEditNote` and `onRemove`. It's extracted as repeated JSX, because the bookmarks list item reuses it.
- `inertia/components/bookmarks/note_dialog.tsx` (new): a `Dialog` titled "Note on 2:255" around `Form route="bookmarks.update" routeParams={{ id }}` with `errorBag="note"` and `options={{ preserveScroll: true, preserveState: true }}`.
  - Holds a `TextArea name="note"` that starts from `bookmark.note`, with the server error `errors.note` shown under the field. Buttons are "Save" and "Not now"; "Not now" dismisses without changing anything.
  - Closes on `onSuccess`. Saving an empty note clears it, because the server turns blank into null.
  - Extracted as repeated JSX (shared by both pages).
- `inertia/components/bookmarks/use_remove_bookmark.ts` (new hook) plus `inertia/components/bookmarks/remove_bookmark_dialog.tsx` (new). Extracted as repeated logic and JSX across both pages.
  - `remove(bookmark)` calls `useRouter().delete({ route: 'bookmarks.destroy', routeParams: { id } })` straight away when `note` is null. Otherwise it opens the `AlertDialog` "Remove bookmark 2:255? Your note will be lost." with "Remove" and "Keep". Declining changes nothing.
- `inertia/components/bookmarks/bookmark_list_item.tsx` (new): a `ListItem` per list entry.
  - Its label is `title`, linking to `urlFor('surahs.show', { number: surahNumber }) + '#ayah-' + ayahNumber`.
  - Its description shows the RTL Arabic and the English from `text` (mirroring `AyahItem`). When `text` is null it shows a secondary line instead: "The ayah text couldn't be loaded right now."
  - The note, if there is one, follows. `endContent` is `BookmarkedMenu`.
  - Extracted as repeated JSX.
- `inertia/components/bookmarks/bookmarks_empty.tsx` (new): the empty-list branch, an `EmptyState` saying "You haven't bookmarked any ayahs yet" with a `Button href={urlFor('surahs.index')}` "Read the Quran".
- `inertia/components/app/app_layout.tsx` (modified): `nav` gets `{ label: 'Bookmarks', route: 'bookmarks.index', icon: BookmarkIcon }`.

**Two departures from project conventions:**

- **`Form` instead of `useRouteForm`** for member routes. `useRouteForm` can't fill route params, so `NoteDialog` uses `Form` from `@adonisjs/inertia/react` with `routeParams`. That's the default in `frontend.md`, and it respects the CLAUDE.md rule against importing `Form` from `@inertiajs/react`.
- **Astryx workflow at build time:** before writing any of these, build runs `astryx component <Name>` for each component it uses and ends with `astryx doctor --built inertia`.

## Test coverage gap

**Existing browser tests** under `tests/browser/` cover:

- the surah list (`quran/index.spec.ts`), surah reading (`quran/show.spec.ts`), entry points (`quran/entry.spec.ts`) and 404s (`quran/not_found.spec.ts`);
- sign-in (`auth/session.spec.ts`) and sign-up (`auth/signup.spec.ts`);
- navigation (`navigation.spec.ts`).

None of them covers bookmarks. The sign-in, sign-up and surah-reading specs must stay green; in particular, sign-in without a carried bookmark still ends on the dashboard.

**New flows that need browser tests:**

- **Bookmarking while signed in:** bookmark an ayah, the note prompt opens, dismiss it or save a note. Also: a 501-character note is rejected with the exact message, a whitespace-only note leaves no note, and bookmarking the same ayah twice gives one bookmark.
- **The signed-out round trip through sign-in and sign-up:** the reader returns to the ayah with it bookmarked and the prompt open. Variants: the bookmark already existed (its note is shown for editing), and sign-in is abandoned (nothing is bookmarked).
- **Editing and removing from the ayah and from the list:**
  - Removing a bookmark with a note asks for confirmation, and declining keeps it.
  - Saving a note on a bookmark removed elsewhere shows the exact rejection message.
- **The bookmarks list:**
  - Order is newest first.
  - Entries show reference, surah name, text and note, and link to the surah at that ayah.
  - An empty list shows the empty state.
  - Opening the list signed out redirects to sign-in and lands back on the list.
  - **Text unavailable:** with the fake text service making a surah unavailable, the list still shows references, notes and the "couldn't be loaded" line.
- **Privacy:** another reader's bookmark ids can't be updated or removed and never show up.

The detailed test plan is owned by `assert.md`.

---
