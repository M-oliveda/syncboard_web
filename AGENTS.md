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
- Mandatory workflow, architectural constraints, non-goals (Claude Code specifically):
  [`CLAUDE.md`](./CLAUDE.md)

This file documents **stack-specific coding conventions and best practices** for any AI
agent working in this repo. It does not restate `CLAUDE.md`'s mandatory plan-first
workflow or hard architectural constraints (never talk to Mongo/Redis directly,
optimistic-move snapshot/rollback, protected routes via `beforeLoad`, token handling,
etc.) — read `CLAUDE.md` for those; this file is about _how_ to write code that fits the
project once you know _what_ to build.

**Current state:** Phase 0 (project scaffolding & testing infra) is complete —
`package.json`, lockfile, `vite.config.ts`, `src/`, `tests/`, `playwright.config.ts`,
and `e2e/` all exist, and every `npm run *` command works. There is still no board UI,
routing, data fetching, drag-and-drop, or real-time layer — `src/App.tsx` is a
placeholder pending Phase 1. Verify a file exists before assuming it does; see
`CLAUDE.md`'s Project Snapshot for the up-to-date list.

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

- Use semantic color naming and avoid define custom colours.
- Use colours from `globals.css` stylesheet file.

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

- Define theme variables in `src/index.css`
- Use CSS custom properties for colors and spacing
- Implement dark mode using Tailwind's `dark` class strategy if/when dark mode is added
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

- Use **Gitmoji** for all commit messages (enforced by Husky)
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

- Husky runs automatically before commits
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
