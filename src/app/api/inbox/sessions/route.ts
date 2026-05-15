import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/whatsapp/session";
import { waManager } from "@/lib/whatsapp/manager";

// GET /api/inbox/sessions — listar todas as sessões
export async function GET() {
  const dbSessions = await prisma.whatsAppSession.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { messages: { where: { isRead: false } } } },
    },
  });

  // Mescla com estado em memória (status mais recente)
  const inMemory = waManager.getAllSessions();
  const inMemoryMap = new Map(inMemory.map((s) => [s.id, s]));

  const sessions = dbSessions.map((s) => {
    const live = inMemoryMap.get(s.id);
    return {
      id: s.id,
      label: s.label,
      phoneNumber: live?.phoneNumber ?? s.phoneNumber,
      status: live?.status ?? s.status,
      qrCode: live?.qrCode ?? s.qrCode,
      lastSeenAt: s.lastSeenAt,
      unreadCount: s._count.messages,
    };
  });

  return NextResponse.json(sessions);
}

// POST /api/inbox/sessions — criar nova sessão
export async function POST(req: NextRequest) {
  const { label } = await req.json();

  if (!label?.trim()) {
    return NextResponse.json({ error: "Label obrigatório" }, { status: 400 });
  }

  const session = await prisma.whatsAppSession.create({
    data: { label: label.trim(), status: "CONNECTING" },
  });

  // Inicia a sessão Baileys de forma assíncrona
  startSession(session.id, session.label).catch(console.error);

  return NextResponse.json(session, { status: 201 });
}
