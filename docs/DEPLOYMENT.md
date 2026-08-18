# Deploying Brain Freeze (free tier)

Brain Freeze is a standard Next.js app **with one important constraint**: research jobs run on an
in-process, in-memory FIFO queue (`src/queue/researchQueue.ts`). That queue's state (and the
`EventEmitter`-based SSE bus in `src/pipeline/eventBus.ts`) only exists inside a single long-lived
Node process.

> **This means Brain Freeze cannot run on a request-scoped serverless platform** (Vercel's default
> serverless functions, Netlify Functions, AWS Lambda, etc.). Each invocation there is a fresh,
> short-lived process — a job enqueued in one invocation is invisible to the next, and queued work
> can be silently dropped the moment the function that enqueued it returns. You need a host that
> runs `next start` as one persistent process. Render, Railway, Fly.io, and a self-managed VM all
> work; this guide uses **Render** because its free web service tier is the simplest to wire up.

## What you'll need (all free tiers)

| Purpose | Service | Free tier |
|---|---|---|
| App hosting (persistent Node process) | [Render](https://render.com) Web Service | 750 hrs/month, spins down after 15 min idle |
| Postgres database | [Neon](https://neon.tech) or [Supabase](https://supabase.com) | Both have a permanent free Postgres tier |
| Auth secret | generated locally, no service needed | — |
| Google OAuth (optional) | [Google Cloud Console](https://console.cloud.google.com/) | Free |
| LLM providers | Gemini (Google AI Studio), OpenRouter (Nemotron), xAI (Grok) | Each has a free/no-cost tier or trial credit — see below |

---

## 1. Provision Postgres (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the pooled connection string it gives you (starts with `postgres://...?sslmode=require`).
   This is your `DATABASE_URL`.
3. From your machine, with `DATABASE_URL` set locally, push the schema:
   ```powershell
   $env:DATABASE_URL = "postgres://...neon.tech/...?sslmode=require"
   npm run db:push
   ```
   This creates the tables defined in [`src/db/schema.ts`](../src/db/schema.ts) via Drizzle.

*(Supabase's free Postgres works identically — just use its connection string instead.)*

## 2. Generate an auth secret

NextAuth v5 needs a stable secret to sign session JWTs.

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Save the output as `AUTH_SECRET`.

## 3. (Optional) Set up Google sign-in

The Google button is automatically hidden if these two variables aren't set — you can skip this
section entirely and use email/password only.

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth
   2.0 Client ID (Web application).
2. Authorized redirect URI: `https://<your-render-domain>.onrender.com/api/auth/callback/google`
   (add your custom domain too, once you have one).
3. Copy the Client ID / Client secret as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## 4. Get LLM provider keys

Each provider supports **key rotation** — you can set `..._KEY_1` through `..._KEY_10` and the app
fails over automatically on rate limits (`src/providers/keyManager.ts`). One key each is enough to
start. If a provider has no key configured at all, it returns clearly-labelled placeholder text
instead of failing the whole job.

- **Gemini** — [Google AI Studio](https://aistudio.google.com/apikey) → free tier API key →
  `GEMINI_KEY_1`.
- **Nemotron (via OpenRouter)** — [OpenRouter](https://openrouter.ai/keys) → create a key. The app
  calls a `:free` OpenRouter model, so no paid credits are required → `OPENROUTER_KEY_1`.
- **Grok (via xAI)** — [xAI Console](https://console.x.ai/) → create a key (xAI currently issues
  trial credit to new accounts) → `GROK_KEY_1`.

## 5. Deploy to Render

1. Push this repo to GitHub.
2. In Render: **New → Web Service** → connect the repo.
3. Settings:
   - **Runtime**: Node
   - **Build command**: `npm ci && npm run build`
   - **Start command**: `npm start`
   - **Instance type**: Free
4. Add environment variables (Render dashboard → Environment):

   ```
   DATABASE_URL=postgres://...neon.tech/...?sslmode=require
   AUTH_SECRET=<generated secret>
   AUTH_TRUST_HOST=true
   GEMINI_KEY_1=...
   OPENROUTER_KEY_1=...
   GROK_KEY_1=...

   # optional
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   WORKER_CONCURRENCY=2
   ```

5. Deploy. Render gives you `https://<name>.onrender.com` — NextAuth (`trustHost: true` is already
   set in [`src/auth/auth.ts`](../src/auth/auth.ts)) will derive callback URLs from the incoming
   request automatically, so no `NEXTAUTH_URL` is required.

### Free-tier caveat: cold starts and idle jobs

Render's free web services spin down after ~15 minutes of no inbound HTTP traffic, which pauses
the in-memory queue along with everything else. A job that's mid-flight when the instance sleeps
resumes once the next request wakes it back up (Render auto-wakes on the next incoming request),
but there's no guarantee of *when* that happens. For a hobby/demo deployment this is an acceptable
trade-off; if you need guaranteed background processing, upgrade to a paid always-on instance or
move the queue to Redis/BullMQ as noted in `src/queue/researchQueue.ts`.

## 6. Verify

- `https://<name>.onrender.com` loads the marketing page.
- `/register` creates an account and lands on `/dashboard`.
- Submitting a query in the console shows a job move from `Queued` → `Running` → `Ready` (SSE
  updates live, no page refresh needed).
- If you configured Google OAuth, "Continue with Google" appears on `/login` and `/register`.

## Troubleshooting

- **`[auth][error] TypeError: fetch failed` + `/api/auth/error?error=Configuration` 500** — this
  happened when the Google provider was registered with empty `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.
  Fixed: the app now only registers the Google provider when both variables are present, and hides
  the "Continue with Google" button otherwise. If you still see this, double check both variables
  are set (not empty strings) on your host.
- **Database connection errors on Render** — Neon's pooled connection string requires
  `sslmode=require`; make sure it's included in `DATABASE_URL`.
- **Sessions don't persist / random sign-outs** — usually means `AUTH_SECRET` isn't set or changes
  between deploys (e.g. regenerated on every build). Set it once as a static environment variable.