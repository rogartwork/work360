import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const licenses = await prisma.webLicense.findMany({
      include: {
        customer: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(licenses);
  } catch (error: any) {
    console.error("ERRO GET WEB LICENSES:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, name, username, password, role, plan, maxSessions, expiresAt } = body;

    if (!customerId || !name || !username || !password) {
      return NextResponse.json({ error: "Cliente, Nome, Username e Senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.webLicense.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username já está em uso" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const license = await prisma.webLicense.create({
      data: {
        customerId,
        name,
        username,
        password: hashedPassword,
        role: role || "CUSTOMER",
        plan: plan || "STANDARD",
        maxSessions: Number(maxSessions) || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    });

    return NextResponse.json(license);
  } catch (error: any) {
    console.error("ERRO POST WEB LICENSE:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
