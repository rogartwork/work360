const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed do SaaS CRM...');

  // 1. Criar Super Admin
  const adminUsername = 'admin';
  const adminPassword = 'admin_password_2024';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: { role: 'SUPER_ADMIN' },
    create: {
      username: adminUsername,
      password: hashedAdminPassword,
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Super Admin configurado:', adminUsername);

  // 2. Criar um Afiliado de Teste
  const affiliateUsername = 'vendedor1';
  const affiliatePassword = 'vendedor_password';
  const hashedAffPassword = await bcrypt.hash(affiliatePassword, 10);

  const affiliateUser = await prisma.user.upsert({
    where: { username: affiliateUsername },
    update: { role: 'AFFILIATE' },
    create: {
      username: affiliateUsername,
      password: hashedAffPassword,
      role: 'AFFILIATE'
    }
  });

  let affiliateData = await prisma.affiliate.findFirst({
    where: {
      OR: [
        { userId: affiliateUser.id },
        { referralCode: 'NEXUS-TOP-SALE' }
      ]
    }
  });

  if (affiliateData) {
    affiliateData = await prisma.affiliate.update({
      where: { id: affiliateData.id },
      data: {
        userId: affiliateUser.id,
        referralCode: 'NEXUS-TOP-SALE',
        commission: 0.15
      }
    });
  } else {
    affiliateData = await prisma.affiliate.create({
      data: {
        userId: affiliateUser.id,
        referralCode: 'NEXUS-TOP-SALE',
        commission: 0.15
      }
    });
  }

  console.log('✅ Afiliado de teste criado:', affiliateUsername);

  // 3. Criar um Cliente de Teste vinculado ao Afiliado (evitando conflito de cpfCnpj único)
  let customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { email: 'cliente@exemplo.com' },
        { cpfCnpj: '123.456.789-00' }
      ]
    }
  });

  if (customer) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: 'Cliente Exemplo Nexus',
        email: 'cliente@exemplo.com',
        phone: '5511999999999',
        cpfCnpj: '123.456.789-00',
        status: 'ACTIVE',
        affiliateId: affiliateData.id
      }
    });
  } else {
    customer = await prisma.customer.create({
      data: {
        name: 'Cliente Exemplo Nexus',
        email: 'cliente@exemplo.com',
        phone: '5511999999999',
        cpfCnpj: '123.456.789-00',
        status: 'ACTIVE',
        affiliateId: affiliateData.id
      }
    });
  }

  console.log('✅ Cliente de teste criado:', customer.name);

  // 4. Criar uma Licença para o Cliente
  await prisma.desktopLicense.upsert({
    where: { key: 'NEXUS-TEST-XXXX-XXXX' },
    update: {
      customerId: customer.id,
      plan: 'UNLIMITED',
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    create: {
      key: 'NEXUS-TEST-XXXX-XXXX',
      customerId: customer.id,
      plan: 'UNLIMITED',
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    }
  });

  console.log('✅ Licença de teste criada vinculada ao cliente.');

  console.log('--------------------------------------------------');
  console.log('SEED CONCLUÍDO COM SUCESSO!');
  console.log('Acesse o Hub em http://localhost:3003');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
