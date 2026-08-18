# Project Map

File/folder structure and module responsibilities for Brain Freeze. See [ARCHITECT.md](ARCHITECT.md) for data flow and design rationale.

```
brainfreeze/
├── docs/
│   └── TRD.md                      Technical requirements document (source of truth for product/feature scope)
├── drizzle.config.ts                drizzle-kit CLI config (schema path, DATABASE_URL)
├── middleware.ts                    IP-based rate limiting on register/research-submit/credentials-login
├── next.config.ts                   Security response headers (CSP-adjacent: X-Frame-Options, HSTS, etc.)
├── .env.example                     Env var template (DATABASE_URL, AUTH_SECRET, OAuth, provider keys)
│
└── src/
    ├── db/
    │   ├── schema.ts                Drizzle schema: users, researchJobs, researchResults, providerLogs, apiKeyPool, jobEvents
    │   └── index.ts                 Drizzle client singleton (dev-safe global caching)
    │
    ├── providers/                   LLM provider strategy + factory pattern
    │   ├── types.ts                 LLMProvider interface, ProviderError
    │   ├── keyManager.ts            API key rotation pool, cooldown-based failover
    │   ├── implementations.ts       GeminiProvider, NemotronProvider (OpenRouter), GrokProvider + mock fallback
    │   └── providerFactory.ts       createProvider(name) factory
    │
    ├── pipeline/                    Multi-agent orchestration
    │   ├── agents.ts                3 agent definitions + prompt builders
    │   ├── orchestrator.ts          runResearchPipeline(jobId, userId) - full stage sequence
    │   └── eventBus.ts              JobEventBus (EventEmitter) for SSE progress events
    │
    ├── aggregator/
    │   └── aggregator.ts            aggregateToMarkdown(topic, sections) - merges agent output into one doc
    │
    ├── queue/
    │   └── researchQueue.ts         In-process FIFO queue, configurable concurrency
    │
    ├── workers/
    │   └── researchWorker.ts        enqueueResearchJob(jobId, userId) - pipeline + error handling wrapper
    │
    ├── repositories/
    │   └── researchRepository.ts    jobsRepository, resultsRepository, providerLogsRepository
    │
    ├── services/
    │   └── researchService.ts       submit / list / cancel / remove (business logic layer)
    │
    ├── lib/
    │   ├── normalize.ts             normalizeQuery() for duplicate detection
    │   └── rateLimit.ts             In-memory fixed-window rate limiter used by middleware.ts
    │
    ├── auth/
    │   └── auth.ts                  NextAuth v5 config (Credentials + Google, JWT session)
    │
    ├── types/
    │   └── next-auth.d.ts           Module augmentation for session.user.id
    │
    ├── app/
    │   ├── fonts.ts                 Fraunces/Inter/IBM Plex Mono via next/font/google
    │   ├── globals.css              Design tokens + utility classes (.glass, .neu, .markdown-body, reduced-motion)
    │   ├── layout.tsx                Root layout, wraps app in AuthSessionProvider
    │   ├── page.tsx                  Landing page assembly
    │   ├── login/page.tsx            Login page
    │   ├── register/page.tsx         Register page
    │   ├── dashboard/
    │   │   ├── layout.tsx             Auth-guarded dashboard shell
    │   │   ├── page.tsx               Active/pending jobs view
    │   │   ├── completed/page.tsx     Completed jobs view
    │   │   ├── history/page.tsx       Full history view
    │   │   └── research/[id]/page.tsx Markdown research document viewer
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts   NextAuth catch-all route
    │       ├── register/route.ts             User registration endpoint (zod + bcrypt)
    │       ├── research/route.ts             List/submit research jobs
    │       ├── research/[id]/route.ts        Job detail/cancel/delete
    │       └── events/route.ts               SSE endpoint (native ReadableStream)
    │
    └── components/
        ├── providers/AuthSessionProvider.tsx  Client wrapper for next-auth SessionProvider
        ├── ui/                                Button, Input, StatusPill (shared primitives)
        ├── three/ShaderBackground.tsx         Custom GLSL noise WebGL background (dynamic import, ssr:false)
        ├── marketing/                         SiteNav, Hero (GSAP+WebGL), HowItWorks (ScrollTrigger), AgentsSection, SiteFooter
        ├── auth/                              LoginForm, RegisterForm
        └── dashboard/                         DashboardNav, useResearchJobs (SSE hook), SubmitResearchForm, JobCard
```

## Key dependencies

| Package | Purpose |
|---|---|
| `next`, `react`, `react-dom` | App framework |
| `drizzle-orm`, `drizzle-kit`, `postgres` | Database ORM + migrations + Postgres driver |
| `next-auth` (v5 beta), `@auth/drizzle-adapter`, `bcryptjs` | Auth |
| `zod` | Validation (registration, forms) |
| `zustand` | Client state (available, not yet used) |
| `gsap`, `@gsap/react` | Kinetic typography, scroll-triggered animation |
| `@react-three/fiber`, `@react-three/drei`, `three` | WebGL hero background |
| `react-hook-form`, `@hookform/resolvers` | Form handling (available, forms currently use plain `useState`) |
| `react-markdown`, `remark-gfm`, `rehype-highlight` | Research document rendering |
| `framer-motion` | Available for motion, not yet used (GSAP covers current needs) |
| `nanoid` | ID generation |
| `server-only` | Marks server-only modules to prevent client bundle leakage |