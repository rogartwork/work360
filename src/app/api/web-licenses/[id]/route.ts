import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, role, plan, maxSessions, isActive, expiresAt, password } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (plan !== undefined) updateData.plan = plan;
    if (maxSessions !== undefined) updateData.maxSessions = Number(maxSessions);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const license = await prisma.webLicense.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(license);
  } catch (error: any) {
    console.error("ERRO PATCH WEB LICENSE:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.webLicense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO DELETE WEB LICENSE:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
