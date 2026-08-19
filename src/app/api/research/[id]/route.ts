import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth/auth";
import { jobsRepository, resultsRepository } from "@/repositories/researchRepository";
import { researchService, NotFoundError, ConflictError } from "@/services/researchService";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await jobsRepository.findById(id);
  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = job.status === "COMPLETED" ? await resultsRepository.findByJobId(id) : null;
  return NextResponse.json({ job, result });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await researchService.remove(id, session.user.id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (body?.action === "cancel") {
    try {
      const job = await researchService.cancel(id, session.user.id);
      return NextResponse.json({ job });
    } catch (err) {
      if (err instanceof NotFoundError) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (err instanceof ConflictError) return NextResponse.json({ error: err.message }, { status: 409 });
      throw err;
    }
  }
  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}