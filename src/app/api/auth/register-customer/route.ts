import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    const targetEmail = email.trim().toLowerCase();

    // 1. Verificar se existe um cliente com este e-mail (caso insensível)
    const allCustomers = await prisma.customer.findMany({
      include: { user: true }
    });

    const customer = allCustomers.find(c => c.email.trim().toLowerCase() === targetEmail);

    if (!customer) {
      return NextResponse.json({ error: "Este e-mail não possui uma compra ativa ou vinculada." }, { status: 404 });
    }

    // 2. Verificar se já existe um User com esse username/email
    const existingUser = await prisma.user.findUnique({
      where: { username: targetEmail },
      include: { customer: true }
    });

    if (existingUser) {
      // Se o User já existe e está vinculado a OUTRO Customer, é um erro de conflito
      if (existingUser.customer && existingUser.customer.id !== customer.id) {
        return NextResponse.json({ error: "Este e-mail já está associado a outra conta." }, { status: 400 });
      }

      // Caso contrário, atualizamos a senha do User existente e restabelecemos/garantimos o vínculo
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.$transaction([
        prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            role: "CUSTOMER",
          }
        }),
        prisma.customer.update({
          where: { id: customer.id },
          data: { userId: existingUser.id }
        })
      ]);

      return NextResponse.json({ success: true });
    }

    // Se o Customer já possuir um userId diferente ativo
    if (customer.userId || customer.user) {
      return NextResponse.json({ error: "Este e-mail já possui um cadastro ativo. Tente fazer login." }, { status: 400 });
    }

    // 3. Criptografar a senha para nova conta
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Criar o Usuário e vincular ao Cliente em uma transação
    const newUser = await prisma.user.create({
      data: {
        username: targetEmail, // Usamos o e-mail como username por padrão
        password: hashedPassword,
        role: "CUSTOMER",
      }
    });

    // 5. Atualizar o Customer com o ID do novo usuário
    await prisma.customer.update({
      where: { id: customer.id },
      data: { userId: newUser.id }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERRO REGISTRO CLIENTE:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor: " + error.message }, { status: 500 });
  }
}


