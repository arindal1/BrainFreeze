"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { CryoFallback } from "@/components/three/CryoField";

const CryoField = dynamic(() => import("@/components/three/CryoField"), {
  ssr: false,
  loading: () => <CryoFallback />,
});

/**
 * Split instrument shell: a live cryo field carrying the statement on the
 * left, a bare hairline form column on the right. No centered card in a void.
 */
export function AuthShell({
  eyebrow,
  headline,
  statement,
  spec,
  children,
  footer,
}: {
  eyebrow: string;
  headline: ReactNode;
  statement: string;
  spec: [string, string][];
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-[1.15fr_1fr]">
      <aside className="grain relative hidden flex-col justify-between overflow-hidden border-r border-[color:var(--line-strong)] px-10 py-10 lg:flex">
        <CryoField heat={0.7} />

        <Link href="/" className="label draw inline-block w-fit text-frost-muted hover:text-frost">
          ← Brain Freeze
        </Link>

        <div>
          <p className="label mb-7 flex items-center gap-3 text-cryo">
            <span className="inline-block h-px w-10 bg-current" />
            {eyebrow}
          </p>
          <h1 className="display text-[length:var(--step-4)]">{headline}</h1>
          <p className="lede mt-7">{statement}</p>
        </div>

        <dl className="grid grid-cols-3 gap-6 border-t border-[color:var(--line-strong)] pt-5">
          {spec.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <dt className="label text-frost-dim">{k}</dt>
              <dd className="font-mono text-xs text-frost">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <main className="flex flex-col justify-center px-5 py-20 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="label draw mb-12 inline-block text-frost-muted hover:text-frost lg:hidden">
            ← Brain Freeze
          </Link>

          <p className="label mb-3 text-flare lg:hidden">{eyebrow}</p>
          <h2 className="display mb-10 text-[length:var(--step-3)] lg:hidden">{headline}</h2>

          {children}

          <div className="mt-12 border-t border-[color:var(--line-strong)] pt-6 text-sm text-frost-dim">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}