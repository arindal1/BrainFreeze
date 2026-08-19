# Changelog

All notable changes to Brain Freeze are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/).

## [0.7.3] - 2026-08-19

### Changed

- **"Ready to read" now only shows unread documents**: previously every completed job stayed listed there forever (duplicating the Archive). `research_jobs` gained an `opened_at` timestamp column; opening a finished document (`GET /api/research/[id]`) now stamps it via a new `jobsRepository.markOpened()` on first view, and the Ready page (`src/app/dashboard/completed/page.tsx`) filters to `status === "COMPLETED" && !openedAt`. Once opened, a job disappears from Ready but remains in the Archive indefinitely until explicitly deleted - Archive's behavior is unchanged.

## [0.7.2] - 2026-08-19

### Changed

- **Removed the Groq provider**: agent-c ("Current Developments") is no longer LLM-backed. It now returns Tavily web search results directly - and, for URL queries, a Firecrawl page scrape - unedited and unsummarized, instead of feeding them into a Groq (`llama-3.3-70b-versatile`) prompt. `src/providers/implementations.ts` drops `GroqProvider`; `providerFactory.ts`'s `ProviderName` shrinks to `"gemini" | "nemotron"`; `pipeline/agents.ts`'s `agent-c` definition drops `buildPrompt` in favor of a `provider: "search"` marker; `orchestrator.ts` special-cases that marker to build the section from `tavilySearch`/`firecrawlScrape` directly instead of calling `provider.generate()`. Provider logs for agent-c now record under `"search"` instead of `"groq"`. `src/lib/pricing.ts` drops the Groq cost-per-token entry, `.env.example` drops `GROQ_KEY_1/2`, and the marketing `Agents.tsx` card for agent C updated to describe the direct-search behavior.

## [0.7.1] - 2026-08-19

### Added

- **Research streaks**: the dispatch console shows "N days running" once the streak reaches 2+ consecutive days with at least one submitted job (no counter, no reset messaging, at 0-1 days - not a guilt trip). Computed client-side (`src/lib/streak.ts`) from jobs already loaded by the dashboard, no new query.
- **"Surprise me" button**: a secondary action next to Dispatch in `Console.tsx` that submits a random topic from a curated list (`src/lib/surpriseTopics.ts`, 20 broad, cross-domain prompts) through the same submit path as a typed query, avoiding immediate repeats.

## [0.7.0] - 2026-08-19

### Added

- **Web Push notifications (VAPID)**: research alerts now fire even with no dashboard tab open. `public/sw.js` is a new service worker that receives push events, shows an OS notification when no tab is visible, or hands the update to any visible tab via `postMessage` instead (avoiding a double-alert). `src/lib/push.ts` (server) sends pushes through the `web-push` package to every subscription a user has registered; `src/lib/pushClient.ts` (browser) registers the service worker and subscribes via `PushManager`. New `push_subscriptions` table (already scaffolded in `schema.ts`) is now backed by `pushSubscriptionsRepository` (`src/repositories/researchRepository.ts`) and a `POST`/`DELETE /api/push/subscribe` route. `NotificationToggle` now also registers a push subscription the moment permission is granted (and re-registers on revisit if the subscription was dropped). Requires `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` env vars (see `.env.example`); push is skipped entirely if unset. `orchestrator.ts` calls `sendPushToUser` on both job completion and job failure.
- **In-app toast + sound alerts**: a lighter-weight companion to OS notifications. New `src/lib/toastBus.ts` (module-level pub/sub) + `ToastViewport.tsx` (mounted in the dashboard layout) render dismissible toasts with a link to the finished document. `src/lib/soundAlert.ts` plays a short synthesized two-tone chime (WebAudio, no audio asset) on every alert; `SoundToggle.tsx` in `DashboardNav` lets the user mute it (`src/lib/soundPreference.ts`, `localStorage`-backed). Both the SSE-driven job-status transition detector and the service-worker push bridge now funnel through a single `fireJobAlert()` (`src/lib/jobAlerts.ts`) that fires the toast, the sound, and (if permission was granted) the OS notification.
- **Cross-tab/service-worker dedupe**: `src/lib/notifyDedupe.ts` uses a short-TTL `localStorage` claim (`claimAlert`) so a job finishing only ever triggers one alert - not one per open dashboard tab, and not twice when both the SSE path and a push message report the same completion.
- **Usage dashboard**: new `/dashboard/usage` page (`src/app/dashboard/usage/page.tsx`) shows jobs this month, jobs all-time, total provider calls, and an estimated cost, plus a per-provider breakdown (calls, failures, prompt/completion tokens, estimated cost). Backed by `usageRepository.summaryForUser` (`src/repositories/researchRepository.ts`) and `estimateCostUsd` (`src/lib/pricing.ts`, rough public list pricing - not exact billing). `providerLogs` gained `promptTokens`/`completionTokens` columns, populated from each provider's own usage reporting (Gemini `usageMetadata`, Groq/Nemotron OpenAI-compatible `usage`) via a new optional `usage` field on `ProviderResponse`.
- **Mobile dashboard pass**: `DashboardNav`'s mobile tab rail now scrolls horizontally (`overflow-x-auto`, `min-w-[5.5rem]` per tab) to fit the new "Usage" tab without crowding; the "Enable alerts" control shows a shorter "Alerts" label below the `sm` breakpoint instead of being clipped, and `SoundToggle` is visible (not hidden) on mobile so muting the chime doesn't require a wider viewport.

