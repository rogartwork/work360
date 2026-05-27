import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

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
        webLicenses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 10
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

export async function PUT(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name, password } = await req.json();

    // 1. Buscar o cliente vinculado ao usuário
    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId }
    });

    // 2. Atualizar o nome do cliente se enviado e existir perfil
    if (name && customer) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { name }
      });
    }

    // 3. Atualizar a senha do usuário se enviada
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: session.userId },
        data: { password: hashedPassword }
      });
    }

    return NextResponse.json({ success: true, message: "Perfil atualizado com sucesso" });

  } catch (error: any) {
    console.error("ERRO UPDATE ME:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar dados" }, { status: 500 });
  }
}

