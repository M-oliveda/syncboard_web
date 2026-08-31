# AGENTS.md — SyncBoard Web Coding Style & Best Practices

## Project Overview

**SyncBoard Web** (`m-oliveda/syncboard_web`) is the React 19 + Vite + TypeScript
frontend for SyncBoard, a real-time collaborative Kanban board. It renders Workspaces,
Boards, Lists, and Cards; drives drag-and-drop reordering with an optimistic UI
(`@dnd-kit`); and keeps every open tab in sync via a `socket.io-client` connection to
the sibling `syncboard_api` backend. Routing and server state run through TanStack
Router/Query; styling is Tailwind CSS + `origin-ui` (Shadcn/ui-based components). The
app builds to a static bundle served by Nginx in a Docker container, deployed to Google
Cloud Run as its own service, independent from the API.

- Product surface, routes, setup, deployment: [`README.md`](./README.md)
- Full architecture, component structure, rationale: [`MASTERPLAN.md`](./MASTERPLAN.md)
- Design tokens (colors, typography, spacing, radii, elevation) and brand/style
  rationale: [`DESIGN.md`](./DESIGN.md) — the single source of truth for anything
  visual; layered underneath `origin-ui` (<https://originui.moliveda.dev/>) components.
  The full Phase 1 page inventory and visual reference lives in the
  [SyncBoard Stitch project](https://stitch.withgoogle.com/projects/6668508160005015741)
  (Google's design tool — reachable via the `mcp__stitch__*` MCP tools in sessions that
  have that server connected; where it isn't, treat exports/screenshots the user shares
  as the source of truth for page-specific visual detail not already captured in
  `DESIGN.md`/`MASTERPLAN.md`)

This is the **single file** of instructions for any AI agent working in this repo —
mandatory workflow, hard architectural constraints, commands, testing expectations, and
non-goals, in addition to the stack-specific coding conventions and best practices
further below. `CLAUDE.md` is a symlink to this file (so Claude Code's auto-loading
still finds it); there is no second copy to keep in sync.

**Current state:** Phase 0 (scaffolding), Phase 1 (static board UI), Phase 2 (REST
integration), Phase 3 (CI/CD & deployment environments), Phase 4 (drag-and-drop &
optimistic UI), Phase 5 (real-time layer), and Phase 6 (auth & protected routing) are
complete — all boxes in `MASTERPLAN.md` §13 are checked (Phase 6 was pulled forward
ahead of Phases 3–5 as a Phase 2 prerequisite; see the note there; Phase 3 was itself
pulled forward ahead of Phases 4–5, see its note). CI/CD is real, not aspirational:
`.github/workflows/{ci,deploy-dev,deploy-staging,deploy-prod, deploy-preview,cleanup-preview,e2e-staging}.yml`,
the 3-stage `Dockerfile`, and all four GCP projects/GitHub Environments
(Preview/Development/Staging/Production) exist and are wired up — see `MASTERPLAN.md`
§13 Phase 3 for the one known gap (image registry is Docker Hub, not GCP Artifact
Registry). Workspaces, boards, lists, and cards are fetched and mutated through TanStack
Query hooks in `src/hooks/` (`useWorkspacesQuery`, `useBoardsQuery`, `useBoardQuery`,
`useListMutations`, `useCardMutations`, `useMemberMutations`) talking to `syncboard_api`
via the Axios instance in `src/lib/api.ts`; `src/lib/api-mappers.ts` converts backend
DTOs (`src/types/api.ts`) into the existing UI-facing types so presentational components
didn't need to change shape. Login/register/forgot-password/reset-password
(`src/components/auth/`) are wired to the real `/auth/*` endpoints, the access token
lives in the module-level store `src/lib/auth-session.ts` (never `localStorage`), and
`/app`'s `beforeLoad` (`src/routes/app/route.tsx`) attempts a silent
`POST /auth/refresh` before redirecting to `/login`. Logout lives in the sidebar's
account menu. `src/lib/mock-board.ts`/`mock-workspace.ts` are gone — superseded by real
data; `src/lib/mock-roadmap.ts` and `mock-card-detail.ts` are still in active use
(Roadmap stays a static demo board by design, and the card-detail Activity feed stays
mock — see MASTERPLAN §5.3/§13 Phase 2 for why). Cards and lists can be dragged and
reordered (`@dnd-kit`) with optimistic cache updates and rollback-on-failure — see
`src/lib/reorder.ts` (pure move/order logic), `src/lib/board.ts`
(`moveCardInBoard`/`moveListInBoard`), `useMoveCardMutation`/`useMoveListMutation`, and
`useBoardDragAndDrop.ts` (the `@dnd-kit` wiring); `MASTERPLAN.md` §13 Phase 4 has the
full breakdown, including the one known gap (no `onDragOver` cross-list visual reflow or
`DragOverlay` yet — purely cosmetic, the move/rollback logic itself is complete). The
board now stays live across tabs via a `socket.io-client` singleton
(`src/lib/socket.ts`'s `getSocket()`) and `src/hooks/useSocket.ts`, which joins
`board:<boardId>` and patches the TanStack Query cache directly from `card:updated`/
`board:user-presence` events — never a refetch. `card:updated` reuses
`src/lib/board.ts`'s `moveCardInBoard` (the same reconciliation function Phase 4's
`useMoveCardMutation` already used), so a teammate's drag and your own drag converge on
one patch path. Presence lives in the cache too, at `["board", boardId, "presence"]`
(`usePresenceQuery`). Because the backend only ever broadcasts `card:updated` from its
`card:moved` socket handler (a REST `PATCH /cards/:id` alone broadcasts nothing —
verified by reading `api/src/sockets/handlers/card.handler.ts`), `useMoveCardMutation`'s
`onSuccess` now also emits `card:moved` after its REST call succeeds, purely to trigger
the broadcast; REST still does the actual persist/rollback. One consequence carried
forward as a known gap: title/description/checklist edits (REST-only) still don't
live-sync to other tabs, only card moves do — see `MASTERPLAN.md` §13 Phase 5 for that
and the other deferred gap (reconnect-after-expired-token isn't explicitly coordinated
with the Axios refresh flow). The sibling `syncboard_api` repo (fully scaffolded) is the
reference for what "done" looks like for the _backend_ tooling level this project should
converge on; as of this phase it also documents its refresh-token cookie handling as
implemented rather than aspirational (`api/CLAUDE.md`).

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
  a signal to refetch the whole board (see
  [State Management & Real-Time Sync](#state-management--real-time-sync-tanstack-query))
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
- UI styling must conform to [`DESIGN.md`](./DESIGN.md)'s design tokens (colors,
  `Space Grotesk` typography scale, 4px-baseline spacing, 10px/14px/18px radii scale) —
  implemented as Tailwind v4 `@theme` tokens in `src/index.css`; never hardcode a color,
  font, or radius that isn't in that token set
- Preview/Development/Staging are built from the Dockerfile's `protected` target
  (`--build-arg AUTH_USERNAME=...`/`AUTH_PASSWORD=...`, serving `nginx.protected.conf`
  behind HTTP Basic Auth); Production is built from the `production` target (no auth
  args, serves plain `nginx.conf`) — never build Production from `protected` or ship a
  non-Production environment from `production` (see
  [`MASTERPLAN.md` §12.5](./MASTERPLAN.md#125-environment-access-protection))

## Commands

Phase 0 scaffolding (per `MASTERPLAN.md` §13) is complete, so every command below works
today, matching the conventions in `README.md#development`:

### Starting the Local Dev Server

Local development runs via **Docker by default** (`docker-compose.yml`'s `app` service —
builds the Dockerfile's `builder` stage and runs `npm run dev -- --host 0.0.0.0` inside
the container, bind-mounting `src/`/`index.html`/`vite.config.ts`/`tsconfig.json` for
hot-reload; see this file's Docker Best Practices section for the full setup). Before
starting a dev server for local iteration or browser verification, check whether the
Docker daemon is actually running — `docker info` exits non-zero if it isn't reachable
(whether Docker Desktop is stopped or the CLI isn't installed at all):

- **Docker running:** `docker compose up --build` (or `-d` for detached), serving at
  `http://localhost:5173`
- **Docker not running:** fall back to `npm run dev` directly on the host — Vite
  defaults to port 5173 but auto-increments (5174, 5175, ...) if that port is already
  taken by a leftover process, so confirm the actual printed URL before using it

Docker is the primary path, not an equally-weighted alternative to `npm run dev` — it
keeps local behavior matching the containerized parity the rest of the stack (and CI)
assumes. Don't reach for `npm run dev` first just because it's faster to type; check
Docker's state first and only fall back when it's genuinely unavailable.

```bash
docker compose up --build   # Start Docker dev environment (default — see above)
npm run dev                  # Start Vite dev server directly (fallback if Docker isn't running)

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

## UX/UI Design Principles

### UX/UI Design Principles: General Principles

- Understand and apply User-Centered Design
- Design for usability and intuitive interactions
- Ensure accessibility (WCAG compliance where appropriate)
- Structure content using solid Information Architecture
- Focus on Interaction Design for fluid user flows

### UX/UI Design Principles: Visual Design

- Apply principles of Visual Design consistently
- Use typography hierarchies effectively
- Follow colour theory for contrast and harmony
- Build clear and balanced layouts
- Design for responsiveness across devices

### UX/UI Design Principles: Design Systems

- Create and maintain a scalable Design System
- Use reusable components and patterns
- Follow atomic design principles where applicable

### UX/UI Design Principles: Design Thinking

- Apply Design Thinking methodology: _Empathize_, _Define_, _Ideate_, _Prototype_,
  _Test_
- Keep the user at the center of all design decisions

## HTML Best Practices

### HTML Best Practices: Structure & Semantics

- Use semantic HTML elements (`<header>`, `<main>`, `<footer>`, `<section>`,
  `<article>`, etc.)
- Avoid using `<div>` or `<span>` when a semantic element fits better
- Always use the correct DOCTYPE declaration (`<!DOCTYPE html>`)
- Use `<h1>`-`<h6>` tags in order to reflect content hierarchy. Use only one `<h1>` tag
  inside the entire application.
- Include a single `<main>` tag per page

### HTML Best Practices: Accessibility (a11y)

- Use `alt` attributes on all `<img>` tags with descriptive text
- Use **ARIA roles** only when native HTML elements don't suffice
- Use `<label>` with `for` attribute linked to input ids
- Ensure interactive elements are keyboard accessible
- Avoid auto-playing audio or video without user interaction

### HTML Best Practices: Performance

- Minimize use of inline styles; use **CSS files** instead
- Defer or async JavaScript when possible (`<script defer>` or `<script async>`)
- Use the `loading="lazy"` attribute for images when appropriate
- Place scripts at the end of the body unless necessary in the head

### HTML Best Practices: Forms

- Always include `name` attributes in form controls
- Group related inputs using `<fieldset>` and `<legend>`
- Use appropriate `type` attributes on inputs (`email`, `tel`, `url`, etc.)
- Provide **placeholders** and **aria attributes** to enhance accessibility
- Use `required`, `min`, `max`, `pattern`, and `autocomplete` attributes properly

### HTML Best Practices: Links & Navigation

- Use `<nav>` for site or page navigation
- Ensure links are descriptive (avoid common terms like _click here_)
- Use relative paths for internal links and absolute paths for external ones
- Always provide a visible focus indicator for links and buttons

### HTML Best Practices: Media

- Use `<picture>` and `<source>` for responsive images
- Use `width` and `height` attributes to prevent layout shifts
- Provide captions or transcripts for multimedia content
- Use `<figure>` and `<figcaption>` to wrap self-contained media content

### HTML Best Practices: SEO

- Include a meaningful `<title>` for each page
- Add relevant `<meta>` tags (description, viewport, charset, etc.)
- Use canonical URLs when necessary
- Structure content with headings and semantic tags for crawler clarity

### HTML Best Practices: Maintainability

- Use consistent indentation (4 spaces)
- Use lowercase for tag names and attributes
- Quote all attribute values
- Close all tags properly, including self-closing tags (`<img />`)
- Avoid inline JavaScript and CSS when possible

### HTML Best Practices: Comments & Readability

- Use HTML comments (`<!-- comment -->`) to explain non-obvious sections
- Do not leave commented-out code in production
- Keep markup concise and avoid unnecessary nesting

## CSS Best Practices

> This project styles almost exclusively with **Tailwind utility classes** (see
> [Tailwind CSS Best Practices](#tailwind-css-best-practices)) — the naming/structure
> guidance below applies to the small amount of global/base CSS in `src/index.css`
> (theme tokens, resets), not to component styling.

### CSS Best Practices: Structure & Organization

- Group related styles in **type-based** folders (e.g.,
  `components/ui/Button/button.css`)
- Use consistent ordering: layout > box model > typography > visual > animation
- Use comments to separate sections and explain non-obvious rules
- Avoid long files; split styles by component or responsibility
- Keep global styles minimal; prefer scoped/component styles

### CSS Best Practices: Naming Conventions

- Use **BEM** (Block\_\_Element--Modifier) naming for class names
- Use lowercase letters and hyphens (`.button-primary`, not `.buttonPrimary`)
- Avoid generic class names (`.box`, `.content`, `.main`)
- Name classes based on purpose, not appearance (`.card-error`, not `.red-box`)

### CSS Best Practices: Specificity & Selectors

- Keep specificity low and flat
- Avoid IDs in selectors unless necessary
- Use class selectors over element selectors for reusability
- Avoid overly long selectors (`.header .nav .item`); keep them short and maintainable

### CSS Best Practices: Reusability

- Use CSS custom properties (`--primary-color`) for theme variables
- Extract common values (colors, spacing, fonts) into variables or utility classes
- Avoid repeating the same values across multiple rules
- Prefer utility-first or atomic classes for layout and spacing when possible

### CSS Best Practices: Responsive Design

- Use relative units (`rem`, `%`, `em`) instead of fixed units (`px`)
- Use **mobile-first** media queries (`min-width`)
- Avoid fixed widths and heights where possible
- Use **Flexbox** or **Grid** for layout over floats or absolute positioning

### CSS Best Practices: Performance

- Avoid unnecessary use of `!important`
- Minimize deeply nested rules
- Use shorthand properties where appropriate
- Avoid large unused CSS blocks; clean up unused styles

### CSS Best Practices: Accessibility

- Ensure high contrast between text and background
- Avoid using color alone to convey meaning
- Use `:focus` styles for interactive elements
- Ensure hover styles are also accessible via keyboard

### CSS Best Practices: Maintainability

- Stick to a design system or style guide
- Use mixins and functions if using SCSS
- Avoid inline styles and `style` attributes in HTML
- Consistently format CSS using a linter or formatter (use **Prettier** tool)
- Prefer one class per responsibility to promote reusability and testability

### CSS Best Practices: Animations & Transitions

- Use `transition` and `animation` with care; keep them performant
- Keep animation durations and delays consistent
- Use keyframes only when needed and name them clearly
- The Landing page (`/`) is the one Phase 1 surface with scroll/hover micro-interactions
  beyond `origin-ui`'s built-in component animations — it uses `framer-motion`
  (`motion.*` components, `whileInView` for scroll reveals,
  `MotionConfig reducedMotion="user"` wrapping the page in `LandingPage.tsx` so every
  animation respects the OS-level reduced-motion preference automatically). Elsewhere in
  the app, default to Tailwind transitions/CSS keyframes — don't pull `framer-motion`
  into non-landing surfaces without it being asked for explicitly

## JavaScript Best Practices

### JavaScript Best Practices: Syntax & Language Features

- Use `const` for values that never change and `let` for those that do; avoid using
  `var`
- Prefer **arrow functions** for callbacks and short functions, but use named functions
  when they improve readability or debugging
- Use **template literals** for string construction instead of concatenation
- Destructure objects and arrays for clarity and immutability
- Use **spread/rest operators** instead of `Object.assign()` or manual copying
- Favor **optional chaining (`?.`)** and **nullish coalescing (`??`)** for safe access
  and defaults
- Prefer **shorthand properties** and methods in object literals
- Always return early in functions to reduce nesting and improve readability

### JavaScript Best Practices: Code Style & Formatting

- Follow consistent indentation (4 spaces, project-dependent — use **Prettier** tool
  configuration)
- Use `camelCase` for variables, functions, and object properties
- End statements with semicolons
- Prefer **double quotes** for strings (enforce via **Prettier tool**)
- Avoid inline comments in complex logic; use block comments above logic blocks
- Use **ESLint** and **Prettier** with CI integration to enforce style consistently

### JavaScript Best Practices: Structure & Organization

- Group related constants, types, and utility functions into modules
- Keep functions pure and focused on a single responsibility (_SRP_)
- Organize files by feature or domain instead of file type in large applications
- Use named exports consistently to avoid ambiguity in import names
- Split large files into smaller modules when they exceed **~500 lines of code**
- Prefer colocating files (`index.js`, `styles.js`, `types.js`) in a folder per
  component or feature

### JavaScript Best Practices: Error Handling

- Always handle rejections in `async/await` and `Promise` chains
- Avoid empty `catch` blocks; log or throw a meaningful error
- Use `try/catch` where failure is expected, not as control flow
- Create custom error types for domain-specific cases

### JavaScript Best Practices: Naming Conventions

- Use meaningful, descriptive names for variables and functions
- Avoid abbreviations unless they're widely understood (`id`, `URL`, `API`)
- Use verbs for functions (`fetchData`, `calculateTotal`)
- Name booleans with prefixes like `is`, `has`, or `can` (e.g., `isActive`,
  `hasPermission`)
- Use plural names for arrays and collections (`users`, `items`)
- Constants should be in `UPPER_SNAKE_CASE` when they are exported or shared

### JavaScript Best Practices: Performance & Optimization

- Avoid unnecessary loops and recalculations; memoize expensive operations
- Use debounce/throttle on high-frequency DOM events (e.g., scroll, input)
- Minimize DOM manipulations and reflows
- Use `requestIdleCallback`, `requestAnimationFrame` for UI performance tuning

### JavaScript Best Practices: Maintainability

- Avoid magic numbers and hardcoded strings — use constants or enums
- Write reusable, **pure functions** and isolate side effects
- Favor declarative code over imperative code when possible
- Document complex logic using **JSDoc**
- Avoid mutable shared state — use factory functions or closures to encapsulate

### JavaScript Best Practices: Testing & Debugging

- Use **Vitest** + **React Testing Library** for unit/component tests, **MSW** to mock
  REST calls, and **Playwright** for E2E — this project enforces 100%
  statements/branches/functions/lines coverage via `coverage.thresholds`
  (`vite.config.ts`), matching the gate used in `syncboard_api`
- Write tests for edge cases and error paths, not just the _happy path_ — hooks/
  components touching the optimistic-move or socket-patch logic need both the success
  path and the rollback/error path covered
- The real-time contract (a card move in one browser context appearing in another) is
  only meaningfully verified via a two-browser-context Playwright scenario, not mocked
- Use mocks and spies carefully — overuse can reduce test clarity
- Avoid `console.log()` in production; use structured logging and levels
- Validate function arguments and return values in tests

### JavaScript Best Practices: Tooling & Ecosystem

- Use **npm** as a default package manager.
- Keep dependencies up-to-date using tools like `npm audit`.
- Use **Vite** with production optimization enabled
- Add `build`, `lint`, `test`, and `format` scripts to `package.json`
- `eslint.config.ts`'s flat-config TS loader needs the `jiti` devDependency (≥2.2.0) to
  load under Node — already installed at `^2.7.0` in `package.json`

### JavaScript Best Practices: Modern Features (ES6+)

- Use ES Modules (`import/export`) instead of `require`
- Prefer `Array.prototype.map`, `filter`, `reduce` for data transformation
- Use `Map`/`Set` over objects for collections with dynamic keys or guaranteed
  uniqueness
- Leverage `async/await` for clearer async flow
- Use `Promise.all` or `Promise.allSettled` for parallelism when tasks are independent
- Avoid deeply nested `.then()` chains — use `await` or flatten logic

### JavaScript Best Practices:: Anti-Patterns to Avoid

- Avoid deeply nested callbacks or Promises — use functions or early returns
- Don't mutate function parameters; always treat them as immutable
- Avoid using `this` in non-class functions
- Never extend native prototypes like `Array.prototype` or `Object.prototype`
- Don't rely on side effects to control function output
- Avoid global state

### JavaScript Best Practices: Security

- Sanitize and validate **all user inputs** before processing or storing
- Never use `eval()`, `Function()`, or dynamic `import()` with user input
- Avoid exposing sensitive keys or secrets in client-side code
- Configure **Content Security Policy (CSP)** headers to prevent XSS attacks
- Use HTTPS and modern authentication libraries
- Verify third-party dependencies and audit licenses

## TypeScript Best Practices

### TypeScript Best Practices: Type System

- Prefer interfaces over types for object definitions
- Use `type` for unions, intersections, and mapped types
- Avoid using `any`, prefer `unknown` for unknown types
- Use strict TypeScript configuration (`strict: true` in tsconfig.json)
- Leverage TypeScript's built-in utility types (`Partial`, `Pick`, `Omit`, `Record`,
  etc.)
- Use generics for reusable type patterns
- Use `readonly` for immutable properties
- Use discriminated unions for better type safety
- Use type guards and `in` checks for runtime type checking
- Prefer literal types and enums for limited sets of values

### TypeScript Best Practices: Naming Conventions

- Use PascalCase for type and interface names; do **not** prefix interfaces with `I`
  (prefer `Board`, not `IBoard`) — matches idiomatic modern TypeScript/React
- Use `camelCase` for variables, functions, and parameters
- Use `UPPER_CASE` for constants and enum members
- Use descriptive names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Prefix types for React props with 'Props' (e.g., `ButtonProps`)
- Name custom error types with the `Error` suffix (e.g., `NotFoundError`)

### TypeScript Best Practices: Code Organization

- Keep type definitions close to where they're used
- Export shared types and interfaces from dedicated type files
- Use barrel exports (`index.ts`) to simplify import paths
- Group related types in a `types/` directory
- Co-locate component props/types with the components
- Avoid circular imports by structuring modules clearly

### TypeScript Best Practices: Functions

- Use explicit return types for all public functions and methods
- Prefer arrow functions for callbacks and inline handlers
- Use function overloads to handle multiple type scenarios
- Prefer `async/await` over raw Promises for readability
- Implement custom error types and return them instead of strings
- Avoid deeply nested functions; extract logic to named helpers

### TypeScript Best Practices: Imports & Dependencies

- Use absolute imports for shared modules and aliases (`@/components`, `@/utils`, etc.)
- Group imports: external → internal → relative
- Avoid default exports in shared codebases, prefer named exports
- Prefer tree-shakable libraries and modern ESM-compatible packages
- Keep import statements ordered and clean

### TypeScript Best Practices: Linting & Formatting

- Use ESLint with `@typescript-eslint` plugin
- Enforce `no-explicit-any`, `no-non-null-assertion`, and `no-unused-vars`
- Use Prettier for automatic code formatting
- Add **Husky** to run linters, formatters, type-check, and tests before commits
- Format and lint code automatically in CI

### TypeScript Best Practices: Error Handling

- Create custom error types for domain-specific errors
- Use `Result` or `Either` types for recoverable errors
- Implement proper error boundaries in React
- Use typed `try/catch` with `instanceof` checks
- Handle Promise rejections using `.catch` or `try/catch`

### TypeScript Best Practices: Testing

- Use **Vitest** (with `@testing-library/react`) — this project's chosen test runner,
  not Jest
- Avoid using `any` in test files; type mock data and props
- Prefer integration tests that simulate real usage
- Use `typescript-eslint` rules to catch unsafe type usage
- Keep type safety when mocking with `vi.mock`/`vi.fn<...>()`

### TypeScript Best Practices: Documentation & Comments

- Use TSDoc to document public APIs and complex types
- Add comments to explain complex type transformations
- Avoid unnecessary inline comments for obvious types
- Keep documentation in sync with type updates

### TypeScript Best Practices: Tooling & Automation

- Use `tsc --noEmit` in CI to ensure type safety
- Automate linting and formatting with Git hooks and CI checks
- Use `ts-prune` or `typescript-unused-exports` to remove unused types

### TypeScript Best Practices: Patterns

- Use the Builder pattern for complex object construction
- Use the Factory pattern for controlled object creation
- Use the Repository pattern for abstracting data access
- Use the Module pattern for encapsulated logic
- Leverage dependency injection in services or utilities
- Prefer composition over inheritance in business logic and components

### TypeScript Best Practices: Performance Considerations

- Avoid deeply nested types or overly complex generics
- Simplify unions when possible
- Use indexed access types cautiously
- Avoid unnecessary runtime type checking for fully trusted inputs

## React Best Practices

### React Best Practices: Component Structure

- Use functional components over class components
- Always use named functions when creating function components
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over inheritance
- When the project uses Typescript, implement prop types with a name following by the
  `Props` term.
- Split large components into smaller, focused ones

### React Best Practices: Hooks

- Follow the Rules of Hooks
- Use custom hooks for reusable logic
- Keep hooks focused and simple
- Use appropriate dependency arrays in `useEffect`
- Implement cleanup in `useEffect` when needed
- Avoid nested hooks

### React Best Practices: State Management

- Server state (boards/lists/cards) lives in **TanStack Query**, patched directly by
  incoming socket events via `queryClient.setQueryData` — never treat a socket event as
  a signal to refetch the whole board (see
  [State Management & Real-Time Sync](#state-management--real-time-sync-tanstack-query))
- **No separate global client-state library** (no Redux/Zustand/Jotai) — ephemeral UI
  state (open modal, active drag) stays local to the component or a lightweight
  `stores/` module (plain hooks/Context, not a global store library); URL state (open
  card, filters) lives in TanStack Router search params, not component state
- Use `useState` for local component state
- Implement `useReducer` for complex local state logic
- Use Context API sparingly, for state genuinely shared by a subtree (e.g. current
  board's `DndContext`), not as a substitute for TanStack Query or router search params
- Keep state as close to where it's used as possible; avoid prop drilling

### React Best Practices: Performance

- Implement proper memoization (`useMemo`, `useCallback`)
- Use **React memo** for expensive components
- Avoid unnecessary re-renders
- Implement proper lazy loading
- Use proper key props in lists
- Profile and optimize render performance

### React Best Practices: Forms

- Use controlled components for form inputs
- Implement proper form validation
- Handle form submission states properly
- Show appropriate loading and error states
- Use form libraries for complex forms
- Implement proper accessibility for forms
- When working with forms, create a new file called `zod` and use **Zod** for validation
  and schemas
- Use the `useForm` hook (e.g. from **React Hook Form**) with Zod for better integration

### React Best Practices: Error Handling

- Implement Error Boundaries
- Handle async errors properly
- Show user-friendly error messages
- Implement proper fallback UI
- Log errors appropriately
- Handle edge cases gracefully

### React Best Practices: Testing

- Write unit tests for components
- Implement integration tests for complex flows
- Use **React Testing Library**
- Test user interactions
- Test error scenarios
- Implement proper mock data

### React Best Practices: Accessibility

- Use semantic HTML elements
- Implement proper **ARIA attributes**
- Ensure keyboard navigation
- Test with screen readers
- Handle focus management
- Provide proper alt text for images

### React Best Practices: Code Organization

- Group related components together
- Use proper file naming conventions
- Implement proper directory structure
- Keep styles close to components
- Use proper imports/exports
- Document complex component logic

### React Best Practices: Data Fetching

- Use **TanStack Query** for all async data fetching — no ad hoc `useEffect` + `fetch`
- Co-locate query hooks in `hooks/` (e.g. `useBoardQuery.ts`), not inline in components
  — components stay easy to test with plain props (see
  [Component Structure](../MASTERPLAN.md#6-component-structure))
- Handle loading, error, and empty states for data queries explicitly
- Query keys should include the board/workspace ID they're scoped to (e.g.
  `["board", boardId]`) so socket-driven `setQueryData` calls can target the right cache
  entry

### React Best Practices: Additional Code Quality

- Use **ESLint** and **Prettier** with a shared configuration for consistent code style
- Use absolute imports with module aliases (e.g. `@/components/Button`)
- Avoid magic values and define constants for configuration and enums
- Prefer explicit types over implicit inference in exported functions
- Avoid side effects inside components.
- Keep components pure
- Use environment variables via `.env` files with proper validation
- Review and prune unused dependencies regularly

## Tailwind CSS Best Practices

### Tailwind CSS Best Practices: Project Setup

- This project is Vite-based (no Next.js) — configure Tailwind **v4**'s CSS-first config
  (`@import "tailwindcss"` + `@theme` in `src/index.css`), not a
  `tailwind.config.js`-driven v3 setup
- See the official Tailwind CSS docs for current Vite plugin installation steps

### Tailwind CSS Best Practices: Component Styling

- Use utility classes over custom CSS
- Use proper responsive design utilities
- Implement dark mode properly
- Use proper state variants
- Keep component styles consistent

### Tailwind CSS Best Practices: Layout

- Use Flexbox and Grid utilities
- Use container queries when needed
- Implement responsive breakpoints

### Tailwind CSS Best Practices: Colours

- Use semantic color naming and avoid defining custom colours ad hoc
- Use only the colour tokens defined in `src/index.css`'s `@theme` block, sourced from
  [`DESIGN.md`](./DESIGN.md) (e.g. `surface`, `on-surface`, `primary`,
  `secondary-container`, ...) — never a raw hex value in a component

### Tailwind CSS Best Practices:: Responsive Design

- Use mobile-first approach

### Tailwind CSS Best Practices: Performance

- Minimize custom CSS
- Optimize for production

### Tailwind CSS Best Practices:: Best Practices

- Follow naming conventions
- Keep styles organized
- Use proper documentation
- Implement proper testing
- Follow accessibility guidelines

## TanStack Router Best Practices

### TanStack Router Best Practices: Project Structure

- Place all route definitions in `src/routes/` directory
- Use the file-based routing convention with `__root.tsx` as the root layout
- Organize routes hierarchically to match URL structure
- Co-locate route-specific components with their route files when appropriate
- Use `index.tsx` for index routes within directories

### TanStack Router Best Practices: Route Configuration

- Define routes using `createFileRoute` for file-based routing
- Use `createRootRoute` for the root layout component
- Implement proper TypeScript types for route params and search params
- Use `validateSearch` with Zod schemas for type-safe search params
- Define `loader` functions for data fetching at the route level

### TanStack Router Best Practices: Navigation

- Use `<Link>` component for declarative navigation
- Use `useNavigate` hook for programmatic navigation
- Implement `activeProps` for active link styling
- Use `preload` prop on links for better perceived performance
- Handle navigation state with `useRouter` hook

### TanStack Router Best Practices: Data Loading

- Use route loaders for data fetching before render
- Implement `pendingComponent` for loading states
- Use `errorComponent` for error handling at route level
- Leverage `staleTime` and caching options for performance
- Integrate with TanStack Query for complex data requirements

### TanStack Router Best Practices: Type Safety

- Export route types for use in components
- Use `RouteApi` for accessing typed route context
- Define strict types for all route params and search params
- Use `Link` component's type inference for route validation
- Leverage TypeScript's inference for loader data types

### TanStack Router Best Practices: Code Splitting

- Use lazy route loading for large route components
- Implement route-level code splitting with dynamic imports
- Use `lazyRouteComponent` for deferred component loading
- Balance between bundle size and loading performance

## State Management & Real-Time Sync (TanStack Query)

There is no Firebase, GraphQL subscription layer, or polling in this project — all
server state and real-time updates flow through **TanStack Query**, kept live by a
single `socket.io-client` connection to `syncboard_api`.

### Real-Time Sync: Socket Lifecycle

- Create/connect the socket in `lib/socket.ts` as a singleton factory, not per-component
- `useSocket.ts` joins the currently open board's room
  (`socket.emit("board:join", ...)`) in a `useEffect`, and tears down listeners
  (`socket.off(...)`) in the cleanup function
- Pass the access token via the Socket.io handshake `auth` payload — never as a query
  string param that could leak into logs
- One connection per open board, not one per component that needs board data

### Real-Time Sync: Cache Patching

- Incoming socket events (`card:updated`, `board:user-presence`, ...) write directly
  into the TanStack Query cache via `queryClient.setQueryData(["board", boardId], ...)`
  — **never** call `invalidateQueries`/refetch the whole board in response to a socket
  event; that causes visible loading flicker and disrupts in-progress local interactions
  (an open modal, an in-flight drag)
- Write a small, pure `patchCard`/`patchList` helper per event type so the "my own drag"
  and "a teammate's drag" code paths converge on the same patch function
- `board:user-presence` currently exposes `email` only (no `name`/`avatarUrl` yet) —
  render presence avatars from email initials until the backend adds those fields; see
  [`MASTERPLAN.md` §8.1](./MASTERPLAN.md#81-socket-connection-lifecycle)

### Optimistic Drag-and-Drop (`@dnd-kit` + TanStack Query mutations)

- `onDragEnd` computes the new fractional/LexoRank `order` (matching the backend's
  scheme — never re-derive integer indexing client-side) and writes the optimistic
  result into the cache immediately
- The mutation's `onMutate` snapshots the pre-drag cache state; `onError` rolls back to
  that snapshot — an optimistic update must never be left unreconciled on failure
- The same `PATCH /cards/:id` mutation both persists the move and lets `onSuccess`
  reconcile with the server response if it differs from the optimistic guess

### Authentication & Token Handling

- Access token is attached to every REST call via an Axios request interceptor
  (`lib/api.ts`) and passed in the Socket.io handshake `auth` payload — never stored in
  component state or read from `localStorage` ad hoc outside that one interceptor
- The refresh token is an **HttpOnly cookie** — the frontend never reads or stores it in
  JS; the Axios instance needs `withCredentials: true` for the silent-refresh flow
  (`POST /auth/refresh`) to work
- A response interceptor catches `401`s, calls the refresh endpoint once, retries the
  original request, and redirects to `/login` only if the refresh itself fails — don't
  reimplement this per-hook
- Protected routes are guarded in TanStack Router's `beforeLoad`, not by conditionally
  rendering UI in a component — this prevents any protected loader (and thus any board
  data request) from running before the session check completes

### Input Sanitization

- Rich-text editor output (card descriptions) must be sanitized before being rendered
  anywhere else (e.g. activity feed previews) to prevent stored-XSS
- Mirror the backend's Zod validation client-side for fast feedback, but never treat
  client-side validation as authoritative

## `origin-ui` Component Best Practices

This project uses **`origin-ui`** (a Shadcn/ui-based component set with built-in
micro-interactions), not raw `shadcn/ui` — components are still Radix-primitive-based
and copied into the repo rather than installed as an opaque dependency, so the same
composition-over-modification discipline applies.

### `origin-ui` Best Practices: Component Organization

- Store all `origin-ui` primitives in `src/components/ui/`
- Keep primitives close to their upstream `origin-ui` form when possible, for easy
  updates
- Create wrapper components (in `components/board`, `components/layout`, etc.) for
  project-specific behavior instead of editing the primitive in place

### `origin-ui` Best Practices: Composition Patterns

- Compose board/layout/card-modal UI from `components/ui` primitives
- Use a `cn()` utility for conditional Tailwind class merging
- Extend components through composition, not modification:

  ```typescript
  // Good: Wrapper component
  function PrimaryButton({ children, ...props }: ButtonProps) {
    return <Button variant="default" size="lg" {...props}>{children}</Button>;
  }
  ```

### `origin-ui` Best Practices: Accessibility

- `origin-ui`/Radix primitives ship with a11y semantics — leverage them rather than
  reimplementing focus/keyboard handling
- Always provide proper labels for form components
- Use `Dialog`/`AlertDialog`-style primitives for modal interactions (e.g. the card
  detail modal)
- Implement proper focus management, especially for the card detail modal opening from a
  board card
- Test keyboard navigation for all interactive components, including drag-and-drop
  (covered by `@dnd-kit`'s built-in accessible sensors)

### `origin-ui` Best Practices: Theming

- This project uses a self-hosted `origin-ui` instance
  (<https://originui.moliveda.dev/>) themed to SyncBoard's "Warm Professionalism" system
  — bone/clay surfaces, deep-teal primary, `Space Grotesk` typography — not the upstream
  default theme
- Define theme variables in `src/index.css` as Tailwind v4 `@theme` tokens, transcribed
  directly from [`DESIGN.md`](./DESIGN.md)'s token table (colors, typography scale,
  `rounded` scale, `spacing` scale) — `DESIGN.md` is the source of truth;
  `src/index.css` is its Tailwind implementation, not a place to invent new values
- Use CSS custom properties for colors and spacing
- Implement dark mode using Tailwind's `dark` class strategy if/when dark mode is added
  (`DESIGN.md`'s "Dark Mode Strategy" already specifies the surface/border inversion
  approach)
- Keep theme tokens consistent across `origin-ui` primitives and any custom components

### `origin-ui` Best Practices: Forms Integration

- If a form primitive/library is introduced, pair it with **Zod** schemas that mirror
  the backend's validation (see
  [Authentication & Token Handling](#authentication--token-handling))
- Handle form states (loading, error, success) consistently across auth forms
  (login/register/forgot-password) and the card detail modal's inline edits

## Vite Best Practices

### Vite Best Practices: Configuration

- Configure path aliases in `vite.config.ts` for clean imports:

  ```typescript
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
  ```

- Use environment variables with `VITE_` prefix
- Configure proper build output for production
- Enable source maps only in development

### Vite Best Practices: Development

- Use HMR (Hot Module Replacement) for fast development
- Configure `server.host` for Docker compatibility
- Use `server.proxy` for API proxying during development
- Enable `server.watch.usePolling` for Docker on some systems

### Vite Best Practices: Build Optimization

- Configure manual chunks for better caching:

  ```typescript
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router", "@tanstack/react-query"],
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable"],
        },
      },
    },
  }
  ```

- Use dynamic imports for code splitting
- Analyze bundle size with `rollup-plugin-visualizer`
- Optimize dependencies with `optimizeDeps` configuration

### Vite Best Practices: Environment Variables

- Define all env vars in `.env.example` for documentation
- Use `.env.local` for local overrides (gitignored)
- Access variables via `import.meta.env.VITE_*`
- Validate required env vars at application startup

## Git Workflow & Commit Conventions

### Git Workflow & Commit Conventions: Gitmoji Commit Format

- Use **Gitmoji** for all commit messages (enforced by Husky), matching the convention
  used in the sibling `syncboard_api` repo
- Format: `:<emoji_code>: <commit message>`
- Keep commit messages clear, concise, and descriptive
- Use imperative mood ("Add feature" not "Added feature")
- First letter after emoji must be capitalized
- Do not end commit message with a period
- Common Gitmoji patterns for this project:
  - `:sparkles:` - Add new features
  - `:bug:` - Fix bugs
  - `:fire:` - Remove code or files
  - `:memo:` - Add or update documentation
  - `:recycle:` - Refactor code
  - `:zap:` - Improve performance
  - `:lock:` - Fix security issues
  - `:white_check_mark:` - Add or update tests
  - `:construction:` - Work in progress
  - `:wrench:` - Add or update configuration files
  - `:package:` - Add or update dependencies
  - `:rocket:` - Deploy stuff
  - `:art:` - Improve structure/format of code
  - `:lipstick:` - Update UI and style files

### Git Workflow & Commit Conventions: Commit Message Examples

```bash
# Good examples
:sparkles: Add user authentication flow
:bug: Fix token refresh infinite loop
:memo: Update API documentation
:recycle: Refactor note editor component
:white_check_mark: Add integration tests for AI hooks
:wrench: Configure Docker compose for dev
:lipstick: Improve dashboard responsiveness

# Bad examples (avoid these)
:sparkles: add feature          # Not capitalized
:bug: Fix bug.                  # Period at end
sparkles: Add feature           # Missing colons
Add new feature                 # Missing gitmoji
```

### Git Workflow & Commit Conventions: GitFlow Branching Strategy

Branches map directly to deploy environments (see
[`MASTERPLAN.md` §12.1](./MASTERPLAN.md#121-gitflow-branch--environment-mapping)):

| Branch/Trigger | Environment | Notes                                                         |
| -------------- | ----------- | ------------------------------------------------------------- |
| `feature/*`    | Local only  | Manual; not auto-deployed                                     |
| `develop`      | Development | Auto-deploy on push                                           |
| `release/*`    | Staging     | Auto-deploy on push                                           |
| Pull request   | Preview     | Ephemeral deploy on open/update; talks to the Development API |
| `main`         | Production  | Manual dispatch                                               |

- Branch naming conventions:
  - `feature/optimistic-card-drag` - Feature branches
  - `bugfix/token-validation` - Bug fix branches (non-urgent)
  - `hotfix/security-patch` - Urgent production fixes, branched from `main`
  - `release/v1.0.0` - Release branches, branched from `develop`, deploy to Staging

### Git Workflow & Commit Conventions: Husky Pre-commit Hooks

- Husky is wired up and functional — hooks run automatically before commits, not just
  configured-but-inert
- Pre-commit hook runs:
  - ESLint for code quality (`npm run lint`)
  - Prettier format check (`npm run format:check`)
  - TypeScript type check (`npm run type-check`)
  - Unit tests (`npm run test`)
- Commit-msg hook validates Gitmoji format
- If hooks fail, fix issues before committing
- Never bypass hooks with `--no-verify` unless absolutely necessary

### Git Workflow & Commit Conventions: Pull Request Guidelines

- Create PRs from feature branches to `develop`
- Use descriptive PR titles with Gitmoji
- Include detailed description of changes
- Reference related issues (e.g., "Closes #123")
- Ensure all tests pass before requesting review
- Address review comments promptly

### Git Workflow & Commit Conventions: Best Practices

- Commit frequently with small, focused changes
- Write meaningful commit messages
- Never commit sensitive data (API keys, secrets, `.env` files)
- Keep commits atomic (one logical change per commit)
- Test locally before committing
- Pull latest changes before starting new work
- Resolve merge conflicts carefully
- Use `.gitignore` to exclude build artifacts and dependencies

## Docker Best Practices

This project uses **one multi-stage `Dockerfile`** and **one `docker-compose.yml`** —
not per-environment Dockerfiles or compose override files. Don't reintroduce
`Dockerfile.dev`/`Dockerfile.prod` or `docker-compose.override/staging/prod.yml` splits;
they don't match this project's already-built setup.

### Docker Best Practices: Dockerfile Stages

`Dockerfile` has three stages:

1. **`builder`** — `node:24-alpine`; `npm ci`, copies source, accepts `VITE_*` build
   args (`VITE_API_BASE_URL`, `VITE_SOCKET_URL`, `VITE_APP_ENV`) as `ENV` so Vite bakes
   them into the bundle, runs `npm run build`
2. **`production`** — `nginx:alpine`; copies `nginx.conf` (public, no auth) and the
   `builder` stage's `dist/`. Used for the **Production** environment only:
   `docker build --target production ...`
3. **`protected`** — `nginx:alpine`; installs `apache2-utils`, accepts `AUTH_USERNAME`/
   `AUTH_PASSWORD` build args, generates `/etc/nginx/.htpasswd` via `htpasswd -cb`
   during the build, and copies `nginx.protected.conf` (HTTP Basic Auth, `/health`
   excluded so Cloud Run health checks keep working). Used for **Preview/Development/
   Staging**:
   `docker build --target protected --build-arg AUTH_USERNAME=... --build-arg AUTH_PASSWORD=... ...`

`AUTH_USERNAME`/`AUTH_PASSWORD` are Docker **build-time** secrets only — never put them
in `.env`/`.env.example`, and never bake them into the `production` target.

### Docker Best Practices: docker-compose.yml (Local Dev)

- Local dev runs via **Docker by default** — before starting a dev server for local
  iteration or browser verification, check whether the Docker daemon is running
  (`docker info`, non-zero exit if it isn't reachable) and prefer `docker compose up`
  when it is; fall back to `npm run dev` directly on the host only when Docker isn't
  available. See `CLAUDE.md`'s Commands section for the full policy — this isn't a
  toss-up between two equally valid options
- `docker-compose.yml` builds the `builder` stage only (`target: builder`), bind-mounts
  `src/`, `index.html`, `vite.config.ts`, `tsconfig.json` for hot-reloading, and runs
  `npm run dev -- --host 0.0.0.0` — it does not exercise the `production`/`protected`
  Nginx stages; those are validated via a manual `docker build --target ...` or in CI
- `VITE_API_BASE_URL`/`VITE_SOCKET_URL`/`VITE_APP_ENV` are passed through from the
  host's `.env` via `environment:` — same variables as native `npm run dev`, just
  containerized

#### Common commands

- **Run (foreground):** `docker compose up --build`
- **Run (detached):** `docker compose up -d`
- **Stop all:** `docker compose down`
- **Shell into the running container:** `docker compose exec app sh` (Alpine-based — use
  `sh`, not `bash`)
- **Build a production image locally:**
  `docker build --target production -t syncboard-web .`
- **Build a protected (Basic Auth) image locally:**
  `docker build --target protected --build-arg AUTH_USERNAME=dev --build-arg AUTH_PASSWORD=dev -t syncboard-web:protected .`
