<!-- FLOW-DOCS-INDEX-START -->[AdonisJS Harness Docs Index]|root: ./.flow/docs|STOP. What you remember about AdonisJS may be wrong for this project. Read the relevant harness doc first and treat it as the primary working reference for framework and app tasks.|When the code must break a rule of a harness doc or a flow skill on purpose, write `// flow-allow <doc or skill>: <reason>` directly above it. The reason names the rule and says why the code must break it. The comment covers only the line or block below it.|topics:{cache.md: Read when caching expensive reads or invalidating cached data after mutations. Covers the recommended path for multi-tier stores, stable keys, serializable values, targeted invalidation, and resilient refreshes.|limiter.md: Read when throttling HTTP routes, protecting credential or verification attempts, or limiting expensive operations. Covers named route middleware, stable keys, failure-only penalties, multi-dimensional limits, and test isolation.|lock.md: Read when preventing concurrent execution of the same operation across requests, workers, processes, or servers. Covers the recommended path for lock keys, acquisition behavior, bounded waiting, ownership, and safe expiry.|packages.md: Catalog of every supported AdonisJS-ecosystem package and the harness docs it owns. Read this when a required harness doc is missing from this folder to identify which package the user must install before re-running `npx @adonisplus/flow install`.|redis.md: Read when storing custom shared state, using Redis data structures, coordinating atomic Redis updates, or sending ephemeral messages between application processes. Covers managed connections, key and expiry discipline, transactions, Pub/Sub, health checks, and test isolation.|scheduler.md: Read when application work must run automatically on a recurring schedule. Covers task classes, process topology, discovery, overlap prevention, graceful shutdown, and failure reporting.|transmit-client.md: Read when browser UI must subscribe to live updates from an AdonisJS Transmit server. Covers one shared client, channel subscription lifecycle, authentication hooks, cleanup, reconnect recovery, and stack-specific integration.|transmit.md: Read when pushing ephemeral live updates from an AdonisJS server to browsers. Covers route registration, exact channels, private subscription authorization, broadcasting, multi-instance limits, production behavior, and tests.|authentication.md: Read when wiring authentication in an AdonisJS app, choosing a guard, or protecting routes that require a signed-in user. Covers the recommended path for guard setup, route protection, and using the authenticated user in app code.|codegen.md: Read when generated AdonisJS indexes or types may be stale, resolving `.adonisjs` conflicts, preparing verification without a development server, or adding operational work to a provider start hook. Covers one-shot regeneration, committed output, conflict recovery, and warmup-safe side effects.|commands.md: Read when creating, changing, or testing an application command. Covers scaffolding, typed and non-interactive inputs, application startup, dependency injection, prompts, machine-readable output, failures, and command tests.|controllers.md: Read when adding a controller action that renders an Inertia React page or handles a form submission. Covers the recommended path for controller files, resource controllers, dependency injection, and what work stays in the action.|cryptography.md: Read when implementing passwords, random secrets, encryption, signatures, secure comparison, or any other application cryptography. Covers the framework-owned path for each outcome and the narrow external-protocol exceptions for `node:crypto`.|design-system.md: Read when planning UI and choosing which existing components, layouts, and styles to reuse. Covers how to discover the project design system before writing UI.|events.md: Read when introducing or handling application events in an AdonisJS app. Covers the recommended path for typed class events, listener classes, registration, dispatch failures, and producer tests.|exception-handling.md: Read when deciding how application errors should be reported or turned into HTTP responses in an Inertia React app. Covers custom exceptions that handle their own response, the global exception handler, Inertia status pages, and report context and filtering.|http-context.md: Read when a service, model hook, or helper needs the current request context, or when adding custom properties to `HttpContext`. Covers injecting `HttpContext` into services, async local storage, augmenting the context, and creating a context in tests or scripts.|middleware.md: Read when creating, registering, or applying HTTP middleware in an AdonisJS app. Covers where middleware belongs, how to attach it, and the recommended request-scoped patterns for middleware logic.|request.md: Read when an action validates form, query-string, header, or file input, or reads the client IP, request ID, or a server-set cookie. Covers the recommended path for one `request.validateUsing` call per request, validation-failure behavior, cookie reads, and proxy trust for the client IP.|response.md: Read when deciding what a controller action should send back to the browser in an Inertia React app. Covers the recommended path for page responses, redirects, file responses, and response customization.|routing.md: Read when defining or reorganizing routes in an AdonisJS app. Covers the recommended path for route structure, route params, resource routes, grouping, route names, and attaching middleware to routes and resource actions.|services.md: Read when deciding whether to extract a service from a controller action (or other caller) in an AdonisJS app, or when creating one. Covers the trigger for extracting vs keeping work inline, the naming test, service file structure, and injection from controllers.|testing.md: Read when authoring or editing tests for an AdonisJS Inertia React app, such as testing a page end to end in the browser. Covers the recommended Japa setup, browser tests that drive pages, signing in, database reset, fakes, and container swaps.|transformers.md: Read when backend data must be formatted, renamed, aggregated, or reshaped before reaching an Inertia React page. Covers transformer classes, relations, lists and pagination, variants, typed page props and formatted values.|url-builder.md: Read when generating internal links or secure signed URLs from named routes in an AdonisJS app. Covers the recommended path for route-name URLs, frontend links, redirects, and signed-link verification.|frontend.md: Read when building or editing frontend screens in an Inertia React app. Covers the recommended path for pages, layouts, forms, navigation, and frontend data flow.|migrations.md: Read when changing database schema in an AdonisJS app. Covers the recommended path for creating tables, altering tables, backfilling schema-related data, and running migration workflows.|model-relationships.md: Read when declaring relationships between models, loading related data, querying through relationships, or aggregating related records. Covers relationship declarations and key overrides, eager and lazy loading, filtering and counting by relation, and writing through relationships, including pivot data.|models.md: Read when adding or changing a Lucid model, or creating, updating, or deleting records through a model. Covers models on top of generated schema classes, mixins, hooks, scopes, column overrides, and enum columns.|pagination.md: Read when implementing paginated lists or paginated sub-resources in an Inertia React app. Covers the recommended query, transformer output, page-prop typing, and navigation path for pagination.|query-builder.md: Read when filtering, joining, or aggregating rows beyond model finders or relationship helpers, or when writing upserts, bulk updates, or row locks. Covers choosing a model query or the db builder, aggregates across dialects, inserts and upserts, row locks in transactions, raw SQL with bindings, and query cloning.|schema-rules.md: Read when generated schema types need correction or when repo-wide database typing conventions must apply across tables, and the fix belongs at generation time instead of on one model. Covers type and column rules, per-table overrides, skipping columns, and regenerating the schema.|transactions.md: Read when a workflow needs multiple database writes to succeed or fail together. Covers the recommended path for atomic writes, rollback behavior, row locks, and post-commit side effects.|session.md: Read when storing request-to-request state, flashing messages, or using session-backed redirects in an AdonisJS app. Covers the recommended path for session values, success and error flash messages, old input, and intended URLs.|validation.md: Read when creating, changing, or wiring a validator. Covers the recommended path for validator files, required and nullable fields, composing validators, database uniqueness checks, and validation errors.}<!-- FLOW-DOCS-INDEX-END -->
<!-- FLOW-SKILLS-START -->
**Flow skills.** Each row names a skill and the work it applies to. Before you do that work, invoke the skill and follow it. This is required in each session, not a suggestion.

