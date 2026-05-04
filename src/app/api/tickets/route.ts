import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET: Lista os tickets do usuário logado
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o Customer vinculado a este User (supondo que o username do User seja o username da WebLicense)
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    console.log("[TICKETS API] User Found:", user?.username);
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const customer = await prisma.customer.findFirst({
      where: { webLicenses: { some: { username: user.username } } }
    });
    console.log("[TICKETS API] Customer Found:", customer?.id);

    if (!customer) {
      return NextResponse.json({ error: "Perfil de cliente não encontrado" }, { status: 404 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { customerId: customer.id },
      include: { replies: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Cria um novo ticket
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { subject, message, category, priority } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const customer = await prisma.customer.findFirst({
      where: { webLicenses: { some: { username: user?.username } } }
    });

    if (!customer) {
      return NextResponse.json({ error: "Perfil de cliente não encontrado" }, { status: 404 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        customerId: customer.id,
        subject,
        category: category || "TECHNICAL",
        priority: priority || "NORMAL",
        replies: {
          create: {
            message,
            isAdmin: false
          }
        }
      }
    });
    console.log("[TICKETS API] Ticket criado com sucesso:", ticket.id);

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Cliente responde a um ticket
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { ticketId, message } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const customer = await prisma.customer.findFirst({
      where: { webLicenses: { some: { username: user?.username } } }
    });

    if (!customer) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // Verifica se o ticket pertence ao cliente
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, customerId: customer.id }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId,
        message,
        isAdmin: false
      }
    });

    // Se estava fechado ou in progress, volta para OPEN (pois o cliente respondeu)
    if (ticket.status !== "OPEN") {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "OPEN" }
      });
    }

    return NextResponse.json(reply);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
