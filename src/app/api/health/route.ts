import { NextResponse } from "next/server";

/**
 * Cheap liveness endpoint with no auth/DB dependency, used as the target for
 * the self-ping keep-alive in `instrumentation.ts` (see Render free-tier
 * idle-spindown workaround in docs/DEPLOYMENT.md).
 */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}