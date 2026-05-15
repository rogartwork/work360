import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveSocket } from "@/lib/whatsapp/session";
import { waManager } from "@/lib/whatsapp/manager";

// POST /api/inbox/conversations/[contactId]/reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const { sessionId, body } = await req.json();

  if (!sessionId || !body?.trim()) {
    return NextResponse.json({ error: "sessionId e body são obrigatórios" }, { status: 400 });
  }

  const contact = await prisma.inboxContact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 });
  }

  // Envia via Baileys
  const sock = getActiveSocket(sessionId);
  if (!sock) {
    return NextResponse.json({ error: "Sessão WhatsApp não está conectada" }, { status: 503 });
  }

  try {
    await sock.sendMessage(contact.phone, { text: body.trim() });
  } catch (err) {
    console.error("[WA] Erro ao enviar mensagem:", err);
    return NextResponse.json({ error: "Falha ao enviar via WhatsApp" }, { status: 500 });
  }

  // Salva mensagem enviada no banco
  const saved = await prisma.inboxMessage.create({
    data: {
      sessionId,
      contactId,
      direction: "OUT",
      type: "TEXT",
      body: body.trim(),
      isRead: true,
    },
  });

  // Notifica UI em tempo real
  waManager.broadcast("message:new", { sessionId, message: saved });

  return NextResponse.json(saved, { status: 201 });
}
