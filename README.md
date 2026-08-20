# 🗂️ SyncBoard Web — Real-Time Kanban Frontend

> **A responsive React SPA for the SyncBoard real-time Kanban board, built with React
> 19, Vite, TypeScript, TanStack Router/Query, and Tailwind CSS.**

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Routes & Pages](#routes--pages)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**SyncBoard Web** is the frontend application for the SyncBoard ecosystem. It renders
the Kanban board, handles drag-and-drop reordering with optimistic UI, and keeps every
open tab in sync in real time via a Socket.io connection to the backend.

Built with **React 19**, **Vite**, and **TypeScript**, and deployed as a containerized
static bundle on **Google Cloud Run**.

### This Repository Contains

- 🔐 **Email/Password Auth** — login, register, forgot-password, and protected `/app` routes guarded by JWT session checks
- 🖱️ **Drag-and-Drop Kanban Board** — `@dnd-kit` cards and lists with an optimistic UI that rolls back on failure
- ⚡ **Real-Time Sync** — `socket.io-client` connection scoped per board, patching the TanStack Query cache directly
- 🧑‍🤝‍🧑 **Live Presence** — avatars with a green dot for every user currently viewing a board (rendered from the user's email initials today — the API's `board:user-presence` payload doesn't include `name`/`avatarUrl` yet)
- 🗂️ **Workspace & Board Management** — Workspace sidebar, Board grid, member management (invite, change/remove Admin/Member role), onboarding flow for first-time users
- 🎨 **Polished UI** — Tailwind CSS + `origin-ui` (Shadcn/ui-based components) with Lucide icons
- 🧪 **Vitest + Playwright Testing** — 100% unit/component coverage plus multi-tab E2E real-time sync scenarios

### Related Repository

This UI is one half of the SyncBoard product — the API and real-time layer it
consumes live in a separate repository:

- **Backend Repository:** [`m-oliveda/syncboard_api`](https://github.com/m-oliveda/syncboard_api)
  (see its [README](https://github.com/m-oliveda/syncboard_api/blob/main/README.md) for
  the REST/WebSocket contract, database schema, and the Cloud Run multi-instance
  synchronization design)

---

## Architecture

The application is a Single Page Application served via Nginx inside a Docker
container, itself deployed as a Cloud Run service.

```text
┌───────────────────────────────────────────────────────────────────┐
│                       GOOGLE CLOUD RUN                             │
│              syncboard-web service (Nginx + static bundle)         │
│                                                                     │
│   React 19 SPA · TanStack Router/Query · Tailwind CSS · dnd-kit    │
└───────────────────────────────┬───────────────────────────────────┘
             │                                          ▲
             │ REST (Axios)                              │ WebSockets
             ▼                                            │ (socket.io-client)
┌───────────────────────────────────────────────────────────────────┐
│                       GOOGLE CLOUD RUN                             │
│                 syncboard-api service (Express + Socket.io)         │
└───────────────────────────────────────────────────────────────────┘
```

`web` and `api` are deployed as two independent Cloud Run services — the frontend never
talks to MongoDB or Redis directly; everything goes through the API.

---

## Key Features

### 1. Authentication

- **Email/Password Login & Register** with client-side validation
- **Forgot Password** flow with email verification link
- **Protected Routes** — the `/app` board view requires a valid session
- **Axios interceptors** for JWT injection and silent access-token refresh

### 2. The Active Board

| Feature               | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| **Horizontal Canvas** | Scrollable container for an arbitrary number of lists                         |
| **Drag & Drop**       | `@dnd-kit/core` + `@dnd-kit/sortable` for cards and lists                     |
| **Optimistic UI**     | The DOM updates the instant a card is dropped; a failed request snaps it back |
| **Live Presence**     | Avatars (email initials until the API exposes `name`/`avatarUrl`) with a green dot for every user currently viewing the board |
| **Card Detail Modal** | Rich-text description, checklists with progress bars, activity feed           |

> Drag-and-drop computes fractional/LexoRank-style `order` values matching the
> backend's [reorder strategy](https://github.com/m-oliveda/syncboard_api/blob/main/README.md#database-schema-mongodb),
> so a card move never requires re-indexing its siblings.

### 3. Real-Time Sync

- `socket.io-client` connection scoped to the currently open board
- Incoming `card:updated` / `board:user-presence` events patch the TanStack Query cache
  directly — no polling, no manual refetch

### 4. Onboarding & Workspace Management

- "Create your first Workspace" modal shown after first login
- Sidebar listing all Workspaces the user belongs to
- Grid view of Boards inside the selected Workspace
- Members panel — invite/add a member and change or remove their Admin/Member role,
  backed by the API's
  [workspace member endpoints](https://github.com/m-oliveda/syncboard_api/blob/main/README.md#workspaces)

---

## Technology Stack

### Core Technologies

| Category       | Technology | Purpose             |
| -------------- | ---------- | ------------------- |
| **Framework**  | React 19   | UI library          |
| **Build Tool** | Vite       | Fast HMR and builds |
| **Language**   | TypeScript | Type safety         |

### Routing & State

| Category             | Technology         | Purpose                                                   |
| -------------------- | ------------------ | --------------------------------------------------------- |
| **Routing**          | TanStack Router    | Type-safe routing with loaders                            |
| **Server State**     | TanStack Query     | Data fetching, caching, cache patching from socket events |
| **HTTP Client**      | Axios              | REST calls, JWT interceptors                              |
| **Real-Time Client** | `socket.io-client` | WebSocket connection to the API                           |

### UI & Styling

| Category        | Technology                            | Purpose                                               |
| --------------- | ------------------------------------- | ----------------------------------------------------- |
| **Styling**     | Tailwind CSS                          | Utility-first CSS                                     |
| **Components**  | `origin-ui`                           | Shadcn/ui-based component set with micro-interactions |
| **Icons**       | Lucide React                          | Icon library                                          |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Card/list reordering                                  |

### Development Tools

| Category        | Technology                     | Purpose                                            |
| :-------------- | :----------------------------- | :------------------------------------------------- |
| **Testing**     | Vitest + React Testing Library | Unit and component testing (100% testing coverage) |
| **API Mocking** | MSW                            | Mock REST responses in tests                       |
| **E2E**         | Playwright                     | Browser automation, multi-tab sync tests           |
| **Linting**     | ESLint                         | Code quality                                       |
| **Formatting**  | Prettier                       | Consistent formatting                              |
| **Git Hooks**   | Husky                          | Enforce lint/format/commit-msg standards on commit |

---

## Routes & Pages

| Route                  | Type            | Purpose                                                                                  |
| ---------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `/`                    | Public          | Landing page — product pitch, feature highlights, CTA to register/login                  |
| `/login`               | Public (unauth) | Email/password login                                                                     |
| `/register`            | Public (unauth) | Account registration                                                                     |
| `/forgot-password`     | Public (unauth) | Password reset trigger                                                                   |
| `/app`                 | Protected       | Home app — Workspace sidebar, Board grid                                                 |
| `/app/boards/:boardId` | Protected       | The active board — Kanban canvas (see [`MASTERPLAN.md`](./MASTERPLAN.md#5-routes--pages)) |

### Protected Layout (`/app`)

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

Full component breakdown and state-management strategy:
[`MASTERPLAN.md`](./MASTERPLAN.md#5-routes--pages).

---

## Getting Started

### Prerequisites

- **Node.js LTS**
- **Docker Desktop & Docker Compose**
- **Git**
- A running instance of [`syncboard_api`](https://github.com/m-oliveda/syncboard_api)
  (locally or deployed)

### Local Setup (Native)

```bash
git clone https://github.com/m-oliveda/syncboard_web.git
cd syncboard_web
cp .env.example .env
# Edit .env with your API base URL and socket URL
npm install
npm run dev
# http://localhost:5173
```

### Local Setup (Docker)

```bash
docker compose up --build
# http://localhost:5173
```

⚠️ **Note:** the backend (`syncboard_api`) must be running and reachable at the URL
configured in `.env` for the app to function beyond the public landing/auth pages.

---

## Development

### Available Scripts

```bash
# Development
npm run dev               # Start Vite dev server
docker compose up          # Start Docker dev environment

# Build
npm run build               # Production build
npm run preview               # Preview production build

# Testing
npm run test                   # Unit tests
npm run test:coverage             # Coverage report
npm run test:e2e                    # Playwright E2E
npm run test:e2e:ui                    # Playwright UI mode

# Code Quality
npm run lint                             # ESLint
npm run format                             # Prettier
npm run type-check                           # TypeScript type checking
```

### Git Hooks (Husky)

This project uses Husky to enforce quality standards automatically, so CI failures for
lint/format/commit-message issues never happen — they're caught before the commit
exists:

- **Pre-commit:** runs `lint` and `format:check` against staged files
- **Commit message:** validated against Gitmoji format (e.g. `:sparkles: Add optimistic drag-and-drop for cards`), matching the convention used in
  [`syncboard_api`](https://github.com/m-oliveda/syncboard_api)

---

## Testing

### Tools

- **Vitest** + **React Testing Library** — unit and component tests
- **MSW** — API mocking for REST calls in tests
- **Playwright** — browser E2E, including drag-and-drop and multi-tab real-time sync
  scenarios

### Unit / Integration

```bash
npm run test
npm run test:watch
npm run test:coverage
```

> ⚠️ **100% coverage required:** `npm run test:coverage` enforces a 100%
> statements/branches/functions/lines threshold — CI fails the build if coverage drops
> below that, matching the gate used in
> [`syncboard_api`](https://github.com/m-oliveda/syncboard_api).

### E2E

```bash
docker compose up -d      # starts the app + a local API/Mongo/Redis stack if configured
npm run test:e2e
```

A key E2E scenario opens **two browser contexts** on the same board and asserts that a
card move in one propagates to the other — the real-time contract is only meaningfully
tested end-to-end, not mocked.

### Test Structure

```text
tests/
├── setup.ts                    # jsdom polyfills + @testing-library/jest-dom matchers
├── __mocks__/                  # Manual mocks (env, assets, third-party modules)
├── App.test.tsx
├── components/
│   ├── board/                  # Canvas, List, Card, drag-and-drop wiring
│   └── card-modal/             # Card detail modal, checklist, activity feed
├── hooks/                       # useAuth, useSocket, useOptimisticMove
├── lib/                          # api.ts, socket.ts
└── routes/                        # Route loaders and guards

e2e/                                # Playwright specs (drag-and-drop, multi-tab sync)
```

`tests/` mirrors the `src/` tree one-to-one, so a source file's coverage gaps are easy to
locate.

---

## Deployment

The application builds to a static bundle, served by Nginx inside a Docker container,
and deployed to **Google Cloud Run** — the same platform as the backend, as two
independent services.

### GCP Infrastructure

Each environment has a dedicated GCP project with its own service account, shared with
[`syncboard_api`](https://github.com/m-oliveda/syncboard_api)'s deployment setup:

| Environment     | GCP Project ID                 | Service Account          |
| --------------- | ------------------------------ | ------------------------ |
| **Preview**     | `moliveda-gcloudprojects-prev` | `cicd-deployer-prev@...` |
| **Development** | `moliveda-gcloudprojects-dev`  | `cicd-deployer-dev@...`  |
| **Staging**     | `moliveda-gcloudprojects-stg`  | `cicd-deployer-stg@...`  |
| **Production**  | `moliveda-gcloudprojects-prod` | `cicd-deployer-prod@...` |

### Deployment Strategy

| Environment     | Branch/Trigger | Notes                                                  |
| --------------- | -------------- | ------------------------------------------------------ |
| **Preview**     | Pull requests  | Ephemeral per-PR deploy; points at the Development API |
| **Development** | `develop`      | Auto-deploy on push                                    |
| **Staging**     | `release/*`    | Pre-production validation                              |
| **Production**  | `main`         | Manual dispatch                                        |

### CI/CD Pipeline

Deployments run through GitHub Actions using **Workload Identity Federation (OIDC)** —
no long-lived GCP service account keys are stored in CI:

- **CI (every PR):** lint, type-check, unit tests, Playwright smoke suite
- **Deploy Preview:** on PR open/update, builds the Vite bundle with
  `VITE_API_BASE_URL`/`VITE_SOCKET_URL` pointed at the **Development** API, deploys an
  ephemeral `syncboard-web` Cloud Run revision for that PR, and posts the preview URL
  back to the PR; torn down when the PR closes
- **Deploy Development / Staging:** build the Vite bundle with the environment's
  `VITE_*` values (baked in at build time), build the Docker image, push, deploy to the
  corresponding `syncboard-web` Cloud Run service
- **Deploy Production:** manual approval gate, same build/deploy steps against
  production `VITE_*` values

Secrets are organized using **GitHub Environments** (`development`, `staging`,
`preview`, `production`), each scoped to its own `VITE_API_BASE_URL` and
`VITE_SOCKET_URL` — `preview`'s values are the same as `development`'s API URLs.

### Manual Deployment

```bash
npm run build

docker build -t syncboard-web .
docker tag syncboard-web gcr.io/<project-id>/syncboard-web
docker push gcr.io/<project-id>/syncboard-web

gcloud run deploy syncboard-web \
  --image gcr.io/<project-id>/syncboard-web \
  --set-env-vars VITE_API_BASE_URL=...,VITE_SOCKET_URL=...
```

> Vite env vars are baked into the static bundle at **build time** — set them before
> `npm run build` / the Docker build step, not as Cloud Run runtime env vars alone.

---

## Project Structure

```text
syncboard_web/
├── src/
│   ├── components/
│   │   ├── ui/                 # origin-ui primitives
│   │   ├── layout/               # App shell, sidebar, header, presence avatars
│   │   ├── board/                  # Canvas, List, Card, drag-and-drop wiring
│   │   ├── card-modal/               # Card detail modal, rich text editor, checklist
│   │   └── workspace/                  # Members panel — invite, role changes
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts               # Socket.io connection + event subscriptions
│   │   └── useOptimisticMove.ts         # Optimistic drag-and-drop update logic
│   ├── lib/
│   │   ├── api.ts                        # Axios instance + interceptors
│   │   └── socket.ts                       # socket.io-client instance
│   ├── routes/                               # TanStack Router route definitions
│   ├── stores/                                 # Client-only UI state (modals, filters)
│   ├── types/                                    # Shared TypeScript types
│   └── locales/                                    # i18n translation files (if enabled)
│
├── e2e/                                                # Playwright specs
├── tests/                                                # Vitest unit/integration tests
├── .husky/                                                 # Pre-commit lint/format/test + commit-msg hooks
├── .github/
│   └── workflows/                                            # CI + per-environment deploy pipelines
├── .env.example
├── .env
├── Dockerfile
├── nginx.conf
├── docker-compose.yml
├── vite.config.ts
├── tsconfig.json
├── package.json
├── README.md                 # This file
├── MASTERPLAN.md               # Detailed frontend architecture
└── LICENSE
```

---

## Environment Variables

```bash
cp .env.example .env
```

```bash
# API connection
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000

# App
VITE_APP_ENV=development
```

⚠️ **Reminder:** these are Vite build-time variables — the `VITE_` prefix is required
for a variable to be exposed to client code, and values are embedded into the bundle at
`npm run build` time, not read at container runtime.

> **Preview builds:** CI sets `VITE_API_BASE_URL`/`VITE_SOCKET_URL` to the
> **Development** API's Cloud Run URL — there is no per-PR backend, so every Preview
> deploy shares the same Development API and its data.

---

## License

SyncBoard Web is licensed under the **GPL v2 License**. See [LICENSE](./LICENSE) for
details.

## Additional Resources

- **Detailed Architecture:** [MASTERPLAN.md](./MASTERPLAN.md)
- **Backend Repository:** [`m-oliveda/syncboard_api`](https://github.com/m-oliveda/syncboard_api)
