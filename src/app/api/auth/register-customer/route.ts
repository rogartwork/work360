import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    // 1. Verificar se existe um cliente com este e-mail (criado pelo Webhook)
    const customer = await prisma.customer.findUnique({
      where: { email },
      include: { user: true }
    });

    if (!customer) {
      return NextResponse.json({ error: "Este e-mail não possui uma compra ativa ou vinculada." }, { status: 404 });
    }

    if (customer.userId || customer.user) {
      return NextResponse.json({ error: "Este e-mail já possui um cadastro ativo. Tente fazer login." }, { status: 400 });
    }

    // 2. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Criar o Usuário e vincular ao Cliente em uma transação
    const newUser = await prisma.user.create({
      data: {
        username: email, // Usamos o e-mail como username por padrão
        password: hashedPassword,
        role: "CUSTOMER",
      }
    });

    // 4. Atualizar o Customer com o ID do novo usuário
    await prisma.customer.update({
      where: { id: customer.id },
      data: { userId: newUser.id }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERRO REGISTRO CLIENTE:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
