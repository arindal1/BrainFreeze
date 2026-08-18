"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Active" },
  { href: "/dashboard/completed", label: "Ready" },
  { href: "/dashboard/history", label: "Archive" },
];

export function DashboardNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--line-strong)] bg-[color:var(--void)]/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-6 px-5 py-4 md:px-10">
        <div className="flex items-baseline gap-8">
          <Link href="/" className="display text-base tracking-[-0.04em] uppercase">
            Brain&nbsp;Freeze
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Dashboard">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`label border-b py-1 transition-colors ${
                    active
                      ? "border-[color:var(--flare)] text-flare"
                      : "border-transparent text-frost-muted hover:text-frost"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <span className="label hidden max-w-[16ch] truncate text-frost-dim sm:inline">
            {userName}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="label draw inline-block text-frost-muted hover:text-flare"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile tab rail */}
      <nav className="flex border-t border-[color:var(--line)] md:hidden" aria-label="Dashboard">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`label flex-1 border-r border-[color:var(--line)] py-3 text-center last:border-r-0 ${
                active ? "bg-[color:var(--flare-soft)] text-flare" : "text-frost-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}