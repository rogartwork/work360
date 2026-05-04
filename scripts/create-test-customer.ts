import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = "cliente_teste";
  const password = "123";
  const email = "teste@nexus.com";
  const name = "Simulação Cliente";

  console.log("🚀 Iniciando Simulação de Cliente...");

  // 1. Limpar anterior se existir (na ordem correta de dependências)
  const existingCustomer = await prisma.customer.findUnique({ where: { email } });
  if (existingCustomer) {
    await prisma.subscription.deleteMany({ where: { customerId: existingCustomer.id } });
    await prisma.webLicense.deleteMany({ where: { customerId: existingCustomer.id } });
    await prisma.customer.delete({ where: { id: existingCustomer.id } });
  }
  await prisma.user.deleteMany({ where: { username } }).catch(() => {});
  await prisma.webLicense.deleteMany({ where: { username } }).catch(() => {});

  // 2. Criar Customer (Simulando o que o Webhook faria)
  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      phone: "11999999999",
      status: "ACTIVE",
    }
  });

  // 3. Criar Assinatura
  await prisma.subscription.create({
    data: {
      customerId: customer.id,
      status: "PAID",
      amount: 147,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // 4. Criar Licença Web
  await prisma.webLicense.create({
    data: {
      customerId: customer.id,
      name: "Licença Nexus 360",
      username: username,
      password: password,
      plan: "MENSAL",
      maxSessions: 3,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // 5. Criar Login (User)
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: "CUSTOMER"
    }
  });

  console.log("\n✅ SIMULAÇÃO CONCLUÍDA COM SUCESSO!");
  console.log("------------------------------------");
  console.log(`👤 USUÁRIO: ${username}`);
  console.log(`🔑 SENHA: ${password}`);
  console.log("------------------------------------");
  console.log("Agora você pode ir em /login e usar estas credenciais.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
