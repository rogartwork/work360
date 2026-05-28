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

    const cleanUsername = username.trim().toLowerCase();

    // 1. Tentar encontrar na tabela User (case-insensitive)
    let user = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    // Se não encontrou pelo email/username exato em minúsculas, tenta buscar normal
    if (!user) {
      user = await prisma.user.findUnique({
        where: { username }
      });
    }

    let passwordMatch = false;

    if (user) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // 2. Fallback: Se não encontrou no User, procurar em WebLicense (credenciais geradas automaticamente)
      const webLicense = await prisma.webLicense.findUnique({
        where: { username },
        include: { customer: { include: { user: true } } }
      });

      if (webLicense) {
        // As senhas em webLicense são criptografadas com bcrypt
        passwordMatch = await bcrypt.compare(password, webLicense.password);
        
        if (passwordMatch) {
          // Se bateu a senha, garantimos que exista um User correspondente vinculado a esse Customer
          let linkedUser = webLicense.customer.user;
          
          if (!linkedUser) {
            // Criar o User correspondente automaticamente
            linkedUser = await prisma.user.create({
              data: {
                username: webLicense.username,
                password: webLicense.password, // Aproveita o hash existente
                role: "CUSTOMER",
              }
            });

            // Atualizar o Customer vinculando-o ao novo User
            await prisma.customer.update({
              where: { id: webLicense.customerId },
              data: { userId: linkedUser.id }
            });
          }

          user = linkedUser;
        }
      }
    }

    if (!user || !passwordMatch) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const session = await getSession();
    session.userId = user.id;
    session.role = user.role;
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ 
      message: "Login realizado com sucesso",
      role: user.role
    });
  } catch (error: any) {
    console.error("ERRO LOGIN:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor: " + error.message }, { status: 500 });
  }
}

