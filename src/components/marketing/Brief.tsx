"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { CtaLink } from "@/components/ui/CtaLink";

const EXAMPLES = [
  "Solid-state battery supply chain, 2026",
  "Rust vs Go for high-throughput services",
  "What ASML actually sells",
  "Post-quantum crypto migration status",
  "Who is Aravind Srinivas",
];

export function Brief() {
  return (
    <section id="brief" className="relative overflow-hidden border-b border-[color:var(--line-strong)]">
      {/* Marquee band — the only purely decorative motion on the page */}
      <div className="hatch overflow-hidden border-b border-[color:var(--line-strong)] py-4">
        <div className="slide flex w-max whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, dup) => (
            <span key={dup} className="flex" aria-hidden={dup === 1}>
              {EXAMPLES.map((e) => (
                <span key={e} className="label flex items-center gap-10 pr-10 text-frost-dim">
                  {e}
                  <span className="text-flare">◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="section-y shell grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end">
        <Reveal kind="wipe">
          <p className="eyebrow label mb-8">Open a node</p>
          <h2 className="display text-[length:var(--step-4)] leading-[0.92]">
            Give it the
            <br />
            question you
            <br />
            <span className="text-frost-dim">keep postponing.</span>
          </h2>
        </Reveal>

        <Reveal kind="rise" delay={0.12} className="flex flex-col gap-8">
          <p className="lede">
            Free to start. Documents are stored against your account permanently — every report
            you generate stays searchable in your history.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <CtaLink href="/register">Create an account</CtaLink>
            <Link href="/login" className="label draw inline-block text-frost-muted hover:text-frost">
              I already have one
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}