import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name, email, password, role, phone, city,
      plan, maxSessions, isActive, expiresAt,
      allowWarmup, allowInclusion, allowMessager, allowDisplay
    } = body;

    const dataToUpdate: any = {
      name,
      email,
      role,
      phone,
      city,
      plan,
      maxSessions: Number(maxSessions),
      isActive,
      allowWarmup,
      allowInclusion,
      allowMessager,
      allowDisplay,
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    
    // Convert expiresAt or set null if empty string
    if (expiresAt === "") {
        dataToUpdate.expiresAt = null;
    } else if (expiresAt) {
        dataToUpdate.expiresAt = new Date(expiresAt);
    }

    // Se email foi atualizado, atualizar username tambem
    if (email) {
      dataToUpdate.username = email;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("ERRO PUT ADMIN USER:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Apenas Super Admins podem excluir contas" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO DELETE ADMIN USER:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
