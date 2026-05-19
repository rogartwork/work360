import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const showTrash = url.searchParams.get("trash") === "true";

    // --- Limpeza automática de clientes na Lixeira há mais de 60 dias ---
    try {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const toDelete = await prisma.customer.findMany({
        where: {
          status: "TRASHED",
          updatedAt: { lt: sixtyDaysAgo }
        },
        select: { id: true }
      });

      for (const cust of toDelete) {
        const tickets = await prisma.ticket.findMany({
          where: { customerId: cust.id },
          select: { id: true }
        });
        const ticketIds = tickets.map(t => t.id);

        await prisma.$transaction(async (tx) => {
          if (ticketIds.length > 0) {
            await tx.ticketReply.deleteMany({ where: { ticketId: { in: ticketIds } } });
          }
          await tx.ticket.deleteMany({ where: { customerId: cust.id } });
          await tx.desktopLicense.deleteMany({ where: { customerId: cust.id } });
          await tx.webLicense.deleteMany({ where: { customerId: cust.id } });
          await tx.subscription.deleteMany({ where: { customerId: cust.id } });
          await tx.interactionLog.deleteMany({ where: { customerId: cust.id } });
          await tx.inboxContact.updateMany({ where: { customerId: cust.id }, data: { customerId: null } });
          await tx.customer.delete({ where: { id: cust.id } });
        });
      }
    } catch (cleanErr: any) {
      console.error("Erro na limpeza automática da lixeira:", cleanErr.message);
    }
    // ---------------------------------------------------------------------

    const customers = await prisma.customer.findMany({
      where: {
        status: showTrash ? "TRASHED" : { not: "TRASHED" }
      },
      include: {
        affiliate: { select: { referralCode: true } },
        licenses: { select: { isActive: true, expiresAt: true } },
        webLicenses: { select: { isActive: true, expiresAt: true } },
        Ticket: { select: { status: true } },
        interactionLogs: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { licenses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("ERRO GET CUSTOMERS:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, cpfCnpj, address, notes, affiliateId } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e Email são obrigatórios" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        address,
        notes,
        affiliateId,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("ERRO POST CUSTOMER:", error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email ou CPF/CNPJ já cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
