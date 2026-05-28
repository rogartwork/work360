import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Helper: encontra o Customer vinculado ao usuário logado
async function resolveCustomer(userId: string) {
  // 1ª prioridade: link direto userId → Customer (portal de clientes)
  const byUserId = await prisma.customer.findUnique({
    where: { userId }
  });
  if (byUserId) return byUserId;

  // 2ª prioridade: via WebLicense (legado – antes do portal unificado)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const byWebLicense = await prisma.customer.findFirst({
    where: { webLicenses: { some: { username: user.username } } }
  });
  if (byWebLicense) return byWebLicense;

  // 3ª prioridade: por e-mail (legado)
  if (user.username.includes("@")) {
    const byEmail = await prisma.customer.findFirst({ where: { email: user.username } });
    if (byEmail) return byEmail;
  }

  // Último recurso: criar perfil automaticamente para admins/usuários sem Customer
  const email = user.username.includes("@") ? user.username : `${user.username}@nexus.crm`;
  const created = await prisma.customer.create({
    data: { name: user.username, email, phone: "" }
  });
  console.log("[TICKETS API] Auto-criou Customer para:", user.username, created.id);
  return created;
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

    // Regra: chamado sem respostas ou interação por parte do cliente no período de 30 dias corridos é excluído automaticamente
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const expiredTickets = await prisma.ticket.findMany({
      where: {
        customerId: customer.id,
        updatedAt: { lt: thirtyDaysAgo }
      },
      select: { id: true }
    });

    if (expiredTickets.length > 0) {
      const expiredIds = expiredTickets.map(t => t.id);
      
      // Excluir as respostas dos expirados
      await prisma.ticketReply.deleteMany({
        where: { ticketId: { in: expiredIds } }
      });

      // Excluir os chamados expirados
      await prisma.ticket.deleteMany({
        where: { id: { in: expiredIds } }
      });
      
      console.log(`[TICKETS API] Limpeza automática: ${expiredIds.length} chamados inativos por mais de 30 dias foram excluídos.`);
    }

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

// PUT: Cliente responde a um ticket ou altera status (ex: marcar como resolvido)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { ticketId, message, status } = await req.json();

    const customer = await resolveCustomer(session.userId);
    if (!customer) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, customerId: customer.id }
    });

    if (!ticket) return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });

    if (status) {
      const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status, updatedAt: new Date() }
      });
      return NextResponse.json(updated);
    }

    if (message) {
      const reply = await prisma.ticketReply.create({
        data: { ticketId, message, isAdmin: false }
      });

      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "OPEN", updatedAt: new Date() }
      });

      return NextResponse.json(reply);
    }

    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Cliente exclui o chamado e todas as suas respostas
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { ticketId } = await req.json();

    const customer = await resolveCustomer(session.userId);
    if (!customer) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, customerId: customer.id }
    });

    if (!ticket) return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });

    // 1. Excluir todas as respostas do chamado (TicketReply)
    await prisma.ticketReply.deleteMany({
      where: { ticketId }
    });

    // 2. Excluir o chamado (Ticket)
    await prisma.ticket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json({ success: true, message: "Chamado excluído com sucesso" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
