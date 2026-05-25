const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    const users = await p.user.count();
    console.log('Users:', users);
    const customers = await p.customer.count();
    console.log('Customers:', customers);
    const desktop = await p.desktopLicense.count();
    console.log('DesktopLicenses:', desktop);
    const web = await p.webLicense.count();
    console.log('WebLicenses:', web);
    const targets = await p.targetDatabase.count();
    console.log('TargetDatabases:', targets);

    const userList = await p.user.findMany({ select: { id: true, username: true, role: true } });
    console.log('\nUsuários registrados:');
    userList.forEach(u => console.log(' -', u.username, '|', u.role));

    const targetList = await p.targetDatabase.findMany();
    console.log('\nTargetDatabases registrados:');
    targetList.forEach(t => console.log(' -', t.name, '|', t.url, '| ativo:', t.isActive));
  } catch (e) {
    console.error('ERRO:', e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
