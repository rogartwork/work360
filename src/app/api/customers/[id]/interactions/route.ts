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
    const body = await req.json();
    const { type, content } = body;

    if (!content) {
      return NextResponse.json({ error: "Conteúdo da anotação é obrigatório" }, { status: 400 });
    }

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
