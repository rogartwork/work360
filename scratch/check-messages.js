const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const messages = await prisma.inboxMessage.findMany({
      orderBy: { sentAt: 'desc' },
      take: 20
    });
    console.log("LAST 20 MESSAGES:");
    console.log(messages.map(m => ({
      id: m.id,
      direction: m.direction,
      body: m.body,
      sentAt: m.sentAt,
      contactId: m.contactId
    })));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
