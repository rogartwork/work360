const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$') && typeof prisma[key] === 'object');
  console.log("Models found:", models.join(", "));

  for (const model of models) {
    try {
      const records = await prisma[model].findMany();
      const str = JSON.stringify(records);
      if (str.includes("local") || str.includes("work360") || str.includes("276995493634288")) {
        console.log(`\nMatch found in model "${model}":`);
        console.log(JSON.stringify(records, null, 2));
      }
    } catch (err) {
      // Ignora erro se não for um model válido
    }
  }

  await prisma.$disconnect();
}
main();
