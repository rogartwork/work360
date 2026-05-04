import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: targetUserId } = await params;

    if (session.userId === targetUserId) {
      return NextResponse.json({ error: "Você não pode excluir seu próprio usuário" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: targetUserId }
    });

    return NextResponse.json({ message: "Usuário excluído com sucesso" });
  } catch (error: any) {
    console.error("ERRO DELETANDO USUARIO:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const { password, role } = await req.json();

    const updateData: any = {};
    if (role) updateData.role = role;
    
    // Se a senha for enviada, atualiza também
    if (password && password.trim() !== "") {
      const bcrypt = require("bcryptjs");
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("ERRO ATUALIZANDO USUARIO:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
