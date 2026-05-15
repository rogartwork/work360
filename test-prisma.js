const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        affiliate: { select: { referralCode: true } },
        licenses: { select: { isActive: true, expiresAt: true } },
        webLicenses: { select: { isActive: true, expiresAt: true } },
        Ticket: { select: { status: true } },
        interactionLogs: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { licenses: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("Success! Customers count:", customers.length);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
