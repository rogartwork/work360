import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const targetUserId = params.id;

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
