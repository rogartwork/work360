import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET: Lista todos os tickets (Apenas para Admins)
export async function GET() {
  try {
    const session = await getSession();
    console.log("[ADMIN TICKETS API] Session Role:", session.role);
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'SUPPORT' && session.role !== 'ADMIN')) {
      console.log("[ADMIN TICKETS API] Acesso NEGADO para role:", session.role);
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      include: { 
        customer: true,
        replies: { orderBy: { createdAt: "asc" } } 
      },
      orderBy: { createdAt: "desc" }
    });
    console.log("[ADMIN TICKETS API] Tickets encontrados:", tickets.length);

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Admin responde a um ticket
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'SUPPORT' && session.role !== 'ADMIN')) {
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
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'SUPPORT' && session.role !== 'ADMIN')) {
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