### Changed

- `next.config.ts` CSP gained `worker-src 'self'` so the service worker is allowed to register under the existing Content-Security-Policy.
- `src/lib/notifications.ts` no longer exports `notifyJobFinished` (superseded by `fireJobAlert`, which layers push + toast + sound + dedupe on top of the same permission check).

## [0.6.0] - 2026-08-19

### Added

- **Browser notifications for finished research runs**: new `src/lib/notifications.ts` wraps the `Notification` API (permission is never requested automatically). A new "Enable alerts" control (`src/components/dashboard/NotificationToggle.tsx`) in `DashboardNav` lets the user opt in and shows the current state (`Enable alerts` / `Alerts on` / `Alerts blocked`, hidden entirely if the browser doesn't support notifications). `useResearchJobs` now tracks each job's last-seen status and fires a native "Research ready" / "Research failed" notification the moment a job transitions into `COMPLETED`/`FAILED` over the existing SSE-driven refresh - never for jobs that were already finished on page load. Notifications are tagged per job so re-renders replace rather than stack, and clicking one focuses the tab.

## [0.5.4] - 2026-08-19

### Security

- **Removed a hardcoded live Neon Postgres connection string** (including plaintext password) that had been committed as the fallback default for `DATABASE_URL` in `src/db/index.ts`. It now falls back to an inert `localhost` placeholder (matching `.env.example`) so builds without a configured DB still don't crash, but no real credential can leak from source. **This credential is present in prior git history — rotate the Neon database password immediately regardless of this fix**, since removing it from the working tree does not remove it from history.
- Removed `freeze_codebase_dump.txt`, a stray full-repo text dump that had been committed to the repository; added `*codebase_dump*.txt` to `.gitignore` to prevent recurrence.

### Fixed

- **`PATCH /api/research/[id]` (cancel action) returned an unhandled 500** instead of a proper status code when the job didn't exist/wasn't owned by the caller, or was already completed. `researchService.cancel` now throws typed `NotFoundError`/`ConflictError`, and the route maps them to `404`/`409` respectively.

## [0.5.3]

### Changed

- **agent-c provider swapped Grok → Groq Cloud**: `src/providers/implementations.ts` replaces `GrokProvider` with `GroqProvider` (model `llama-3.3-70b-versatile`, `POST api.groq.com/openai/v1/chat/completions`, key pool `GROQ_KEY_N`). Briefly used Cerebras (`gemma-4-31b`) as an intermediate step but swapped to Groq since the Cerebras account had no billing configured (`402 Payment Required`). `providerFactory.ts`, `pipeline/agents.ts`, and the marketing `Agents.tsx` card (model/route/mandate copy) updated to match.

### Added

- **Tavily web search grounding**: new `src/providers/tavily.ts` (`tavilySearch`, key pool `TAVILY_KEY_N`) queries `api.tavily.com/search` and is always appended as context to agent-c's prompt in `src/pipeline/orchestrator.ts`.
- **Firecrawl URL scrape grounding**: new `src/providers/firecrawl.ts` (`firecrawlScrape`, optional `FIRECRAWL_KEY` for higher rate limits) calls `api.firecrawl.dev/v2/scrape` and is appended to agent-c's context when the submitted query is itself a URL. New `isUrl()` helper added to `src/lib/normalize.ts` to detect this.
- `.env.example` updated with `GROQ_KEY_1/2`, `TAVILY_KEY_1/2`, `FIRECRAWL_KEY`; `GROK_KEY_1/2` removed.

## [0.5.2]

### Changed

- `CryoField` (WebGL background) dimmed back down: reduced the cold body/seam glow contributions and darkened the vignette multiplier so the field reads as a subtle backdrop again instead of the brighter, more prominent look introduced in 0.4.0.
- `src/app/layout.tsx` metadata centralized: `SITE_URL`/`SITE_NAME`/`SITE_TITLE`/`SITE_DESCRIPTION` moved to a shared `src/lib/seo.ts` so metadata, `robots.ts`, `sitemap.ts`, and `manifest.ts` can't drift from one another. Also fixed a bug where `icons.icon`/`icons.shortcut` pointed at a non-existent `/icon.svg` (the real file is `public/favicon.svg`).

### Added

- **DB keep-alive ping**: `src/db/index.ts` now starts a 5-minute `setInterval` (`select 1`) singleton on module load to stop Neon (and similar managed Postgres providers) from suspending the compute after 5 minutes of idle, avoiding cold-start latency on the next request. The interval is `unref()`'d so it never keeps a script/test process alive by itself, and is cached on `globalThis` like the existing DB client singleton to survive dev HMR.
- **App self-ping keep-alive**: new `GET /api/health` route (`src/app/api/health/route.ts`, no auth/DB dependency) plus `instrumentation.ts`, which starts a 10-minute self-ping against it on server boot using Render's auto-injected `RENDER_EXTERNAL_URL` (or a manual `SELF_URL`). Keeps an already-awake Render free-tier instance from spinning down after its 15-minute idle window; documented (including its limits - it can't wake an instance that's already asleep) in `docs/DEPLOYMENT.md`.
- **SEO pass**: added `src/app/robots.ts` (allows all crawlers on marketing/auth pages, disallows `/dashboard` and `/api/`, points at the sitemap), `src/app/sitemap.ts` (`/`, `/login`, `/register`), and `src/app/manifest.ts` (web app manifest for installability/PWA metadata). Added `alternates.canonical`, a `viewport` export (`themeColor`/`colorScheme`), explicit `robots.googleBot` directives (`max-image-preview: large`, `max-snippet`/`max-video-preview: -1`), and a JSON-LD `<script>` (`Organization` + `WebSite` + `SoftwareApplication`) in `RootLayout` for rich-result eligibility. `src/app/dashboard/layout.tsx` now sets `robots: { index: false, follow: false, nocache: true }` since it's an auth-gated, non-public area. Replaced the static `og-image.svg`/hardcoded OG/Twitter `images` metadata with generated `src/app/opengraph-image.tsx` / `src/app/twitter-image.tsx` (via a shared `src/lib/ogImage.tsx` renderer using `next/og`'s `ImageResponse`), so social previews are correctly-sized PNGs auto-linked by Next's file-convention metadata instead of manually-listed SVGs.

