import { NextRequest } from "next/server";
import { waManager } from "@/lib/whatsapp/manager";

export const dynamic = "force-dynamic";

/**
 * GET /api/inbox/events
 * SSE global: notifica o frontend sobre:
 * - session:update  (status/QR de sessões)
 * - message:new     (nova mensagem recebida)
 * - session:removed (sessão deletada)
 */
export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Heartbeat a cada 25s para manter conexão viva
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      const onAny = ({ event, data }: { event: string; data: unknown }) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          waManager.off("*", onAny);
          clearInterval(heartbeat);
        }
      };

      waManager.on("*", onAny);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // desabilita buffer do Nginx
    },
  });
}
