import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Helper: retorna mapa de id -> número sequencial baseado em ordem de criação
async function buildTicketNumberMap(): Promise<Record<string, number>> {
  const all = await prisma.ticket.findMany({ select: { id: true }, orderBy: { createdAt: "asc" } });
  const map: Record<string, number> = {};
  all.forEach((t, i) => { map[t.id] = i + 1; });
  return map;
}

// GET: Lista todos os tickets (Apenas para Admins)
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [tickets, numberMap] = await Promise.all([
      prisma.ticket.findMany({
        include: { customer: true, replies: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" }
      }),
      buildTicketNumberMap()
    ]);

    const enriched = tickets.map(t => ({ ...t, ticketNumber: numberMap[t.id] ?? 0 }));
    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// POST: Admin responde a um ticket
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { ticketId, message } = await req.json();

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        message,
        userId: session.userId,
        isAdmin: true
      }
    });

    // Se houver resposta, mudar status do ticket para IN_PROGRESS
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS" }
    });

    return NextResponse.json(reply);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Admin altera o status do ticket (Encerrar / Reabrir)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { ticketId, status } = await req.json();

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status }
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
