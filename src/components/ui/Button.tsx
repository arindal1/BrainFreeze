"use client";

import { ButtonHTMLAttributes, forwardRef, useCallback } from "react";

type Variant = "signal" | "line" | "bare";

const base =
  "group relative inline-flex items-center justify-center gap-3 px-7 py-4 font-mono text-[0.6875rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-35 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // The single hot action. Flare bleeds outward from the pointer.
  signal: "pressure border border-[color:var(--line-hot)] bg-transparent text-flare hover:text-frost",
  // Cold structural action.
  line: "border border-[color:var(--line-strong)] bg-transparent text-frost hover:border-[color:var(--cryo)] hover:text-cryo",
  // Inline, no chrome.
  bare: "px-0 py-0 text-frost-muted hover:text-frost",
};

/**
 * Instrument button. The `signal` variant tracks the pointer and fills from
 * the exact point of contact - the build's primary microinteraction.
 */
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ className = "", variant = "signal", onPointerMove, ...props }, ref) {
  const track = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
      e.currentTarget.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
      onPointerMove?.(e);
    },
    [onPointerMove],
  );

  return (
    <button
      ref={ref}
      onPointerMove={variant === "signal" ? track : onPointerMove}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
});