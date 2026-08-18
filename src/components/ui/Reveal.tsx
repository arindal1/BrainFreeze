"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Kind = "rise" | "wipe" | "slam";

/**
 * Entrance primitives. Deliberately three different techniques with three
 * different timings — a page where everything fades-up identically is the
 * clearest tell of generated work.
 */
const kinds: Record<Kind, Variants> = {
  // Slow, cinematic lift for editorial copy.
  rise: {
    hidden: { opacity: 0, y: 28 },
    shown: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
    }),
  },
  // Clip-path wipe for structural blocks — machined, not soft.
  wipe: {
    hidden: { clipPath: "inset(0 100% 0 0)" },
    shown: (delay: number) => ({
      clipPath: "inset(0 0% 0 0)",
      transition: { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] },
    }),
  },
  // Abrupt, near-linear arrival for brutalist elements.
  slam: {
    hidden: { opacity: 0, x: -14 },
    shown: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay, ease: [0.7, 0, 0.2, 1] },
    }),
  },
};

export function Reveal({
  children,
  kind = "rise",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  kind?: Kind;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      custom={delay}
      variants={kinds[kind]}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-12% 0px" }}
    >
      {children}
    </motion.div>
  );
}