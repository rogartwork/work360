import { NextRequest } from "next/server";
import { waManager } from "@/lib/whatsapp/manager";

export const dynamic = "force-dynamic";

/**
 * GET /api/inbox/sessions/[id]/qr
 * SSE stream que envia o QR code base64 sempre que ele mudar.
 * O front exibe o QR como <img src={qrCode} /> para leitura.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;

      // Envia estado atual imediatamente
      const current = waManager.getSession(id);
      if (current?.qrCode) {
        ctrl.enqueue(
          encoder.encode(`data: ${JSON.stringify({ qrCode: current.qrCode, status: current.status })}\n\n`)
        );
      }

      const onUpdate = (session: { id: string; qrCode?: string; status: string }) => {
        if (session.id !== id) return;
        try {
          ctrl.enqueue(
            encoder.encode(`data: ${JSON.stringify({ qrCode: session.qrCode, status: session.status })}\n\n`)
          );
          // Fecha stream quando conectado (QR não é mais necessário)
          if (session.status === "CONNECTED") {
            ctrl.close();
            waManager.off("session:update", onUpdate);
          }
        } catch {
          waManager.off("session:update", onUpdate);
        }
      };

      waManager.on("session:update", onUpdate);
    },
    cancel() {
      // Cliente desconectou
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
