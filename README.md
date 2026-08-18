# Brain Freeze

Intelligent asynchronous research platform. Submit any research query - a topic, product, company, sector, person, or event - walk away, and get a structured markdown document once a multi-agent pipeline (Gemini + Nemotron + Grok) finishes researching it in the background.

![image0](/public/image-home.png)

## Getting started

1. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (Neon Postgres), `AUTH_SECRET`, OAuth credentials, and provider API keys.
2. Install dependencies: `npm install`
3. Push the database schema: `npm run db:push`
4. Run the dev server: `npm run dev`

Without any provider keys configured, the pipeline still runs end-to-end using deterministic placeholder responses per provider - useful for local development.

## Architecture

See [docs/TRD.md](docs/TRD.md) for the full technical requirements document, [ARCHITECTURE.md](ARCHITECTURE.md) for architecture and data flow, and [MAP.md](MAP.md) for the full file/folder map.

- `src/db` - Drizzle schema + client (Postgres/Neon)
- `src/providers` - `LLMProvider` strategy interface, Gemini/Nemotron (OpenRouter)/Grok implementations, API key rotation pool, provider factory
- `src/pipeline` - research agents, orchestrator, SSE event bus
- `src/aggregator` - merges agent responses into one markdown document
- `src/queue` - in-process FIFO job queue (concurrency configurable via `WORKER_CONCURRENCY`)
- `src/workers` - picks queued jobs and runs the pipeline
- `src/repositories` / `src/services` - data access and business logic layers
- `src/auth` - NextAuth v5 (credentials + Google OAuth)
- `src/components` - marketing site, dashboard, auth forms, shared UI, WebGL background

See [CHANGELOG.md](CHANGELOG.md) for release history.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.