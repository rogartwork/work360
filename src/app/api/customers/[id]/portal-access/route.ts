import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

async function checkAuth() {
  const session = await getSession();
  if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
    return false;
  }
  return true;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (customer.userId) {
      return NextResponse.json({ error: "Cliente já possui acesso ao portal ativo" }, { status: 400 });
    }

    // Verificar se já existe um usuário com o e-mail do cliente
    const existingUser = await prisma.user.findUnique({
      where: { username: customer.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Já existe um usuário com este e-mail cadastrado no portal" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: customer.email,
        email: customer.email,
        password: hashedPassword,
        role: "CUSTOMER",
      }
    });

    await prisma.customer.update({
      where: { id: customer.id },
      data: { userId: newUser.id }
    });

    await prisma.interactionLog.create({
      data: {
        customerId: customer.id,
        type: "SYSTEM",
        content: `Acesso ao portal liberado manualmente. Usuário: ${customer.email}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO ATIVAR ACESSO PORTAL:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (!customer.userId) {
      return NextResponse.json({ error: "Cliente não possui acesso ao portal ativo para alterar senha" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: customer.userId },
      data: { password: hashedPassword }
    });

    await prisma.interactionLog.create({
      data: {
        customerId: customer.id,
        type: "SYSTEM",
        content: "Senha de acesso ao portal redefinida manualmente pelo administrador"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO ALTERAR SENHA PORTAL:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (!customer.userId) {
      return NextResponse.json({ error: "Cliente não possui acesso ao portal ativo para revogar" }, { status: 400 });
    }

    const userId = customer.userId;

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: customer.id },
        data: { userId: null }
      }),
      prisma.user.delete({
        where: { id: userId }
      }),
      prisma.interactionLog.create({
        data: {
          customerId: customer.id,
          type: "SYSTEM",
          content: "Acesso ao portal revogado manualmente pelo administrador"
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO REVOGAR ACESSO PORTAL:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
