import Link from "next/link";

export function Footer() {
  return (
    <footer className="pt-16 pb-8">
      <div className="shell">
        <div className="grid gap-x-14 gap-y-10 border-b border-[color:var(--line-strong)] pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <p className="label text-frost-dim">Product</p>
            <Link href="/login" className="draw inline-block w-fit text-sm text-frost-muted hover:text-frost">
              Sign in
            </Link>
            <Link href="/register" className="draw inline-block w-fit text-sm text-frost-muted hover:text-frost">
              Create account
            </Link>
            <Link href="/dashboard" className="draw inline-block w-fit text-sm text-frost-muted hover:text-frost">
              Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="label text-frost-dim">Pipeline</p>
            <span className="text-sm text-frost-muted">Nemotron · Gemini · Grok</span>
            <span className="text-sm text-frost-muted">Postgres · Drizzle</span>
            <span className="text-sm text-frost-muted">Next.js · SSE</span>
          </div>

          <div className="flex flex-col gap-3">
            <p className="label text-frost-dim">Built by</p>
            <a
              href="https://github.com/arindal1"
              target="_blank"
              rel="noreferrer noopener"
              className="draw inline-block w-fit text-sm text-frost-muted hover:text-frost"
            >
              Arindal Char
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <p className="label text-frost-dim">Status</p>
            <span className="label flex items-center gap-2 text-cryo">
              <span aria-hidden className="signal inline-block h-1.5 w-1.5 bg-current" />
              Pipeline nominal
            </span>
          </div>
        </div>

        {/* Wordmark as the closing graphic - type is the image */}
        <p
          aria-hidden
          className="display mt-10 w-full text-[length:var(--step-6)] leading-[0.8] text-frost-dim/20 select-none"
        >
          BRAIN FREEZE
        </p>

        <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row">
          <p className="label text-frost-dim">© {new Date().getFullYear()} Brain Freeze</p>
          <p className="label text-frost-dim">Ask once. Walk away.</p>
        </div>
      </div>
    </footer>
  );
}