"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

const AGENTS = [
  {
    id: "A",
    name: "Ground",
    model: "Nemotron",
    route: "OpenRouter",
    mandate:
      "Establishes what the thing actually is. Definitions, history, structure, the boring load-bearing facts everyone else assumes you already know.",
    grounding: "Parametric",
    section: "Foundations",
  },
  {
    id: "B",
    name: "Depth",
    model: "Gemini",
    route: "Google",
    mandate:
      "Goes technical. Mechanisms, architecture, trade-offs, comparisons and the failure modes - grounded against live web search rather than recalled from training.",
    grounding: "Web search",
    section: "Technical analysis",
  },
  {
    id: "C",
    name: "Now",
    model: "Grok",
    route: "xAI",
    mandate:
      "Answers 'what changed'. Recent developments, announcements, live discourse and the state of play as of today, not as of the last training cut.",
    grounding: "Live search",
    section: "Current developments",
  },
];

export function Agents() {
  const [open, setOpen] = useState<string | null>("B");
  const reduced = useReducedMotion();

  return (
    <section id="agents" className="section-y border-b border-[color:var(--line-strong)]">
      <div className="shell">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,38ch)] lg:items-end">
          <Reveal kind="rise">
            <p className="eyebrow label mb-6">Three mandates</p>
            <h2 className="display text-[length:var(--step-4)]">
              Not one model
              <br />
              asked three times.
            </h2>
          </Reveal>
          <Reveal kind="rise" delay={0.1}>
            <p className="text-frost-muted">
              Each agent runs a different model against a different prompt with a different
              grounding strategy, and owns one section of the final document. If one fails, the
              other two still ship - the report notes the gap instead of pretending.
            </p>
          </Reveal>
        </div>

        <ul className="mt-20 border-t border-[color:var(--line-strong)]">
          {AGENTS.map((agent, i) => {
            const isOpen = open === agent.id;
            return (
              <li key={agent.id} className="border-b border-[color:var(--line-strong)]">
                <button
                  onClick={() => setOpen(isOpen ? null : agent.id)}
                  aria-expanded={isOpen}
                  className="group grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-5 py-8 text-left transition-colors md:grid-cols-[5rem_1fr_14rem_3rem] md:gap-8"
                >
                  <span
                    className={`label transition-colors ${isOpen ? "text-flare" : "text-frost-dim group-hover:text-flare"}`}
                  >
                    {String(i + 1).padStart(2, "0")} / {agent.id}
                  </span>

                  <span
                    className={`display text-[length:var(--step-3)] transition-colors duration-300 ${
                      isOpen ? "text-frost" : "text-frost-muted group-hover:text-frost"
                    }`}
                  >
                    {agent.name}
                  </span>

                  <span className="label hidden text-frost-dim md:block">
                    {agent.model} · {agent.route}
                  </span>

                  <span
                    aria-hidden
                    className={`label justify-self-end text-frost-dim transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "rotate-45 text-flare" : "group-hover:text-frost"
                    }`}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-8 pb-12 md:grid-cols-[5rem_minmax(0,52ch)_1fr] md:gap-8">
                        <span aria-hidden className="hidden md:block" />
                        <p className="text-[length:var(--step-1)] leading-[1.45] text-frost">
                          {agent.mandate}
                        </p>
                        <dl className="flex flex-col gap-px self-start border-t border-[color:var(--line)]">
                          {[
                            ["Model", `${agent.model} (${agent.route})`],
                            ["Grounding", agent.grounding],
                            ["Owns section", agent.section],
                          ].map(([k, v]) => (
                            <div
                              key={k}
                              className="flex items-center justify-between gap-6 border-b border-[color:var(--line)] py-3"
                            >
                              <dt className="label text-frost-dim">{k}</dt>
                              <dd className="font-mono text-xs text-frost">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}