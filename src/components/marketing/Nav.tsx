"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const index = [
  { href: "#protocol", label: "Protocol" },
  { href: "#agents", label: "Agents" },
  { href: "#brief", label: "Brief" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled
          ? "border-[color:var(--line-strong)] bg-[color:var(--void)]/85 backdrop-blur-md"
          : "border-transparent bg-[linear-gradient(to_bottom,rgba(6,7,10,0.85),transparent)]"
      }`}
    >
      <div className="shell flex items-center justify-between gap-6 py-4">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="display text-lg tracking-[-0.04em] whitespace-nowrap uppercase">
            Brain&nbsp;Freeze
          </span>
          <span className="label hidden text-frost-dim transition-colors group-hover:text-flare sm:inline">
            v0.4
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Sections">
          {index.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className="label draw inline-block text-frost-muted hover:text-frost"
            >
              <span className="mr-2 text-frost-dim">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="label draw hidden text-frost-muted hover:text-frost sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="label border border-[color:var(--line-hot)] px-4 py-2.5 whitespace-nowrap text-flare transition-colors duration-300 hover:bg-flare hover:text-frost"
          >
            Open a node
          </Link>
        </div>
      </div>
    </header>
  );
}