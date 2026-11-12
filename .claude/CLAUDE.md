# CLAUDE

Project-specific guidance for AI coding agents.

<!-- ASTRYX:START -->
Astryx v0.7.14 · 174 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — start every page from a template, never from scratch:
1. `astryx build "<idea>"` — names the template to scaffold from and the parts it lacks.
2. `astryx template <name> <path>` — scaffold it; keep its frame, gap and padding; replace the content.
3. `astryx template <Block>` for parts it lacks; `astryx component <Name>` to read props before using one.
Changing an existing page? Keep it: skip step 2 and add blocks/components inside its sections.
Before you deliver a build, run `astryx doctor --built <dir>`; don't deliver it if it fails.

RULES:
- No <div> — components handle all layout and spacing.
- Read `astryx docs layout` before changing a template's frame.
- Dense data = rows (Table, List/Item), not Card-wrapped lists. Badge = counts only.
- Style with component props first, then the xstyle prop / StyleX tokens. No raw hex/px.
- Palettes and custom colors go through the theme, never :root overrides. Run `astryx theme add <slug>` to import; `theme eject <slug>` only forks source. See `astryx docs theme`.
- SELF-CHECK: re-read the file; replace any className=, style={{…}}, raw <div>/<span>, imported .css/@apply, or hardcoded #hex/px with the component or the xstyle prop + a token.

`astryx help` lists every command. Key ones beyond the workflow:
  search "<query>"   find any component / hook / doc / template
  discover <words>   integrations you could add
  docs <topic>       getting-started, principles, tokens, theme … (`astryx docs` lists all)
  docs cli           commands and API reference
  docs authoring     build an integration package, and every field it holds
  upgrade --from <old version> --apply   run after a dependency bump
<!-- ASTRYX:END -->

## Project conventions

AdonisJS 7 + Inertia + React. The frontend lives in `inertia/` and is built with Astryx (rules above).

Commands:

- `npm run dev` — AdonisJS + Vite dev server on http://localhost:3333
- `npm run typecheck`, `npm run lint` (Oxlint via `vp lint`), `npm run format` / `format:check` (Oxfmt via `vp fmt`)
- `npm run build` — production build (`node ace build`)

Folders: the frontend is grouped by domain.

- `inertia/pages/<domain>/` — one component per Inertia page; the path is the page name passed to `renderInertia` / `inertia.render` (`marketing/home`, `auth/login`, `app/dashboard`, `errors/not_found`). Put new areas in their own folder (e.g. `pages/settings/profile.tsx`).
- `inertia/components/<domain>/` — each area's layout and parts: `app/app_layout.tsx` (signed-in shell), `auth/auth_layout.tsx`, `marketing/marketing_layout.tsx` (public pages and error pages), `settings/settings_layout.tsx` (nested under the app layout); plus shared domains `navigation/` (Inertia link, nav items, navigation events, progress bar), `theme/` (color mode preference, toggle), `forms/` (route forms), `feedback/` (flash toasts), `brand/` (logo), `errors/` (error page). `components/app_providers.tsx` composes the providers for `app.tsx` and `ssr.tsx`.

Routing and links:

- Link with Astryx components and `urlFor('route.name')` from `~/client`: `<Link href={urlFor('dashboard')}>`, `<Button href={...}>`, `<TopNavItem href={...}>`. `LinkProvider` (in `inertia/components/app_providers.tsx`) renders them through the AdonisJS `Link`, so they navigate with Inertia.
- Never import `Link`, `Form`, `router` or `useHttp` from `@inertiajs/react`; use `@adonisjs/inertia/react` (enforced by lint). For navigation events (`start`, `finish`, ...) use `useNavigationEvent` (`inertia/components/navigation/navigation_events.ts`), the one file allowed to touch Inertia's `router`.
- Forms: `useRouteForm('route.name', initialValues)` (`inertia/components/forms/use_route_form.ts`) types the data from the route's validator and submits to the route's URL and method. Wrap the fields in a plain `<form onSubmit={form.submit}>` and Astryx `FormLayout`, and spread `form.field('name')` onto each `TextInput` for its value, change handler and server validation error.
- Nav menus: list `NavItem`s and resolve them with `useNavItems` (`inertia/components/navigation/nav.ts`).

Styling:

- Astryx components use the prebuilt `@astryxdesign/core/astryx.css` (imported in `inertia/app.tsx`). `@stylexjs/unplugin` compiles only the app's own StyleX (see `vite.config.ts`, modelled on Astryx's `example-nextjs-stylex`): app classes use the `p` prefix so they never collide with Astryx's prebuilt `x…` classes, and app layers come after `reset, astryx-base, astryx-theme`, so app styles win. Don't switch to a source build (`astryxStylex()`) without a reason such as swizzling; it makes dev page loads several times slower.
- In `stylex.create`, use the typed tokens from `@astryxdesign/core/theme/tokens.stylex` (`colorVars['--color-background-body']`, `spacingVars['--spacing-4']`, ...), not `var(--…)` strings.
- Pages: wrap each page in Astryx `Layout` (`LayoutHeader`, `LayoutContent`, `LayoutPanel`); the app and marketing layouts are an `AppShell` + `TopNav` around it.
- Icons: Heroicons (`@heroicons/react/24/outline`, `20/solid` inside buttons) passed to Astryx `Icon` or an `icon` prop.
- Theme: `astryx-themes.ts` is generated by `npx astryx theme add|use|remove`; do not edit it. Color mode is `light` / `dark` / `system` (default): `useThemePreference()` (`inertia/components/theme/theme_preference.tsx`) sets it, Astryx `useTheme().mode` reads the mode in effect. It is stored in the `app_theme` cookie, which the Edge shell applies as `color-scheme` before the app loads.

Testing:

- Browser tests only (Japa + `@japa/browser-client`, Playwright Chromium), in `tests/browser/**/*.spec.ts`, one file per user flow. Run `npm test` or `node ace test browser`; first time on a machine, run `npx playwright install chromium`.
- Use the helpers Japa passes to the test callback: `visit`, `route('route.name')` for URLs, `browserContext.loginAs(user)` to start logged in, `assert`, and the page assertions (`assertPath`, `assertTextContains`, `assertCookie`, ...). Locate elements by role or label (`getByRole`, `getByLabel`), as a user would.
- Tests use `tmp/db.test.sqlite3`, migrated once per run (`tests/bootstrap.ts`); truncate it in `group.each.setup(() => testUtils.db().truncate())`.
- Custom 404/500 pages render in tests too (`renderStatusPages` in `app/exceptions/handler.ts`).

Generated files, never edit: `.adonisjs/**`, `database/schema.ts`, `astryx-themes.ts`, and the `ASTRYX` blocks in `AGENTS.md` / `.claude/CLAUDE.md` (refresh with `npx astryx init`).
