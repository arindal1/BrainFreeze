"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CryoFallback } from "@/components/three/CryoField";
import { CtaLink } from "@/components/ui/CtaLink";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CryoField = dynamic(() => import("@/components/three/CryoField"), {
  ssr: false,
  loading: () => <CryoFallback />,
});

const LINES = ["Ask once.", "Walk away.", "Return to a document."];

const readout = [
  ["Agents", "03 parallel"],
  ["Dispatch", "Queued, non-blocking"],
  ["Output", "One markdown report"],
  ["Your wait", "None"],
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Load: each line rises out of its own mask, at its own pace.
        gsap.from(".hero-line > span", {
          yPercent: 118,
          duration: 1.25,
          ease: "expo.out",
          stagger: 0.11,
        });

        gsap.from(".hero-meta", {
          opacity: 0,
          y: 18,
          duration: 0.9,
          delay: 0.55,
          ease: "power3.out",
          stagger: 0.06,
        });

        // Scroll: the headline is scrubbed apart — variable weight drops,
        // tracking opens, the block drifts up faster than the page.
        gsap.to(".hero-type", {
          fontWeight: 400,
          letterSpacing: "0.06em",
          yPercent: -22,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden border-b border-[color:var(--line-strong)]"
    >
      <CryoField heat={1} />

      {/* Legibility scrim. The field itself is left bright; type gets its own
          contrast floor instead of the whole canvas being dimmed. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--void)_0%,rgba(6,7,10,0.72)_38%,rgba(6,7,10,0.15)_72%,transparent_100%)]"
      />

      <div className="shell flex flex-1 flex-col justify-center pt-28 pb-10">
        <p className="hero-meta eyebrow label mb-7">Asynchronous multi-agent research</p>

        <h1 className="hero-type display text-[length:var(--step-5)] [text-wrap:pretty]">
          {LINES.map((line, i) => (
            <span key={line} className="hero-line block overflow-hidden pb-[0.06em]">
              <span className={`block ${i === 2 ? "text-frost-muted" : ""}`}>{line}</span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-x-14 gap-y-8 md:grid-cols-[minmax(0,40ch)_auto] md:items-end">
          <p className="hero-meta lede">
            Three models take your question at the same time — broad ground truth, technical
            depth, and what actually changed this week. Brain Freeze queues the run, works it in
            the background, and hands back a single structured markdown report. No spinner to
            sit and watch.
          </p>

          <div className="hero-meta flex flex-wrap items-center gap-x-8 gap-y-4">
            <CtaLink href="/register">Queue your first query</CtaLink>
            <a href="#protocol" className="label draw inline-block text-frost-muted hover:text-frost">
              Read the protocol
            </a>
          </div>
        </div>
      </div>

      <div className="shell pb-8">
        <dl className="hero-meta grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[color:var(--line-strong)] pt-6 md:grid-cols-4">
          {readout.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-2">
              <dt className="label text-frost-dim">{k}</dt>
              <dd className="font-mono text-xs text-frost">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}