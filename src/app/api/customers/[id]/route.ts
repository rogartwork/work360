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

  await prisma.customer.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
