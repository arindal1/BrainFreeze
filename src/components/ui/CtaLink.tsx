"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & { children: React.ReactNode };

/**
 * The single primary action surface. Hero and Brief both used to hand-roll
 * this (same markup, drifting padding), which is where the spacing
 * inconsistency crept in - there is now exactly one of it.
 */
export function CtaLink({ children, className = "", ...rest }: Props) {
  return (
    <Link
      {...rest}
      className={`pressure group label inline-flex items-center gap-3 border border-[color:var(--line-hot)] px-7 py-4 text-flare transition-colors duration-300 hover:text-frost ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}