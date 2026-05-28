import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "CUSTOMER"
        }
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("ERRO LISTANDO USUARIOS:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { username }
    });

    if (existing) {
      return NextResponse.json({ error: "Nome de usuário já em uso" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("ERRO CRIANDO USUARIO:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
