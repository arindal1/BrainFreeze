# Changelog

All notable changes to Brain Freeze are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [0.5.1] - 2026-08-18

### Fixed

- **Google sign-in crashed the whole auth flow when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` weren't set**: NextAuth still attempted OIDC discovery against Google for a provider registered with empty credentials, logging `[auth][error] TypeError: fetch failed` and then hard-500ing on `/api/auth/error?error=Configuration` the moment "Continue with Google" was clicked. `src/auth/auth.ts` now only registers the Google provider when both env vars are present (exported as `isGoogleAuthEnabled`), and `LoginForm`/`RegisterForm` hide the "Continue with Google" button entirely when it's unconfigured — email/password auth is unaffected either way.
- Added `trustHost: true` to the NextAuth config, required once the app is deployed behind a PaaS reverse proxy (Render, Railway, Fly.io, etc.) so callback URLs are derived correctly without also requiring `NEXTAUTH_URL`.

### Added

- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): step-by-step guide to deploying on entirely free-tier services (Render for hosting, Neon/Supabase for Postgres, free-tier Gemini/OpenRouter/xAI keys), including why the in-process research queue requires a persistent-process host rather than request-scoped serverless functions, and a troubleshooting section covering the Google Configuration error above.

## [0.5.0] - 2026-08-18

### Fixed

- **Mobile UI audit**: `JobRow` "Stop"/"Delete" actions were revealed only via `:hover`/`:focus-within`, which don't exist on touch devices — on phones and tablets these controls were permanently invisible and untappable. Now visible by default and only hover-hidden at `md:` and above (desktop pointer devices).
- Research document markdown tables (`.doc table`) used `width: 100%` with no scroll container, so wide tables (common in generated reports) were silently clipped on narrow phone viewports by the page's `overflow-x: hidden`. Tables now scroll horizontally within themselves (`display: block; width: max-content; max-width: 100%; overflow-x: auto`) instead of losing columns off-screen.

## [0.4.0] - 2026-08-18

### Changed

- **Marketing site UI audit and pass** (Playwright-driven, screenshots at 1440/960/390px): fixed `Protocol`'s horizontal "side scroller" section, which pinned with zero scroll distance and appeared frozen because its GSAP `matchMedia` breakpoint (900px) didn't match the Tailwind breakpoint at which the track actually switched to `flex-row` (`lg`, 1024px) — both now use 1024px, and a bottom progress rail was added so horizontal travel is legible.
- Introduced a shared layout rhythm — `--shell` (96rem), `--gutter`, `--section-y` tokens plus `.shell` / `.section-y` utility classes — and moved `Hero`, `Protocol`, `Agents`, `Brief`, `Nav`, and `Footer` onto it, replacing five slightly-different hand-rolled `mx-auto max-w-[110rem] px-5 md:px-10 py-*` combinations that were the source of the reported grid/spacing inconsistency.
- Retuned the fluid type scale (`--step-3` through `--step-6`) so display headings no longer overflow their grid columns at mid-size viewports (960–1200px).
- Extracted a shared `.eyebrow` component (label + leading rule) and `CtaLink` component to replace four independently hand-rolled copies of each that had drifted in gap/padding.
- Moved bespoke CSS primitives (`.shell`, `.display`, `.label`, `.eyebrow`, `.lede`, `.slab`, `.draw`, `.pressure`, `.hatch`) into a Tailwind `@layer components` block, and renamed `.invert` to `.frostblock`, fixing a name collision with Tailwind's own `invert` filter utility and a specificity bug where `.draw`'s implicit `display: inline-block` silently overrode responsive `hidden` / `sm:inline-block` utilities on nav/footer links.
- `CryoField` (WebGL hero background) made more visually prominent: brighter cold body/seam colors, a wider ice-crystal lattice, a lighter vignette so the field no longer reads as almost-flat black, and a legibility scrim (linear gradient) over the hero text instead of dimming the whole canvas.
- `Nav` gets a readability gradient over the transparent (unscrolled) state now that the hero field behind it is brighter.

### Added

- Brutalist-themed Next.js util routes, reusing existing design primitives (`CryoField`, `.eyebrow`, `.lede`, `.pressure`, `.signal`, `.sweep`, `Button`): `src/app/not-found.tsx` (404 "NODE NOT FOUND"), `src/app/error.tsx` (route error boundary, "PIPELINE INTERRUPTED", shows error message + `reset()` retry), `src/app/global-error.tsx` (root layout failure fallback, "INSTRUMENT OFFLINE"), `src/app/loading.tsx` (root Suspense fallback).
- `CryoFieldBackdrop` client component wrapping `next/dynamic(..., { ssr: false })` so the WebGL field can be used from server components like `not-found.tsx` (a bare `dynamic({ ssr: false })` call is rejected by Next.js inside Server Components).
- Redesigned `src/app/icon.svg` and `public/og-image.svg` to match the Cryo Instrument theme: void-black background, hard-edged cryo-blue crystal facet mark, a single vermillion flare square as the "hot signal" accent, hairline borders — replacing the old gold/teal diamond mark.
- Playwright UI audit harness (`playwright.config.ts`, `tests/ui.audit.spec.ts`) that screenshots the landing page at three breakpoints, walks the pinned `Protocol` scroll, and asserts no console errors.

### Fixed

- Login/register/dashboard `draw` links stopped rendering (or overrode responsive visibility classes) after the `.draw` CSS primitive change; restored explicit `inline-block` on each call site.

## [0.3.0] - 2026-08-18

### Changed

- **Full UI redesign** across landing, login, register, and dashboard: unified on one design system (Cinematic Dark Luxury + Organic/Generative WebGL + Kinetic Typography + Brutalism + microinteractions) to replace the previous mismatched styling (rounded-pill nav/buttons, glassmorphism cards, soft neumorphism on the dashboard vs. sharp brutalist blocks on the marketing site).
- `Button`, `Input`, `StatusPill` rebuilt as hard-edge (`border-2`, square) primitives with mono uppercase labels, matching the marketing site's existing brutalist language; removed rounded-full pills and soft neumorphic shadows.
- Replaced `.neu` / `.neu-inset` (soft neumorphism) in `globals.css` with a single `.panel` / `.panel-hover` hard-edge surface, reused by `JobCard`, `SubmitResearchForm`, `DashboardNav`, the login/register panels, and the research markdown viewer.
- `DashboardNav` rebuilt from a floating glass pill bar to a fixed full-width bordered bar consistent with `SiteNav`.
- `/login` and `/register` rebuilt with a full-bleed `ShaderBackground` and an asymmetric bordered panel, replacing the centered glass-card layout.
- `ShaderBackground` fragment shader intensified: stronger gold/cyan neural-mass contrast, brighter synaptic pulses, and a new subtle falling "code-rain" strand layer for a more pronounced, abstract matrix-of-the-brain look.

## [0.2.0] - 2026-08-18

### Changed

- **Replaced Mistral with NVIDIA Nemotron** (`nvidia/nemotron-3-ultra-550b-a55b:free` via OpenRouter, reasoning enabled). `MistralProvider` -> `NemotronProvider`, env keys `MISTRAL_KEY_*` -> `OPENROUTER_KEY_*`.
- **Reassigned agent roles to match each provider's real capabilities**: Gemini and Grok both support live web search, so Gemini now runs the *Technical Deep Dive* (via Google Search grounding) and Grok runs *Current Developments* (via xAI live search); Nemotron (no web access) now runs *Broad Factual Research*.
- **Generalized agent prompts**: all three prompts now explicitly instruct the model to identify the kind of subject (topic, product, company, sector, person, event, etc.) and tailor research structure accordingly, instead of assuming every query is an abstract "topic".
- Gemini requests now use Google Search grounding (`tools: [{ google_search: {} }]`) and pass the API key via the `x-goog-api-key` header instead of a query string, keeping it out of server/proxy logs.
- Grok requests now enable xAI's live search grounding (`search_parameters: { mode: "auto" }`).

### Added

- SEO: full `metadataBase`, keyword list, Open Graph and Twitter card metadata, author/creator credit in `layout.tsx`.
- SVG favicon (`src/app/icon.svg`) and Open Graph share image (`public/og-image.svg`), both using the existing dark/gold/teal theme tokens.
- Site footer credit line linking GitHub, LinkedIn, and Twitter.

### Fixed

- **Critical: dev server 500 on every request.** `Fraunces` in `src/app/fonts.ts` declared a fixed `weight` array together with variable-font `axes` (`opsz`/`SOFT`/`WONK`), which Next.js's font loader rejects ("Axes can only be defined for variable fonts when the weight property is nonexistent or set to `variable`"). Changed `weight` to `"variable"`.
- Client-side submit form no longer allows submitting a query trimmed below 2 characters (`disabled` now checks trimmed length, not just the raw `minLength` attribute which can be bypassed).
- Server-side research query schema now trims before validating min/max length, matching client behavior and closing a gap where whitespace-only queries could pass validation.

## [0.1.2] - 2026-08-18

### Fixed

- **Cancel race condition**: `enqueueResearchJob` unconditionally overwrote job status to `PROCESSING` when its queued task started, clobbering a `CANCELLED` status set in the meantime — cancelling a still-queued job silently did nothing. The worker now re-checks the job's current status (and that it still exists) before starting the pipeline and skips it if already cancelled/deleted.
- **Unicode query normalization bug**: `normalizeQuery` stripped non-ASCII characters via `\w`, so any query written in a non-Latin script (CJK, Cyrillic, accented Latin, etc.) normalized to an empty string and was rejected with "Query cannot be empty". Now uses Unicode-aware `\p{L}\p{N}` matching so international queries work correctly.

### Security

- Added a `Content-Security-Policy` response header in `next.config.ts` (was missing despite other hardening headers already present).

## [0.1.1] - 2026-08-18

### Security

- Added `middleware.ts` with IP-based rate limiting (in-memory fixed window) on spam/abuse-prone routes: `POST /api/register` (5/hr), `POST /api/research` (20/min), `POST /api/auth/callback/credentials` (10/5min) — mitigates account-creation spam, job-flood/cost abuse against LLM keys, and credential brute-forcing.
- Added security response headers in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- `/login` and `/register` now redirect already-authenticated users to `/dashboard` server-side instead of re-rendering the auth forms.

### Fixed

- `jobsRepository.findPendingDuplicate`: moved the active-status filter (`PENDING`/`QUEUED`/`PROCESSING`) into the SQL `WHERE` clause instead of post-fetch, so dedup correctly considers the most recent *active* job for a query rather than the most recent job overall.

## [0.1.0] - 2026-08-18

### Added

- Initial scaffold: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.
- Database layer: Drizzle ORM schema (`users`, `researchJobs`, `researchResults`, `providerLogs`, `apiKeyPool`, `jobEvents`) targeting Neon Postgres.
- Auth: NextAuth v5 (beta) with Credentials (bcrypt) and Google OAuth providers, JWT sessions.
- LLM provider layer: `LLMProvider` strategy interface with Gemini, Mistral, and Grok implementations, API key rotation/failover pool, provider factory, and mock fallback for offline development.
- Multi-agent research pipeline: 3 parallel agents (broad factual, technical deep-dive, current developments), orchestrator with stage-by-stage SSE progress events, markdown aggregator.
- In-process research queue with configurable concurrency and worker.
- Repository/service layers for research jobs and results.
- API routes: registration, research submit/list/detail/cancel/delete, SSE event stream (`/api/events`), NextAuth catch-all.
- Design system: Cinematic Dark Luxury + Soft Neumorphism tokens in `globals.css`, Fraunces/Inter/IBM Plex Mono fonts.
- Landing page: GSAP kinetic-typography hero with WebGL shader background, scroll-triggered "How it works" section, agents showcase, footer.
- Auth pages (login/register) with glass-card layout.
- Dashboard: SSE-driven live job cards, submit form, pending/completed/history views, markdown research viewer (`react-markdown` + `remark-gfm`).
- `npm run db:generate` / `db:push` / `db:studio` scripts for Drizzle Kit.

### Fixed

- `JobCard`: removed invalid nested `<Link>`-inside-clickable-card pattern; replaced with a stretched-link technique so cancel/delete buttons remain independently clickable without nested interactive elements.