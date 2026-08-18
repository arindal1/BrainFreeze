import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth/auth";
import { researchService } from "@/services/researchService";

const submitSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Query must be at least 2 characters")
    .max(500, "Query must be at most 500 characters"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await researchService.list(session.user.id);
  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { job, deduped } = await researchService.submit(session.user.id, parsed.data.query);
  return NextResponse.json({ job, deduped }, { status: deduped ? 200 : 201 });
}