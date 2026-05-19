import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      Ticket: {
        orderBy: { createdAt: "desc" },
        include: {
          replies: { orderBy: { createdAt: "asc" } },
        },
      },
      webLicenses: { orderBy: { createdAt: "desc" } },
      licenses: { orderBy: { createdAt: "desc" } },
      subscriptions: { orderBy: { createdAt: "desc" } },
      interactionLogs: { orderBy: { createdAt: "desc" } },
      inboxContacts: {
        include: {
          messages: {
            orderBy: { sentAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { name, email, phone, cpfCnpj, address, notes, status, source, pipelineStage } = body;

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(cpfCnpj !== undefined && { cpfCnpj }),
      ...(address !== undefined && { address }),
      ...(notes !== undefined && { notes }),
      ...(status !== undefined && { status }),
      ...(source !== undefined && { source }),
      ...(pipelineStage !== undefined && { pipelineStage }),
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(_req.url);
  const permanent = searchParams.get("permanent") === "true";

  // Find customer to see if there is a userId associated
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  try {
    if (!permanent) {
      // --- SOFT DELETE (Enviar para a Lixeira) ---
      await prisma.$transaction(async (tx) => {
        await tx.customer.update({
          where: { id },
          data: { status: "TRASHED" }
        });
        if (customer.userId) {
          await tx.user.update({
            where: { id: customer.userId },
            data: { isActive: false }
          });
        }
      });
      return NextResponse.json({ ok: true, soft: true });
    }

    // --- HARD DELETE (Exclusão Permanente com Cascata) ---
    const tickets = await prisma.ticket.findMany({
      where: { customerId: id },
      select: { id: true }
    });
    const ticketIds = tickets.map(t => t.id);

    await prisma.$transaction(async (tx) => {
      // 1. Deletar respostas dos chamados
      if (ticketIds.length > 0) {
        await tx.ticketReply.deleteMany({
          where: { ticketId: { in: ticketIds } }
        });
      }
      // 2. Deletar chamados
      await tx.ticket.deleteMany({
        where: { customerId: id }
      });
      // 3. Deletar licenças desktop
      await tx.desktopLicense.deleteMany({
        where: { customerId: id }
      });
      // 4. Deletar licenças web
      await tx.webLicense.deleteMany({
        where: { customerId: id }
      });
      // 5. Deletar assinaturas
      await tx.subscription.deleteMany({
        where: { customerId: id }
      });
      // 6. Deletar logs de interação
      await tx.interactionLog.deleteMany({
        where: { customerId: id }
      });
      // 7. Desvincular contatos da Inbox (setar customerId como null para preservar chat)
      await tx.inboxContact.updateMany({
        where: { customerId: id },
        data: { customerId: null }
      });
      // 8. Deletar o próprio cliente
      await tx.customer.delete({
        where: { id }
      });
      // 9. Deletar o usuário associado do portal cliente se existir
      if (customer.userId) {
        await tx.user.delete({
          where: { id: customer.userId }
        });
      }
    });

    return NextResponse.json({ ok: true, permanent: true });
  } catch (err: any) {
    console.error("Erro ao deletar cliente:", err);
    return NextResponse.json({ error: "Erro ao excluir o cliente do banco de dados." }, { status: 500 });
  }
}

