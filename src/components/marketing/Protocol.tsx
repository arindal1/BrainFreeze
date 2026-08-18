"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    n: "01",
    title: "Submit",
    body: "One line. A topic, a company, a sector, a person, a shipping standard - whatever you'd otherwise spend an afternoon on. The query is normalised and checked against your in-flight work so the same question never runs twice.",
    spec: ["Dedup on normalised text", "500 char ceiling", "Rate limited per IP"],
  },
  {
    n: "02",
    title: "Dispatch",
    body: "The job enters an in-process queue with fixed concurrency and you are released immediately. Three agents are then fired in parallel - nothing is sequential, nothing waits on a previous answer.",
    spec: ["FIFO queue", "Promise.allSettled fan-out", "Partial failure tolerated"],
  },
  {
    n: "03",
    title: "Synthesise",
    body: "Each agent returns its own section. The aggregator merges them into a single structured markdown document with a references footer - not three chat logs stapled together.",
    spec: ["Sectioned markdown", "Reference footer", "Written to Postgres"],
  },
  {
    n: "04",
    title: "Return",
    body: "Every stage change is published to an event bus and streamed to your dashboard over server-sent events. Close the tab if you want. The document is waiting when you come back.",
    spec: ["SSE, no polling", "Per-user fan-out", "Permanently archived"],
  },
];

export function Protocol() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Horizontal pinned track only where there's room for it. This must be
      // the SAME breakpoint at which the track becomes `flex-row` (Tailwind
      // `lg`, 1024px). It used to be 900px, so between 900 and 1023 the
      // section pinned with a scroll distance of zero - the page simply froze
      // and the "side scroller" appeared to do nothing.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        if (!el) return;

        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);

        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="protocol"
      ref={root}
      className="frostblock grain relative overflow-hidden"
      aria-label="The protocol"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-[var(--gutter)] py-6">
        <p className="label text-black/55">The protocol</p>
        <p className="label hidden text-black/55 lg:block">Scroll →</p>
      </div>

      {/* Progress rail - makes the horizontal travel legible instead of
          leaving the user to guess how far through the track they are. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-px bg-black/15 lg:block"
      >
        <div ref={bar} className="h-px origin-left scale-x-0 bg-flare" />
      </div>

      <div
        ref={track}
        className="flex min-h-[100svh] flex-col lg:w-max lg:flex-row lg:flex-nowrap"
      >
        {STEPS.map((step, i) => (
          <article
            key={step.n}
            className="relative flex min-h-[70svh] w-full flex-col justify-center border-b border-black/15 px-[var(--gutter)] py-24 lg:min-h-[100svh] lg:w-[min(44rem,72vw)] lg:border-r lg:border-b-0 lg:py-0"
          >
            <span
              aria-hidden
              className="display pointer-events-none absolute top-[var(--gutter)] right-[var(--gutter)] text-[length:var(--step-6)] leading-none text-black/[0.06] select-none"
            >
              {step.n}
            </span>

            <p className="eyebrow label mb-6 text-flare">Stage {step.n}</p>

            <h3 className="display text-[length:var(--step-4)] text-black">{step.title}</h3>

            <p className="mt-7 max-w-[44ch] text-[length:var(--step-1)] leading-[1.45] text-black/70">
              {step.body}
            </p>

            <ul className="mt-10 max-w-[34rem] border-t border-black/20">
              {step.spec.map((s) => (
                <li
                  key={s}
                  className="label flex items-center justify-between gap-6 border-b border-black/10 py-3.5 text-black/60"
                >
                  {s}
                  <span aria-hidden className="text-flare">
                    ●
                  </span>
                </li>
              ))}
            </ul>

            {i === STEPS.length - 1 && (
              <p className="label mt-10 text-black/45">End of protocol</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}