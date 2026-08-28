# 🗂️ SyncBoard Web — MASTERPLAN

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Architecture](#3-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Routes & Pages](#5-routes--pages)
6. [Component Structure](#6-component-structure)
7. [State Management](#7-state-management)
8. [Real-Time & Drag-and-Drop Integration](#8-real-time--drag-and-drop-integration)
9. [Security & Authentication](#9-security--authentication)
10. [Development Environment](#10-development-environment)
11. [Testing Strategy](#11-testing-strategy)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Development Phases](#13-development-phases)

---

## 1. Executive Summary

**SyncBoard Web** is the frontend for a real-time collaborative Kanban board. It renders
Workspaces, Boards, Lists, and Cards; supports drag-and-drop reordering with an
optimistic UI; and reflects every teammate's changes live via a Socket.io connection to
`syncboard_api`.

### Key Features

- **Modern React architecture:** React 19 + Vite + TypeScript
- **Type-safe routing:** TanStack Router with loaders and protected route guards
- **Efficient server-state management:** TanStack Query, patched directly by incoming
  socket events instead of polling
- **Optimistic drag-and-drop:** `@dnd-kit`, with instant UI feedback and rollback on API
  failure
- **Live presence:** avatars + green dots for everyone currently viewing a board

### Repository Information

```text
m-oliveda/syncboard_web
├── React 19 + Vite + TypeScript
├── TanStack Router + TanStack Query
├── Tailwind CSS + origin-ui + Lucide Icons
└── @dnd-kit + socket.io-client
```

### Business Value

- **For Users:** collaboration feels instant — no refresh button, no stale board.
- **For Developers:** demonstrates optimistic UI patterns, real-time cache
  synchronization, and type-safe routing at production quality.
- **For Portfolio:** a visually complete, interactive product surface — the natural
  companion piece to the backend's distributed-systems story.

---

## 2. Project Overview

### 2.1 Vision

Deliver a responsive, fast, and pleasant-to-use Kanban interface where the mechanics of
real-time sync are invisible to the user — things just update, without spinners or
manual refresh.

### 2.2 Target Users

- **Small, distributed teams** coordinating work asynchronously across time zones
- **Reviewers/prospective employers** evaluating frontend architecture and UX polish

### 2.3 Core User Interfaces

Full Phase 1 page inventory, mapped against the
[SyncBoard Stitch project](https://stitch.withgoogle.com/projects/6668508160005015741)
and the `origin-ui`-based design system documented in [`DESIGN.md`](./DESIGN.md):

1. **Landing Page** — product pitch, feature highlights, a 3-step "how it works"
   section, an FAQ, and a dark-surface CTA section, with scroll/hover micro-interaction
   animation (the only page in Phase 1 scope with motion beyond `origin-ui`'s built-in
   component interactions). Uses `framer-motion` for entrance stagger, scroll-triggered
   reveals (`whileInView`), and the hero's looping drag-and-drop demo animation, wrapped
   in `MotionConfig reducedMotion="user"` so it respects the OS motion preference;
   elsewhere in the app, default to Tailwind transitions/CSS keyframes rather than
   pulling in a motion library
2. **Auth Pages** — login, register, forgot password
3. **Legal Pages** — Terms of Service & Privacy Policy, long-form static content
4. **Dashboard** — Workspace sidebar, Board grid, "Create Board" action, Members panel
   for inviting teammates and managing Admin/Member roles
5. **Product Roadmap** — a pre-populated example board demonstrating SyncBoard used for
   roadmap planning; reuses the same Board Canvas/List/Card primitives as the Active
   Board, seeded with static demo data instead of a live workspace
6. **Active Board** — the core Kanban canvas: Lists, Cards, drag-and-drop, presence
   header
7. **Card Detail Modal** — rich-text description, checklist with progress bar, chat-like
   activity feed

Exact copy, imagery, and the favicon/logo asset live in the Stitch project — treat this
list as the structural contract; confirm visual detail against Stitch/`DESIGN.md` before
implementing each page.

### 2.4 Non-Goals (Out of Scope)

- ❌ Native mobile apps (responsive web only)
- ❌ Offline-first architecture / service-worker caching of board state
- ❌ Server-side rendering (pure client-rendered SPA)
- ❌ Multi-board bulk operations (e.g. cross-board card move) in v1

---

## 3. Architecture

### 3.1 High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        USER DEVICES                              │
│              (Web Browsers: Chrome, Firefox, Safari)              │
└───────────────────────────────┬───────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE CLOUD RUN                              │
│         syncboard-web service (Nginx + static SPA bundle)          │
│    React 19 · TanStack Router/Query · Tailwind · dnd-kit            │
└───────────────────────────────┬───────────────────────────────────┘
             │                                          ▲
             │ REST (Axios)                              │ WebSockets
             ▼                                            │ (socket.io-client)
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE CLOUD RUN                              │
│           syncboard-api service (Express + Socket.io)              │
└─────────────────────────────────────────────────────────────────┘
```

The frontend is a pure client — it never talks to MongoDB or Redis directly. All data
access, including real-time events, is mediated by the API.

### 3.2 Optimistic UI Data Flow (Card Move)

```text
1. User drags Card A from "To Do" to "In Progress"
2. dnd-kit fires onDragEnd → local TanStack Query cache is updated immediately
   (card now renders in the new list, in the new position)
3. A mutation fires: PATCH /api/v1/cards/:id { listId, order }
   AND socket emits card:moved (server persists on receipt of either)
4. If the request succeeds: no visible change — the optimistic state was correct
5. If the request fails: the mutation's onError rolls the cache back to the
   pre-drag snapshot, and the card visibly snaps back
6. Other clients receive card:updated over the socket and patch their own cache —
   no refetch required
```

### 3.3 Real-Time Cache Patching

Rather than treating Socket.io as a signal to refetch, incoming events write directly
into the TanStack Query cache via `queryClient.setQueryData`, keyed by board ID. This
keeps the update path for "my own drag" and "a teammate's drag" nearly identical — both
ultimately flow through the same cache-patch function.

---

## 4. Technology Stack

### 4.1 Core

| Category       | Technology | Purpose                       |
| :------------- | :--------- | :---------------------------- |
| **Framework**  | React 19   | UI library                    |
| **Build Tool** | Vite       | Dev server + production build |
| **Language**   | TypeScript | Type safety                   |

### 4.2 Routing & State

| Category             | Technology         | Purpose                                             |
| :------------------- | :----------------- | :-------------------------------------------------- |
| **Routing**          | TanStack Router    | Type-safe routes, loaders, protected route guards   |
| **Server State**     | TanStack Query     | Fetching, caching, and socket-driven cache patching |
| **HTTP Client**      | Axios              | REST calls with JWT interceptor + refresh flow      |
| **Real-Time Client** | `socket.io-client` | WebSocket connection, scoped per open board         |

### 4.3 UI & Interaction

| Category        | Technology                            | Purpose                                            |
| :-------------- | :------------------------------------ | :------------------------------------------------- |
| **Styling**     | Tailwind CSS                          | Utility-first styling                              |
| **Components**  | `origin-ui`                           | Shadcn/ui-based components with micro-interactions |
| **Icons**       | Lucide React                          | Icon set                                           |
| **Motion**      | `framer-motion`                       | Landing page entrance/scroll animation only        |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Accessible drag-and-drop for cards/lists           |

### 4.4 Design System

[`DESIGN.md`](./DESIGN.md) is the single source of truth for design tokens — colors,
`Space Grotesk` typography scale, 4px-baseline spacing, and the "Soft-Geometric" radii
scale (10px standard / 14px containers / 18px dialogs). It's implemented as Tailwind
v4's CSS-first `@theme` tokens in `src/index.css` (see
[Tailwind CSS Best Practices](./AGENTS.md#tailwind-css-best-practices-project-setup) in
`AGENTS.md`), not hardcoded per-component. `origin-ui` components
(<https://originui.moliveda.dev/>) are the component primitives layered on top of those
tokens. Don't introduce ad hoc colors, fonts, or radii outside this token set.

### 4.5 Development Tools

| Category        | Technology                     | Purpose                                         |
| :-------------- | :----------------------------- | :---------------------------------------------- |
| **Testing**     | Vitest + React Testing Library | Unit/component testing (100% coverage enforced) |
| **API Mocking** | MSW                            | Mock REST responses in tests                    |
| **E2E**         | Playwright                     | Browser automation, multi-tab sync tests        |
| **Linting**     | ESLint                         | Code quality                                    |
| **Formatting**  | Prettier                       | Consistent formatting                           |
| **Git Hooks**   | Husky                          | Enforce lint/format/commit-msg on commit        |

---

## 5. Routes & Pages

| Route                  | Type            | Component / Purpose                                        |
| ---------------------- | --------------- | ---------------------------------------------------------- |
| `/`                    | Public          | Landing page — pitch, feature highlights, animated CTA     |
| `/login`               | Public (unauth) | Login form                                                 |
| `/register`            | Public (unauth) | Registration form                                          |
| `/forgot-password`     | Public (unauth) | Password-reset trigger                                     |
| `/reset-password`      | Public (unauth) | Completes a password reset; `?token=` from the reset email |
| `/terms`               | Public          | Terms of Service (static content)                          |
| `/privacy`             | Public          | Privacy Policy (static content)                            |
| `/roadmap`             | Public          | Product Roadmap — example board, static demo data          |
| `/app`                 | Protected       | Home app shell: Workspace sidebar + Board grid             |
| `/app/boards/:boardId` | Protected       | Active board — the Kanban canvas                           |

### 5.1 Protected Route Guarding

TanStack Router's `beforeLoad` hook checks for a valid session (access token present and
not expired) before entering any `/app/*` route, redirecting to `/login` otherwise. This
runs at the router level, not inside individual components, so there's no
flash-of-protected-content before redirect.

### 5.2 Active Board Layout

```text
+-----------------------------------------------------------------------------------+
| [Logo] SyncBoard   | Active Users: (A) (B) (C)          [User Profile v] [Logout] |
+-----------------------------------------------------------------------------------+
|  +-------------------+   +-------------------+   +-------------------+           |
|  | TO DO         (+) |   | IN PROGRESS   (+) |   | DONE          (+) |           |
|  +-------------------+   +-------------------+   +-------------------+           |
|  | [Card 1]          |   | [Card 3]          |   | [Card 5]          |           |
|  | [Card 2]          |   | [Card 4]          |   |                   |           |
|  +-------------------+   +-------------------+   +-------------------+           |
|  | + Add a card      |   | + Add a card      |   | + Add a card      |           |
|  +-------------------+   +-------------------+   +-------------------+           |
+-----------------------------------------------------------------------------------+
```

### 5.3 Card Detail Modal

Opens as an overlay when a card is clicked (route-driven, e.g.
`/app/boards/:boardId?card=:cardId`, so it's deep-linkable and shareable):

- Rich-text editor for the description — wired to `PATCH /cards/:cardId` (Phase 2)
- Checklist with a progress bar — wired to `PATCH /cards/:cardId` (Phase 2); the API
  models it as a flat `{ text, done }[]` on the card with no per-item id, so items are
  addressed by array index and every toggle/add replaces the whole array
- Chat-like activity feed ("Mauricio moved this card to Done") — **still mock data**;
  `GET /cards/:cardId/activity` is documented in `api/README.md` but has no
  model/service/route implemented yet (see `api/MASTERPLAN.md` §6.3). Paginated, loading
  older entries on scroll rather than fetching the full history at once, is the target
  design once that endpoint exists.

---

## 6. Component Structure

```text
src/
├── components/
│   ├── ui/                    # origin-ui primitives (Button, Dialog, Avatar, ...)
│   ├── marketing/
│   │   ├── Hero.tsx              # Landing page hero, framer-motion entrance + demo
│   │   ├── FeatureHighlights.tsx
│   │   ├── HowItWorks.tsx          # 3-step "how it works" section
│   │   ├── FaqSection.tsx            # FAQ accordion (vendored origin-ui Accordion)
│   │   └── CtaSection.tsx              # Dark-surface CTA footer
│   ├── legal/
│   │   └── LegalDocument.tsx         # Shared layout for Terms of Service / Privacy Policy
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── PresenceHeader.tsx  # Active user avatars (email-initials today) + green dots
│   ├── board/
│   │   ├── BoardCanvas.tsx      # Horizontal scroll container, DndContext
│   │   ├── List.tsx              # SortableContext per list
│   │   ├── Card.tsx                # Draggable card item
│   │   └── AddCardInput.tsx
│   ├── card-modal/
│   │   ├── CardDetailModal.tsx
│   │   ├── RichTextEditor.tsx
│   │   ├── Checklist.tsx
│   │   └── ActivityFeed.tsx        # Paginated — loads older entries on scroll
│   └── workspace/
│       └── MembersPanel.tsx          # Invite/add a member, change/remove Admin/Member role
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts             # Connects/disconnects socket per active board
│   ├── useBoardQuery.ts           # TanStack Query hook for board state
│   └── useOptimisticMove.ts         # dnd-kit onDragEnd → cache patch + mutation
├── lib/
│   ├── api.ts                       # Axios instance, interceptors
│   └── socket.ts                       # socket.io-client factory
├── routes/                                # TanStack Router route tree
├── stores/                                  # Client-only UI state (open modals, filters)
└── types/                                     # Shared TS types (Board, List, Card, ...)
```

Presentational components (`components/ui`, `components/board`) stay free of data
fetching — all TanStack Query/socket wiring lives in `hooks/`, keeping components easy
to test with plain props.

---

## 7. State Management

| State category                                   | Tool                                                           | Rationale                                                                                                                                            |
| ------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server state (boards/lists/cards)**            | TanStack Query                                                 | Caching, background refetch, and the socket-patch integration point                                                                                  |
| **Auth session**                                 | Module-level store (`lib/auth-session.ts`) + Axios interceptor | There's no `/auth/me` endpoint to back a real query — the in-memory access token is the only source of truth; refresh is transparent to feature code |
| **Ephemeral UI state (open modal, active drag)** | Local component state / lightweight store                      | No need for global state outside server data                                                                                                         |
| **URL state (open card, filters)**               | TanStack Router search params                                  | Deep-linkable, shareable, back-button friendly                                                                                                       |

No separate global client-state library is introduced — TanStack Query covers server
state, and UI state that doesn't need to survive a route change stays local to the
component that owns it.

---

## 8. Real-Time & Drag-and-Drop Integration

### 8.1 Socket Connection Lifecycle

```typescript
// hooks/useSocket.ts (sketch)
useEffect(() => {
  const socket = getSocket(); // singleton, authenticated with the access token
  socket.emit("board:join", { boardId });

  socket.on("card:updated", (card) => {
    queryClient.setQueryData(["board", boardId], (old) => patchCard(old, card));
  });

  socket.on("board:user-presence", (presence) => {
    queryClient.setQueryData(["board", boardId, "presence"], presence);
  });

  return () => {
    socket.off("card:updated");
    socket.off("board:user-presence");
  };
}, [boardId]);
```

`board:user-presence`'s `activeUsers` currently exposes `email` only —
`name`/`avatarUrl` aren't populated yet (see
[`api/MASTERPLAN.md` §7.3](../api/MASTERPLAN.md#73-event-contract)). Until a
user-profile field ships on the backend, `PresenceHeader.tsx` renders each avatar as the
initial letter(s) of the user's email rather than an image.

### 8.2 Drag-and-Drop with `@dnd-kit`

- `DndContext` wraps the board canvas; each `List` is a `SortableContext`.
- `onDragEnd` computes the new fractional `order` (matching the backend's ordering
  scheme — see
  [`api/MASTERPLAN.md`](../api/MASTERPLAN.md#53-reorder-strategy-fractional-ordering))
  and immediately writes the optimistic result into the TanStack Query cache.
- The same handler fires the `PATCH /cards/:id` mutation (body: `{ listId, order }`);
  `onError` reverts to the cache snapshot taken before the drag began (`onMutate`).
- Keyboard and screen-reader support come from `@dnd-kit`'s built-in accessible sensors
  — no custom a11y work needed for basic reordering.

### 8.3 Why Not Refetch on Every Event

Refetching the whole board on every `card:updated` would be simple but wasteful and
visually jarring (loading flicker on every teammate's keystroke-adjacent action).
Patching the specific card/list in place keeps updates cheap and avoids disrupting
in-progress local interactions (e.g. an open modal, an in-flight drag).

---

## 9. Security & Authentication

### 9.1 Token Handling

- Access token attached to every REST request via an Axios request interceptor.
- Access token also passed during the Socket.io handshake (`auth: { token }`).
- The refresh token itself is never held in frontend code: the API returns it as an
  **HttpOnly cookie**, so it's unreadable by JS and sent automatically by the browser.
  The Axios instance sets `withCredentials: true` so that cookie is included on calls to
  `POST /api/v1/auth/refresh` — this only works if the API's `CORS_ORIGIN` allow-list
  permits credentialed requests from the frontend's origin (see
  [`api/README.md` Frontend Integration](../api/README.md#frontend-integration)).
- A response interceptor catches `401`s, calls `POST /api/v1/auth/refresh` (relying on
  the HttpOnly cookie above — no token is read or attached manually), retries the
  original request once, and redirects to `/login` only if the refresh itself fails.

### 9.2 Protected Routes

- Enforced at the router level (`beforeLoad`), not just by hiding UI — an
  unauthenticated user is redirected before any protected loader runs, so no board data
  is ever requested without a valid session.

### 9.3 Input Handling

- The card description editor (`RichTextEditor.tsx`) renders its saved value as plain
  JSX text (React's default escaping), not `dangerouslySetInnerHTML` — its toolbar is
  currently decorative and doesn't produce real HTML, so there's no raw-HTML sink to
  sanitize yet. This becomes a real requirement (DOMPurify or equivalent, at the render
  site) the moment the editor — or anything else, e.g. a future comment feature — starts
  rendering rich text as actual HTML.
- All form inputs validated client-side (mirroring the backend's Zod schemas — see
  `src/lib/auth-schemas.ts`) for fast feedback, with the backend remaining the
  authoritative validator.

---

## 10. Development Environment

### 10.1 Prerequisites

- Node.js LTS
- Docker Desktop + Docker Compose (optional)
- A running `syncboard_api` instance (local or deployed)

### 10.1.1 Git Hooks (Husky)

Husky enforces quality gates locally, before code ever reaches CI:

- **Pre-commit:** `lint` + `format:check` + `type-check` + `test`
- **Commit message:** validated against Gitmoji format (e.g.
  `:sparkles: Add optimistic drag-and-drop for cards`), matching the convention used in
  `syncboard_api`

### 10.2 Local Setup

```bash
git clone https://github.com/m-oliveda/syncboard_web.git
cd syncboard_web
cp .env.example .env
npm install
npm run dev
```

### 10.3 Docker Compose

```yaml
services:
  web:
    build: .
    ports: ["5173:5173"]
    environment:
      - VITE_API_BASE_URL=http://localhost:4000/api/v1
      - VITE_SOCKET_URL=http://localhost:4000
    volumes:
      - ./src:/app/src
```

---

## 11. Testing Strategy

### 11.1 Coverage Priorities

| Area                            | Test Type                    | Why                                                              |
| ------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| Optimistic move logic           | Unit                         | Cache-patch and rollback correctness is easy to get subtly wrong |
| Auth interceptor + refresh flow | Unit + Integration           | Security- and UX-critical                                        |
| Board rendering                 | Component (RTL)              | Lists/cards render correctly from a given cache state            |
| Drag-and-drop + real-time sync  | E2E (Playwright, 2 contexts) | Only meaningfully verified end-to-end across two "users"         |

### 11.2 Example E2E Scenario

```typescript
// e2e/realtime-sync.spec.ts (sketch)
test("card move in one browser context appears in another", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await loginAndOpenBoard(pageA, boardId);
  await loginAndOpenBoard(pageB, boardId);

  await dragCard(pageA, "Card 1", "In Progress");

  await expect(pageB.getByText("Card 1")).toBeVisible({ timeout: 3000 });
  // and specifically inside the "In Progress" list
});
```

### 11.3 Coverage Enforcement

Unit/component coverage is held to **100%** across statements, branches, functions, and
lines — enforced by Vitest's `coverage.thresholds`, not just aspired to:

```typescript
// vite.config.ts (sketch)
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
      exclude: ["src/routeTree.gen.ts", "src/main.tsx", "src/**/*.d.ts"],
    },
  },
});
```

A failed threshold fails `npm run test:coverage` locally and the CI job in the same way
— mirroring the 100%-coverage gate documented in
[`api/MASTERPLAN.md`](../api/MASTERPLAN.md#101-coverage-priorities).

---

## 12. CI/CD Pipeline

### 12.0 GCP Infrastructure

Each environment has a dedicated GCP project and service account, shared with
`syncboard_api`'s deployment setup:

| Environment     | GCP Project ID                 | Service Account          |
| --------------- | ------------------------------ | ------------------------ |
| **Development** | `moliveda-gcloudprojects-dev`  | `cicd-deployer-dev@...`  |
| **Staging**     | `moliveda-gcloudprojects-stg`  | `cicd-deployer-stg@...`  |
| **Preview**     | `moliveda-gcloudprojects-prev` | `cicd-deployer-prev@...` |
| **Production**  | `moliveda-gcloudprojects-prod` | `cicd-deployer-prod@...` |

**Preview is frontend-only.** `syncboard_api` has no Preview environment — every Preview
deploy of `syncboard_web` points at the **Development** API instead of provisioning a
backend per PR. Preview exists specifically because UI/interactivity changes are easiest
to review live, on a real deployed URL, rather than from a diff.

### 12.1 GitFlow Branch → Environment Mapping

| Branch/Trigger | Environment | Notes                                                         |
| -------------- | ----------- | ------------------------------------------------------------- |
| `feature/*`    | Local only  | Manual                                                        |
| `develop`      | Development | Auto-deploy on push                                           |
| `release/*`    | Staging     | Auto-deploy on push                                           |
| Pull request   | Preview     | Ephemeral deploy on open/update; talks to the Development API |
| `main`         | Production  | Manual dispatch                                               |

### 12.2 Pipeline Stages

1. **CI (every PR):** lint, type-check, unit tests with coverage
   (`npm run test:coverage`) — the job fails if coverage is below 100%, then the
   Playwright smoke suite
2. **Deploy Preview:** on PR open/update, build the Vite bundle with
   `VITE_API_BASE_URL`/`VITE_SOCKET_URL` set to the Development API, deploy an ephemeral
   `syncboard-web` Cloud Run revision, comment the preview URL on the PR; torn down on
   PR close
3. **Deploy Development / Staging:** build the Vite bundle with the environment's
   `VITE_*` values, build the Docker image, push, deploy to the corresponding
   `syncboard-web` Cloud Run service
4. **Deploy Production:** manual approval gate, same build/deploy steps against
   production `VITE_*` values

### 12.3 Build-Time vs Runtime Env Vars

Because Vite inlines `VITE_*` variables at build time, each environment requires its own
build (not just a redeployed image with different runtime env vars). CI builds a
distinct image per environment rather than promoting one image across dev → staging →
prod.

### 12.4 Required Secrets (per environment)

```text
GCP_PROJECT_ID
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
VITE_API_BASE_URL
VITE_SOCKET_URL
```

Preview, Development, and Staging additionally require (Production does not):

```text
AUTH_USERNAME
AUTH_PASSWORD
```

These are **Docker build-time secrets** (passed as `--build-arg`/`build-args` when
building the `protected` Dockerfile target), not Cloud Run runtime env vars.

Authentication to GCP uses Workload Identity Federation — no long-lived service account
keys stored in CI, matching `syncboard_api`'s deployment pipeline.

### 12.5 Environment Access Protection

Preview, Development, and Staging are not customer-facing, so they're kept internal-only
behind Nginx HTTP Basic Auth; Production is public with no Basic Auth. This mirrors the
pattern used by the sibling `sentient-archive/web` project.

The choice is made at **build time** by selecting the Dockerfile stage:

- `docker build --target protected --build-arg AUTH_USERNAME=... --build-arg AUTH_PASSWORD=...`
  installs `apache2-utils`, generates `/etc/nginx/.htpasswd` via `htpasswd -cb` during
  the image build, and serves `nginx.protected.conf`. Used for Preview/Development/
  Staging.
- `docker build --target production` (no auth args) serves the public `nginx.conf`
  directly. Used for Production.

`/health` is excluded from auth in `nginx.protected.conf`, so Cloud Run health checks
keep working either way. Because the target differs per environment, each environment
already builds its own image (consistent with the `VITE_*` build-time rule in
CLAUDE.md's Architectural Constraints) — CI passes `target:`/`build-args` per
environment via `docker/build-push-action`, matching `sentient-archive/web`'s
`deploy-dev.yml`/`deploy-prod.yml` workflows.

---

## 13. Development Phases

### Phase 0 — Project Scaffolding & Testing Infra

- [x] Initialize the TypeScript project (Vite, `tsconfig.json`, ESLint, Prettier, Husky
      hooks) — `eslint.config.ts` needs the `jiti` (≥2.2.0) devDependency to load under
      Node (ESLint's flat-config TS loader requires it; easy to miss since there's no
      `package.json` yet to catch it)
- [x] Wire up Vitest + React Testing Library with a coverage threshold of 100%
      (`coverage.thresholds` in `vite.config.ts`)
- [x] Add `docker-compose.yml` for local dev parity

### Phase 1 — Static Board UI, Marketing & Legal Pages

- [x] Install and configure Tailwind CSS v4 + `origin-ui`; port
      [`DESIGN.md`](./DESIGN.md) into Tailwind v4's `@theme` tokens in `src/index.css`
      (colors, `Space Grotesk` via Google Fonts import, spacing scale, radii scale) —
      `origin-ui` primitives vendored unmodified from the sibling `origin-ui_web` repo
      per the project's local sourcing convention
- [x] Logo/favicon: recreated as a `lucide-react` `Kanban` mark (`Logo.tsx` +
      `public/favicon.svg`) rather than sourced from Stitch, per explicit direction
- [x] Build the Landing page (hero, feature highlights, how-it-works, FAQ, dark-surface
      CTA section, mobile navigation) against static copy, including its `framer-motion`
      entrance/scroll animation
- [x] Build Auth page shells (Login, Sign Up, Forgot Password) — UI only, no submission
      wiring yet
- [x] Build the Terms of Service and Privacy Policy static pages
- [x] Build the board layout (Canvas, Lists, Cards) against mock/static data
- [x] Build the Dashboard (Workspace sidebar + Board grid + Members panel UI)
- [x] Build the Product Roadmap example board — same Board Canvas/List/Card primitives,
      seeded with static demo data
- [x] Build the Card Detail modal shell (rich-text area, checklist, activity feed)
      against mock data — route-driven via `?card=` on `/app/boards/$boardId`
- [x] Validate the visual design and responsive behavior across breakpoints before
      wiring any data fetching — AppShell's sidebar collapses to a `Sheet`-based mobile
      drawer below `lg`

### Phase 2 — REST Integration

Phase 6 (auth) was pulled forward as a prerequisite — every workspace/board/list/card
endpoint requires a Bearer JWT, so Phase 2's REST calls weren't testable against the
real API without a working login first. See Phase 6 below, done first in the same branch
of work.

- [x] Wire TanStack Query to `syncboard_api`'s REST endpoints
- [x] Board, list, and card CRUD work end-to-end, with normal (non-optimistic)
      loading/error states — rename/reorder (`order`, `listId`) stays Phase 4's job;
      board/list rename UI doesn't exist yet either (create/read/delete only for those
      two, full CRUD for cards)
- [x] Members panel wired to the `/workspaces/:workspaceId/members` endpoints (change
      role, remove). **Invite-by-email is not wired** — `POST /members` takes a
      `userId`, not an email, and the API has no user-lookup-by-email endpoint; the
      invite row is disabled with explanatory copy instead of faking the mock behavior

Known gaps carried forward, not fixed silently:

- The card detail modal's Activity feed stays on mock data — no `Activity`
  model/service/route exists on the API yet (§5.3 above)
- Card `assignees` render as an empty list — the API stores unpopulated `ObjectId`s and
  the "Add assignee" affordance was already inert in the Phase 1 mock
- Card labels lose per-label color customization — the API stores raw label strings, not
  `{ id, color }` records, so colors are derived deterministically from the label text
  instead of being persisted
- `useCurrentWorkspace()` picks the first workspace returned by `GET /workspaces` —
  there's no workspace switcher UI yet, so multi-workspace users only ever see one

### Phase 3 — CI/CD & Deployment Environments

Pulled forward from the end of the roadmap — the pipeline exists before the features
that need to ship through it, not after, mirroring the approach in
[`api/MASTERPLAN.md`'s Phase 3](../api/MASTERPLAN.md#phase-3--cicd--deployment-environments):

- [ ] Add `ci.yml` (lint, type-check, unit tests with the 100% coverage gate, Playwright
      smoke suite)
- [ ] Dockerize the app (multi-stage build → Nginx serving the static bundle)
- [ ] Provision the four dedicated GCP projects/service accounts (Preview, Development,
      Staging, Production) and configure Workload Identity Federation
- [ ] Add `deploy-dev.yml`/`deploy-staging.yml`/`deploy-preview.yml`, chained from
      `ci.yml` (dev/staging auto-deploy on push; preview deploys ephemerally on PR
      open/update against the Development API and tears down on close), each building
      its own Vite bundle from that environment's `VITE_*` secrets
- [ ] Add `deploy-prod.yml` (manual dispatch only; reruns `ci.yml`'s test job first,
      since dispatch bypasses `ci.yml`'s own triggers)

### Phase 4 — Drag-and-Drop & Optimistic UI

- [ ] Introduce `@dnd-kit`
- [ ] Implement the optimistic cache update + rollback-on-failure pattern for card and
      list reordering

### Phase 5 — Real-Time Layer

- [ ] Add `socket.io-client`
- [ ] Wire incoming `card:updated`/`board:user-presence` events to patch the TanStack
      Query cache
- [ ] Validate with the two-browser-context E2E scenario

### Phase 6 — Auth & Polish

Built ahead of Phase 2 (see note there) rather than after Phases 3–5, since Phase 2's
REST calls need a real session to test against the live API.

- [x] Full auth flow (login/register/forgot-password/reset-password) — the reset flow
      needed a `/reset-password` route not in the original §5 table, added there
- [x] Protected routing — `/app`'s `beforeLoad` attempts one silent `POST /auth/refresh`
      (cookie-carried) when no in-memory access token is present, redirecting to
      `/login` only if that also fails, so a hard reload doesn't bounce an
      otherwise-valid session
- [x] Logout — wired into the sidebar's account menu (not in the original Phase 1 mock,
      which had no way to log out at all once auth existed)
