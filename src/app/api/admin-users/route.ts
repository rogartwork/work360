import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("ERRO GET ADMIN USERS:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name, email, password, role, phone, city,
      plan, maxSessions, expiresAt,
      allowWarmup, allowInclusion, allowMessager, allowDisplay
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, Email e Senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: email, // Usa o e-mail como username no HUB
        password: hashedPassword,
        role: role || "CUSTOMER",
        phone,
        city,
        plan: plan || "BRONZE",
        maxSessions: Number(maxSessions) || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        allowWarmup: allowWarmup !== undefined ? allowWarmup : true,
        allowInclusion: allowInclusion !== undefined ? allowInclusion : true,
        allowMessager: allowMessager !== undefined ? allowMessager : true,
        allowDisplay: allowDisplay !== undefined ? allowDisplay : true,
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("ERRO POST ADMIN USER:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
