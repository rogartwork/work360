import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Helper: encontra ou cria um Customer para o usuário logado
async function resolveCustomer(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Tenta encontrar via WebLicense vinculada
  let customer = await prisma.customer.findFirst({
    where: { webLicenses: { some: { username: user.username } } }
  });

  // Fallback: encontra por email ou cria perfil automaticamente
  if (!customer) {
    const email = user.username.includes("@") ? user.username : `${user.username}@nexus.crm`;
    customer = await prisma.customer.findFirst({ where: { email } });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: user.username, email, phone: "" }
      });
      console.log("[TICKETS API] Auto-criou Customer para:", user.username, customer.id);
    }
  }

  return customer;
}

// GET: Lista os tickets do usuário logado
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const customer = await resolveCustomer(session.userId);
    if (!customer) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Busca todos os tickets do cliente ordenados por criação para montar numeração
    const allByCustomer = await prisma.ticket.findMany({
      where: { customerId: customer.id },
      select: { id: true },
      orderBy: { createdAt: "asc" }
    });
    const numberMap: Record<string, number> = {};
    allByCustomer.forEach((t, i) => { numberMap[t.id] = i + 1; });

    const tickets = await prisma.ticket.findMany({
      where: { customerId: customer.id },
      include: { replies: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" }
    });

    const enriched = tickets.map(t => ({ ...t, ticketNumber: numberMap[t.id] ?? 0 }));
    return NextResponse.json(enriched);
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

    const customer = await resolveCustomer(session.userId);
    if (!customer) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const ticket = await prisma.ticket.create({
      data: {
        customerId: customer.id,
        subject,
        category: category || "TECHNICAL",
        priority: priority || "NORMAL",
        replies: { create: { message, isAdmin: false } }
      },
      include: { replies: true }
    });
    console.log("[TICKETS API] Ticket criado:", ticket.id, "para customer:", customer.id);

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("[TICKETS API] Erro ao criar:", error.message);
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

    const customer = await resolveCustomer(session.userId);
    if (!customer) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, customerId: customer.id }
    });

    if (!ticket) return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });

    const reply = await prisma.ticketReply.create({
      data: { ticketId, message, isAdmin: false }
    });

    if (ticket.status !== "OPEN") {
      await prisma.ticket.update({ where: { id: ticketId }, data: { status: "OPEN" } });
    }

    return NextResponse.json(reply);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
