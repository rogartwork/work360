import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { waManager } from "@/lib/whatsapp/manager";

// GET /api/inbox/sessions/[id] — status de uma sessão específica
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const live = waManager.getSession(id);
  const db = await prisma.whatsAppSession.findUnique({ where: { id } });

  if (!db) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  return NextResponse.json({
    ...db,
    status: live?.status ?? db.status,
    qrCode: live?.qrCode ?? db.qrCode,
    phoneNumber: live?.phoneNumber ?? db.phoneNumber,
  });
}

// DELETE /api/inbox/sessions/[id] — desconectar e remover sessão
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Tenta parar o socket Baileys se estiver ativo (sem lançar erro se não estiver)
  try {
    const { stopSession } = await import("@/lib/whatsapp/session");
    await stopSession(id);
  } catch (e) {
    console.warn(`[WA] stopSession falhou para ${id}:`, e);
    // Continua mesmo que falhe — o objetivo é remover do banco
  }

  // 2. Remove da memória do manager
  try {
    waManager.removeSession(id);
  } catch (e) {
    console.warn(`[WA] removeSession falhou para ${id}:`, e);
  }

  // 3. Remove mensagens vinculadas (evita FK constraint violation)
  try {
    await prisma.inboxMessage.deleteMany({ where: { sessionId: id } });
  } catch (e) {
    console.warn(`[WA] Erro ao deletar mensagens da sessão ${id}:`, e);
  }

  // 4. Deleta do banco de dados (operação principal — não pode falhar silenciosamente)
  try {
    await prisma.whatsAppSession.delete({ where: { id } });
  } catch (e: any) {
    // Se já não existir no banco, tudo bem
    if (e?.code !== "P2025") {
      console.error(`[WA] Erro ao deletar sessão ${id} do banco:`, e);
      return NextResponse.json({ error: "Erro ao remover sessão do banco de dados." }, { status: 500 });
    }
  }

  console.log(`[WA] 🗑️ Sessão removida com sucesso: ${id}`);
  return NextResponse.json({ ok: true });
}
