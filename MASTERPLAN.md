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

**SyncBoard Web** is the frontend for a real-time collaborative Kanban board. It
renders Workspaces, Boards, Lists, and Cards; supports drag-and-drop reordering with an
optimistic UI; and reflects every teammate's changes live via a Socket.io connection to
`syncboard_api`.

### Key Features

- **Modern React architecture:** React 19 + Vite + TypeScript
- **Type-safe routing:** TanStack Router with loaders and protected route guards
- **Efficient server-state management:** TanStack Query, patched directly by
  incoming socket events instead of polling
- **Optimistic drag-and-drop:** `@dnd-kit`, with instant UI feedback and rollback on
  API failure
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

1. **Landing Page** — product pitch, feature highlights, CTA to register/login
2. **Auth Pages** — login, register, forgot password
3. **Dashboard** — Workspace sidebar, Board grid, "Create Board" action, Members panel
   for inviting teammates and managing Admin/Member roles
4. **Active Board** — the core Kanban canvas: Lists, Cards, drag-and-drop, presence
   header
5. **Card Detail Modal** — rich-text description, checklist with progress bar,
   chat-like activity feed

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
keeps the update path for "my own drag" and "a teammate's drag" nearly identical —
both ultimately flow through the same cache-patch function.

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
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Accessible drag-and-drop for cards/lists           |

### 4.4 Development Tools

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

| Route                  | Type            | Component / Purpose                            |
| ---------------------- | --------------- | ---------------------------------------------- |
| `/`                    | Public          | Landing page — pitch, feature highlights, CTA  |
| `/login`               | Public (unauth) | Login form                                     |
| `/register`            | Public (unauth) | Registration form                              |
| `/forgot-password`     | Public (unauth) | Password-reset trigger                         |
| `/app`                 | Protected       | Home app shell: Workspace sidebar + Board grid |
| `/app/boards/:boardId` | Protected       | Active board — the Kanban canvas               |

### 5.1 Protected Route Guarding

TanStack Router's `beforeLoad` hook checks for a valid session (access token present
and not expired) before entering any `/app/*` route, redirecting to `/login` otherwise.
This runs at the router level, not inside individual components, so there's no
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

- Rich-text editor for the description
- Checklist with a progress bar
- Chat-like activity feed ("Mauricio moved this card to Done") — paginated, loading
  older entries on scroll rather than fetching the full history at once, mirroring the
  API's paginated `GET /cards/:cardId/activity`
  ([`api/README.md` §Collection Query Parameters](../api/README.md#collection-query-parameters))

---

## 6. Component Structure

```text
src/
├── components/
│   ├── ui/                    # origin-ui primitives (Button, Dialog, Avatar, ...)
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

| State category                                   | Tool                                            | Rationale                                                           |
| ------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------- |
| **Server state (boards/lists/cards)**            | TanStack Query                                  | Caching, background refetch, and the socket-patch integration point |
| **Auth session**                                 | TanStack Query (`me` query) + Axios interceptor | Access token refresh is transparent to feature code                 |
| **Ephemeral UI state (open modal, active drag)** | Local component state / lightweight store       | No need for global state outside server data                        |
| **URL state (open card, filters)**               | TanStack Router search params                   | Deep-linkable, shareable, back-button friendly                      |

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
  scheme — see [`api/MASTERPLAN.md`](../api/MASTERPLAN.md#53-reorder-strategy-fractional-ordering))
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
  unauthenticated user is redirected before any protected loader runs, so no
  board data is ever requested without a valid session.

### 9.3 Input Handling

- Rich-text editor output is sanitized before rendering elsewhere (e.g. activity feed
  previews) to prevent stored-XSS via card descriptions.
- All form inputs validated client-side (mirroring the backend's Zod schemas) for fast
  feedback, with the backend remaining the authoritative validator.

---

## 10. Development Environment

### 10.1 Prerequisites

- Node.js LTS
- Docker Desktop + Docker Compose (optional)
- A running `syncboard_api` instance (local or deployed)

### 10.1.1 Git Hooks (Husky)

Husky enforces quality gates locally, before code ever reaches CI:

- **Pre-commit:** `lint` + `format:check` against staged files
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
test("card move in one browser context appears in another", async ({
  browser,
}) => {
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

**Preview is frontend-only.** `syncboard_api` has no Preview environment — every
Preview deploy of `syncboard_web` points at the **Development** API instead of
provisioning a backend per PR. Preview exists specifically because UI/interactivity
changes are easiest to review live, on a real deployed URL, rather than from a diff.

### 12.1 GitFlow Branch → Environment Mapping

| Branch/Trigger | Environment | Notes                                                         |
| -------------- | ----------- | ------------------------------------------------------------- |
| `feature/*`    | Local only  | Manual                                                        |
| `develop`      | Development | Auto-deploy on push                                           |
| `release/*`    | Staging     | Auto-deploy on push                                           |
| Pull request   | Preview     | Ephemeral deploy on open/update; talks to the Development API |
| `main`         | Production  | Manual dispatch                                               |

### 12.2 Pipeline Stages

1. **CI (every PR):** lint, type-check, unit tests with coverage (`npm run test:coverage`)
   — the job fails if coverage is below 100%, then the Playwright smoke suite
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

Because Vite inlines `VITE_*` variables at build time, each environment requires its
own build (not just a redeployed image with different runtime env vars). CI builds a
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

Authentication to GCP uses Workload Identity Federation — no long-lived service account
keys stored in CI, matching `syncboard_api`'s deployment pipeline.

---

## 13. Development Phases

### Phase 0 — Project Scaffolding & Testing Infra

- [ ] Initialize the TypeScript project (Vite, `tsconfig.json`, ESLint, Prettier, Husky
      hooks)
- [ ] Wire up Vitest + React Testing Library with a coverage threshold of 100%
      (`coverage.thresholds` in `vite.config.ts`)
- [ ] Add `docker-compose.yml` for local dev parity

### Phase 1 — Static Board UI

- [ ] Build the board layout (Canvas, Lists, Cards) against mock/static data
- [ ] Validate the visual design and responsive behavior before wiring any data fetching

### Phase 2 — REST Integration

- [ ] Wire TanStack Query to `syncboard_api`'s REST endpoints
- [ ] Board, list, and card CRUD work end-to-end, with normal (non-optimistic)
      loading/error states
- [ ] Members panel wired to the `/workspaces/:workspaceId/members` endpoints
      (invite/add, change role, remove)

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

- [ ] Full auth flow (login/register/forgot-password)
- [ ] Protected routing
