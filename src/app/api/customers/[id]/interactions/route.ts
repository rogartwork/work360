import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const logs = await prisma.interactionLog.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("ERRO GET INTERACTIONS:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const reqBody = await req.json();
    const { type, content, sessionId } = reqBody;

    if (!content) {
      return NextResponse.json({ error: "Conteúdo da anotação é obrigatório" }, { status: 400 });
    }

    // ── Envio Real via WhatsApp ──────────────────────────────────
    // Se o tipo for WHATSAPP, enviar de verdade via chip conectado na Caixa de Entrada
    if (type === "WHATSAPP") {
      const customer = await prisma.customer.findUnique({ where: { id } });
      if (!customer?.phone) {
        return NextResponse.json({ 
          error: "Cliente não tem telefone cadastrado. Adicione o número na aba Geral antes de enviar pelo WhatsApp." 
        }, { status: 400 });
      }

      // Normalizar número para o formato JID do WhatsApp: 5511999999999@s.whatsapp.net
      const rawPhone = customer.phone.replace(/\D/g, "");
      const jid = rawPhone.includes("@") ? rawPhone : `${rawPhone}@s.whatsapp.net`;

      // Obter sessão ativa (a indicada pelo usuário ou a primeira CONNECTED disponível)
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const connectedSession = await prisma.whatsAppSession.findFirst({
          where: { status: "CONNECTED" },
          orderBy: { lastSeenAt: "desc" }
        });
        activeSessionId = connectedSession?.id;
      }

      if (!activeSessionId) {
        return NextResponse.json({ 
          error: "Nenhum chip WhatsApp conectado. Conecte um número na Caixa de Entrada primeiro." 
        }, { status: 503 });
      }

      // Usar o socket Baileys ativo em memória
      const { getActiveSocket } = await import("@/lib/whatsapp/session");
      const { waManager } = await import("@/lib/whatsapp/manager");
      const sock = getActiveSocket(activeSessionId);

      if (!sock) {
        return NextResponse.json({ 
          error: "Chip WhatsApp não está ativo em memória. Reinicie a sessão na Caixa de Entrada." 
        }, { status: 503 });
      }

      // Enviar a mensagem de verdade via Baileys
      try {
        await sock.sendMessage(jid, { text: content.trim() });
      } catch (waErr: any) {
        console.error("[WA] Erro ao enviar mensagem do CRM:", waErr);
        return NextResponse.json({ 
          error: `Falha ao enviar via WhatsApp: ${waErr.message}` 
        }, { status: 500 });
      }

      // Garantir que o InboxContact existe para esse número (aparece na Caixa de Entrada)
      const contact = await prisma.inboxContact.upsert({
        where: { phone: jid },
        update: { customerId: id, updatedAt: new Date() },
        create: {
          phone: jid,
          name: customer.name,
          customerId: id,
        },
      });

      // Salvar no InboxMessage para aparecer na conversa da Caixa de Entrada
      const inboxMsg = await prisma.inboxMessage.create({
        data: {
          sessionId: activeSessionId,
          contactId: contact.id,
          direction: "OUT",
          type: "TEXT",
          body: content.trim(),
          isRead: true,
        },
      });

      // Notificar UI em tempo real
      const { waManager: wm } = await import("@/lib/whatsapp/manager");
      wm.broadcast("message:new", { sessionId: activeSessionId, message: inboxMsg });
    }

    // ── Salvar Log de Interação no CRM (sempre) ──────────────────
    const log = await prisma.interactionLog.create({
      data: {
        customerId: id,
        type: type || "NOTE",
        content
      }
    });

    return NextResponse.json(log);
  } catch (error: any) {
    console.error("ERRO POST INTERACTION:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(req.url);
    const logId = url.searchParams.get("logId");

    if (!logId) {
      return NextResponse.json({ error: "ID da interação é obrigatório" }, { status: 400 });
    }

    // Certificar que pertence a este cliente
    const log = await prisma.interactionLog.findFirst({
      where: { id: logId, customerId: id }
    });

    if (!log) {
      return NextResponse.json({ error: "Interação não encontrada ou não pertence a este cliente" }, { status: 404 });
    }

    await prisma.interactionLog.delete({
      where: { id: logId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO DELETE INTERACTION:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
