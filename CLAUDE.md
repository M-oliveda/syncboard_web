# CLAUDE.md

Instructions for Claude Code when working in this repository. These override default
behavior and must be followed exactly.

## Project Snapshot

**SyncBoard Web** — the React 19 + Vite + TypeScript frontend for SyncBoard, a real-time
collaborative Kanban board. It renders Workspaces, Boards, Lists, and Cards; drives
drag-and-drop reordering with an optimistic UI (`@dnd-kit`); and keeps every open tab in
sync via a `socket.io-client` connection to `syncboard_api`. Routing and server state
run through TanStack Router/Query; styling is Tailwind CSS + `origin-ui`. The app builds
to a static bundle served by Nginx in a Docker container, deployed to Google Cloud Run
as its own service, independent from the API.

- Product surface, routes, and setup: [`README.md`](./README.md)
- Full architecture, component structure, and rationale:
  [`MASTERPLAN.md`](./MASTERPLAN.md)

**Phase 0 (project scaffolding & testing infra) is complete** — `package.json`,
`package-lock.json`, `index.html`, `vite.config.ts`, `src/` (`main.tsx`, `App.tsx`,
`index.css`, `vite-env.d.ts`), `tests/` (Vitest + React Testing Library, 100% coverage
gate wired via `coverage.thresholds`), `playwright.config.ts`, and `e2e/` all exist and
every `npm run *` command in [Commands](#commands) works. `.husky/pre-commit` and
`.husky/commit-msg` are wired via Husky's `prepare` script. All three boxes in
`MASTERPLAN.md` §13 Phase 0 are checked. **Still no board UI, routing, data fetching,
drag-and-drop, real-time, or auth** — `src/App.tsx` is a placeholder pending Phase 1.
Treat `README.md`/ `MASTERPLAN.md` as the target contract for those later phases, not a
description of what exists yet — check the filesystem before assuming a
component/hook/route is present. The sibling `syncboard_api` repo (fully scaffolded) is
the reference for what "done" looks like — its `CLAUDE.md`/`AGENTS.md`/`package.json`
show the level of tooling this project should converge on. `AGENTS.md` in this repo
documents the target stack-specific conventions
(React/TanStack/Tailwind/origin-ui/dnd-kit best practices) — read it alongside this
file.

## Mandatory: Generate a Coding Plan First

**Before implementing any new feature, fix, or change of medium or higher complexity,
generate a coding plan and get it in front of the user before writing code.** Use plan
mode (`EnterPlanMode`/`ExitPlanMode`) for this — don't just describe the plan in prose
and start editing.

A change counts as medium-or-higher complexity if it does **any** of the following:

- Adds or changes a route, a TanStack Query hook, or a Socket.io event handler
- Touches more than one architectural layer (e.g. route + hook + API client)
- Changes the optimistic drag-and-drop cache-patch or rollback logic
- Touches auth, token handling, or protected-route guarding
- Changes CI/CD, Docker, or deployment configuration
- Is a bug fix that isn't a one-line/obvious change

Skip planning only for genuinely trivial edits: fixing a typo, a doc-only change, a
one-line config tweak, or a routine dependency bump. If it's ambiguous whether a task is
trivial, plan it.

## Architectural Constraints (do not violate)

- The frontend is a pure client — it never talks to MongoDB or Redis directly; all data
  access, including real-time events, goes through `syncboard_api`
- Server state (boards/lists/cards) lives in TanStack Query, patched directly by
  incoming socket events via `queryClient.setQueryData` — never treat a socket event as
  a signal to refetch the whole board
- No separate global client-state library — ephemeral UI state (open modal, active drag)
  stays local to the component or a lightweight store; URL state (open card, filters)
  lives in TanStack Router search params
- Optimistic drag-and-drop always snapshots the pre-drag cache state in `onMutate` and
  rolls back in `onError` — never leave an optimistic update unreconciled on failure
- Drag-and-drop `order` values must match the backend's fractional/LexoRank scheme (see
  [`api/MASTERPLAN.md` §5.3](../api/MASTERPLAN.md#53-reorder-strategy-fractional-ordering))
  — never re-derive an integer-indexing scheme client-side
- Protected routes are enforced in TanStack Router's `beforeLoad`, not by hiding UI in
  components — an unauthenticated user must be redirected before any protected loader
  runs, so no board data is ever requested without a valid session
- The access token is attached via an Axios request interceptor and passed in the
  Socket.io handshake `auth` payload; the refresh token is an **HttpOnly cookie** the
  frontend never reads or stores in JS — the Axios instance needs
  `withCredentials: true` for the silent-refresh flow to work (see
  [`api/README.md` Frontend Integration](../api/README.md#frontend-integration))
- Presentational components (`components/ui`, `components/board`) stay free of data
  fetching — TanStack Query/socket wiring lives in `hooks/`
- `VITE_*` env vars are inlined at build time — each deployed environment needs its own
  build; never promote a single image across environments by swapping runtime env vars
- Each of Preview/Development/Staging/Production has its own dedicated GCP project,
  service account, and GitHub Environment — never assume shared infrastructure or
  secrets across environments. Preview has no backend of its own; it always points at
  the Development API
- Rich-text editor output must be sanitized before being rendered elsewhere (e.g.
  activity feed previews) to prevent stored-XSS via card descriptions
- Preview/Development/Staging are built from the Dockerfile's `protected` target
  (`--build-arg AUTH_USERNAME=...`/`AUTH_PASSWORD=...`, serving `nginx.protected.conf`
  behind HTTP Basic Auth); Production is built from the `production` target (no auth
  args, serves plain `nginx.conf`) — never build Production from `protected` or ship a
  non-Production environment from `production` (see
  [`MASTERPLAN.md` §12.5](./MASTERPLAN.md#125-environment-access-protection))

## Commands

`web/` has no `package.json` yet, so none of these can be run today — this is the
**target** script surface once Phase 0 scaffolding (per `MASTERPLAN.md` §13) lands,
matching the conventions in `README.md#development`:

```bash
npm run dev               # Start Vite dev server
docker compose up          # Start Docker dev environment

npm run build               # Production build
npm run preview               # Preview production build

npm run test                   # Unit tests (Vitest)
npm run test:coverage             # Coverage report — CI fails below 100%
npm run test:e2e                    # Playwright E2E
npm run test:e2e:ui                    # Playwright UI mode

npm run lint                             # ESLint
npm run format                             # Prettier
npm run type-check                           # TypeScript type checking
```

## Conventions

- Commit messages: Gitmoji format, `:emoji: Message` — uppercase start, matching the
  convention used in `syncboard_api`; enforced by the `.husky/commit-msg` hook, which is
  now functional (`.husky/pre-commit` runs `lint`/`format:check`/`type-check`/`test`)
- `AGENTS.md` holds the stack-specific coding conventions (React/TypeScript/Tailwind/
  TanStack/dnd-kit/Docker/Git) — read it before writing code in this repo; keep it in
  sync with this file when either changes
- `eslint.config.ts`'s flat-config TS loader needs the `jiti` devDependency (≥2.2.0) to
  load under Node — already installed at `^2.7.0` in `package.json`

## Testing Expectations

- Vitest + React Testing Library + MSW for unit/component tests; Playwright for E2E —
  100% coverage (statements/branches/functions/lines) enforced via
  `coverage.thresholds`, matching the gate used in `syncboard_api`
- The real-time contract (a card move in one browser context appearing in another) is
  only meaningfully verified via a two-browser-context Playwright scenario, not mocked
- New hooks/components touching the optimistic-move or socket-patch logic need both the
  success path and the rollback/error path covered before a change is considered done

## Explicit Non-Goals

Per `MASTERPLAN.md` §2.4 — do not introduce these without an explicit user request:

- Native mobile apps (responsive web only)
- Offline-first architecture / service-worker caching of board state
- Server-side rendering (pure client-rendered SPA)
- Multi-board bulk operations (e.g. cross-board card move) in v1
