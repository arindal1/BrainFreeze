import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

/** IP-based rate limits for spam/abuse-prone routes: signup, job submission, credential login. */
const RULES: { match: (p: string, m: string) => boolean; limit: number; windowMs: number; name: string }[] = [
  { match: (p, m) => p === "/api/register" && m === "POST", limit: 5, windowMs: 60 * 60_000, name: "register" },
  { match: (p, m) => p === "/api/research" && m === "POST", limit: 20, windowMs: 60_000, name: "research-submit" },
  {
    match: (p, m) => p === "/api/auth/callback/credentials" && m === "POST",
    limit: 10,
    windowMs: 5 * 60_000,
    name: "login",
  },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;
  const rule = RULES.find((r) => r.match(pathname, method));
  if (!rule) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const { allowed, retryAfterSec } = rateLimit(`${rule.name}:${ip}`, rule.limit, rule.windowMs);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/register", "/api/research", "/api/auth/callback/credentials"],
};