| When | Do this first |
| --- | --- |
| Before you write code that reads or writes records that belong to users, tenants or organisations | Invoke `flow-access-control` skill |
| Before you add a helper, a service, a utils file, a private controller method, or code that more than one place uses | Invoke `flow-code-placement` skill |
| Before you add or change a route, a controller, or a method of a controller such as `approve` or `cancel` | Invoke `flow-cruddy-controllers` skill |
| Before you write or change a test, a mock or a fake | Invoke `flow-design-tests` skill |
| Before you write a class that keeps one value, a class with only static methods, or a function outside a class that reads or changes its value | Invoke `flow-pattern-object-design` skill |
| Before you write or change a controller action that renders a page, a transformer, the props of a page, or a page | Invoke `flow-response-design` skill |
| Before you write or change a migration or a model | Invoke `flow-schema-design` skill |
| Before you write or change a validator, or any check on incoming data | Invoke `flow-validation-layers` skill |
<!-- FLOW-SKILLS-END -->
<!-- FLOW-PROJECT-FACTS-START -->[Project Facts]|stack: AdonisJS 7, Lucid 22, Inertia 5, Inertia React 3, Edge 6, SQLite 13|packageManager: npm|node: >=24.0.0<!-- FLOW-PROJECT-FACTS-END -->

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
search "<query>" find any component / hook / doc / template
discover <words> integrations you could add
docs <topic> getting-started, principles, tokens, theme … (`astryx docs` lists all)
docs cli commands and API reference
docs authoring build an integration package, and every field it holds
upgrade --from <old version> --apply run after a dependency bump
<!-- ASTRYX:END -->

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `HelloCigar/quran-reader`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Which skills own what

The mattpocock skills own planning and the work around code. The Flow skills and the harness docs own the code itself, and the Flow rule wins when they disagree. `docs/adr/0003-adonisjs-work-follows-the-flow-harness.md` lists the Flow part each mattpocock skill must use.

Don't use these mattpocock skills in this repo, including when another skill (such as `implement` or `implement-spec`) calls for them:

- `codebase-design`, `improve-codebase-architecture`: use `flow-code-placement` and `flow-pattern-object-design`.
- `tdd`: use `flow-design-tests` and `.flow/docs/testing.md`.
- `mattpocock-skills:code-review`: use `flow-code-review`.
- `setup-pre-commit`: this repo uses Oxfmt and Oxlint, not Prettier.
- `setup-ts-deep-modules`, `migrate-to-shoehorn`: they don't fit this stack.
