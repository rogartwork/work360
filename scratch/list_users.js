const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      role: true
    }
  });
  console.log('--- USUÁRIOS ---');
  console.log(JSON.stringify(users, null, 2));

  const customers = await prisma.customer.findMany({
    select: {
      name: true,
      email: true,
      status: true
    }
  });
  console.log('\n--- CLIENTES ---');
  console.log(JSON.stringify(customers, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
