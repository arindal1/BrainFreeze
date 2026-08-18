import { NextRequest } from "next/server";
import { auth } from "@/auth/auth";
import { jobEventBus, JobEventPayload } from "@/pipeline/eventBus";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;
  const encoder = new TextEncoder();

  let unsubscribe: () => void = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: JobEventPayload) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };
      controller.enqueue(encoder.encode(`: connected\n\n`));
      unsubscribe = jobEventBus.subscribe(userId, send);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 25_000);

      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        unsubscribe();
        controller.close();
      });
    },
    cancel() {
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}