## [0.5.1] - 2026-08-18

### Fixed

- **Google sign-in crashed the whole auth flow when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` weren't set**: NextAuth still attempted OIDC discovery against Google for a provider registered with empty credentials, logging `[auth][error] TypeError: fetch failed` and then hard-500ing on `/api/auth/error?error=Configuration` the moment "Continue with Google" was clicked. `src/auth/auth.ts` now only registers the Google provider when both env vars are present (exported as `isGoogleAuthEnabled`), and `LoginForm`/`RegisterForm` hide the "Continue with Google" button entirely when it's unconfigured - email/password auth is unaffected either way.
- Added `trustHost: true` to the NextAuth config, required once the app is deployed behind a PaaS reverse proxy (Render, Railway, Fly.io, etc.) so callback URLs are derived correctly without also requiring `NEXTAUTH_URL`.

### Added

- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): step-by-step guide to deploying on entirely free-tier services (Render for hosting, Neon/Supabase for Postgres, free-tier Gemini/OpenRouter/xAI keys), including why the in-process research queue requires a persistent-process host rather than request-scoped serverless functions, and a troubleshooting section covering the Google Configuration error above.

## [0.5.0] - 2026-08-18

### Fixed

- **Mobile UI audit**: `JobRow` "Stop"/"Delete" actions were revealed only via `:hover`/`:focus-within`, which don't exist on touch devices - on phones and tablets these controls were permanently invisible and untappable. Now visible by default and only hover-hidden at `md:` and above (desktop pointer devices).
- Research document markdown tables (`.doc table`) used `width: 100%` with no scroll container, so wide tables (common in generated reports) were silently clipped on narrow phone viewports by the page's `overflow-x: hidden`. Tables now scroll horizontally within themselves (`display: block; width: max-content; max-width: 100%; overflow-x: auto`) instead of losing columns off-screen.

## [0.4.0] - 2026-08-18

### Changed

- **Marketing site UI audit and pass** (Playwright-driven, screenshots at 1440/960/390px): fixed `Protocol`'s horizontal "side scroller" section, which pinned with zero scroll distance and appeared frozen because its GSAP `matchMedia` breakpoint (900px) didn't match the Tailwind breakpoint at which the track actually switched to `flex-row` (`lg`, 1024px) - both now use 1024px, and a bottom progress rail was added so horizontal travel is legible.
- Introduced a shared layout rhythm - `--shell` (96rem), `--gutter`, `--section-y` tokens plus `.shell` / `.section-y` utility classes - and moved `Hero`, `Protocol`, `Agents`, `Brief`, `Nav`, and `Footer` onto it, replacing five slightly-different hand-rolled `mx-auto max-w-[110rem] px-5 md:px-10 py-*` combinations that were the source of the reported grid/spacing inconsistency.
- Retuned the fluid type scale (`--step-3` through `--step-6`) so display headings no longer overflow their grid columns at mid-size viewports (960–1200px).
- Extracted a shared `.eyebrow` component (label + leading rule) and `CtaLink` component to replace four independently hand-rolled copies of each that had drifted in gap/padding.
- Moved bespoke CSS primitives (`.shell`, `.display`, `.label`, `.eyebrow`, `.lede`, `.slab`, `.draw`, `.pressure`, `.hatch`) into a Tailwind `@layer components` block, and renamed `.invert` to `.frostblock`, fixing a name collision with Tailwind's own `invert` filter utility and a specificity bug where `.draw`'s implicit `display: inline-block` silently overrode responsive `hidden` / `sm:inline-block` utilities on nav/footer links.
- `CryoField` (WebGL hero background) made more visually prominent: brighter cold body/seam colors, a wider ice-crystal lattice, a lighter vignette so the field no longer reads as almost-flat black, and a legibility scrim (linear gradient) over the hero text instead of dimming the whole canvas.
- `Nav` gets a readability gradient over the transparent (unscrolled) state now that the hero field behind it is brighter.

### Added

- Brutalist-themed Next.js util routes, reusing existing design primitives (`CryoField`, `.eyebrow`, `.lede`, `.pressure`, `.signal`, `.sweep`, `Button`): `src/app/not-found.tsx` (404 "NODE NOT FOUND"), `src/app/error.tsx` (route error boundary, "PIPELINE INTERRUPTED", shows error message + `reset()` retry), `src/app/global-error.tsx` (root layout failure fallback, "INSTRUMENT OFFLINE"), `src/app/loading.tsx` (root Suspense fallback).
- `CryoFieldBackdrop` client component wrapping `next/dynamic(..., { ssr: false })` so the WebGL field can be used from server components like `not-found.tsx` (a bare `dynamic({ ssr: false })` call is rejected by Next.js inside Server Components).
- Redesigned `src/app/icon.svg` and `public/og-image.svg` to match the Cryo Instrument theme: void-black background, hard-edged cryo-blue crystal facet mark, a single vermillion flare square as the "hot signal" accent, hairline borders - replacing the old gold/teal diamond mark.
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

- **Cancel race condition**: `enqueueResearchJob` unconditionally overwrote job status to `PROCESSING` when its queued task started, clobbering a `CANCELLED` status set in the meantime - cancelling a still-queued job silently did nothing. The worker now re-checks the job's current status (and that it still exists) before starting the pipeline and skips it if already cancelled/deleted.
- **Unicode query normalization bug**: `normalizeQuery` stripped non-ASCII characters via `\w`, so any query written in a non-Latin script (CJK, Cyrillic, accented Latin, etc.) normalized to an empty string and was rejected with "Query cannot be empty". Now uses Unicode-aware `\p{L}\p{N}` matching so international queries work correctly.

### Security

- Added a `Content-Security-Policy` response header in `next.config.ts` (was missing despite other hardening headers already present).

## [0.1.1] - 2026-08-18

### Security

- Added `middleware.ts` with IP-based rate limiting (in-memory fixed window) on spam/abuse-prone routes: `POST /api/register` (5/hr), `POST /api/research` (20/min), `POST /api/auth/callback/credentials` (10/5min) - mitigates account-creation spam, job-flood/cost abuse against LLM keys, and credential brute-forcing.
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