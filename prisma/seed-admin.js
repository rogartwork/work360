const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'admin_password_2024'; // Você pode mudar isso depois
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({
    where: { username }
  });

  if (existing) {
    console.log('Usuário admin já existe.');
    return;
  }

  await prisma.admin.create({
    data: {
      username,
      password: hashedPassword
    }
  });

  console.log('--------------------------------------------------');
  console.log('ADMIN CRIADO COM SUCESSO!');
  console.log('Usuário:', username);
  console.log('Senha:', password);
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
