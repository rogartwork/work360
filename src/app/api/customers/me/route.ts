import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o cliente vinculado ao usuário da sessão
    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
      include: {
        licenses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!customer) {
      // Se for um admin e não tiver perfil de cliente, retornamos um erro específico ou dados básicos
      return NextResponse.json({ error: "Perfil de cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(customer);

  } catch (error: any) {
    console.error("ERRO FETCH ME:", error.message);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
