import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const admin = await prisma.user.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const session = await getSession();
    session.userId = admin.id;
    session.role = admin.role;
    session.username = admin.username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ message: "Login realizado com sucesso" });
  } catch (error: any) {
    console.error("ERRO LOGIN:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
