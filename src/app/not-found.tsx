import Link from "next/link";
import { CryoFieldBackdrop } from "@/components/three/CryoFieldBackdrop";

export const metadata = { title: "Node not found" };

const spec: [string, string][] = [
  ["Status", "404 · Not found"],
  ["Signal", "Lost"],
  ["Suggested", "Home / Dashboard"],
  ["Code", "ERR_NODE_MISSING"],
];

export default function NotFound() {
  return (
    <div className="grain relative flex min-h-[100svh] flex-col justify-between overflow-hidden border-b border-[color:var(--line-strong)] px-5 pt-32 pb-8 md:px-10">
      <CryoFieldBackdrop heat={1.4} />

      <Link href="/" className="label draw inline-block w-fit text-frost-muted hover:text-frost">
        ← Brain Freeze
      </Link>

      <div className="flex flex-1 flex-col justify-center">
        <p className="eyebrow label mb-8 text-flare">Error 404</p>

        <h1 className="display text-[length:var(--step-6)] leading-[0.85]">
          NODE
          <br />
          NOT FOUND
        </h1>

        <p className="lede mt-7">
          The query resolved to nothing. Whatever was queued here has been cancelled, moved, or
          never existed in the first place.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            href="/"
            className="pressure group label inline-flex items-center gap-3 border border-[color:var(--line-hot)] px-7 py-4 text-flare transition-colors duration-300 hover:text-frost"
          >
            Return to base
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link href="/dashboard" className="label draw text-frost-muted hover:text-frost">
            Go to dashboard
          </Link>
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-px border-t border-[color:var(--line-strong)] pt-5 md:grid-cols-4">
        {spec.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1.5">
            <dt className="label text-frost-dim">{k}</dt>
            <dd className="font-mono text-xs text-frost">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}