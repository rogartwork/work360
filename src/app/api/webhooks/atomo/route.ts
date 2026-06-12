// src/app/api/webhooks/atomo/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Webhook da Atomo Pay – sem validação de assinatura.
 * Recebe notificações de pagamento e cria/atualiza licença e usuário.
 */
export async function POST(req: Request) {
  // 1️⃣ Ler o corpo da request como texto (necessário para o JSON)
  const rawBody = await req.text();
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // Resposta genérica – evitamos detalhar o erro
    return NextResponse.json({ received: true });
  }

  // Campos esperados (A Atomo Pay pode mandar com nomes diferentes)
  const orderId = payload.orderId || payload.transaction?.id || payload.id || "manual_" + Date.now();
  const userEmail = payload.userEmail || payload.email || payload.customer?.email || payload.client?.email;
  const userName = payload.userName || payload.name || payload.customer?.name || payload.client?.name || "Cliente Nexus";
  const status = payload.status || payload.payment_status || payload.transaction?.status || "approved";
  const plan = payload.plan || payload.product_name || "PADRAO";
  const amount = payload.amount || payload.value || 0;

  // Registrar todo o webhook recebido no banco de dados para podermos debugar depois!
  if (userEmail) {
    try {
      const customerForLog = await prisma.customer.findFirst({ where: { email: userEmail } });
      if (customerForLog) {
        await prisma.interactionLog.create({
          data: {
            customerId: customerForLog.id,
            type: "SYSTEM",
            content: `Webhook Atomo Recebido: ${rawBody}`
          }
        });
      }
    } catch(e) {}
  }

  // Verificar campos essenciais
  if (!userEmail) {
    console.error("[ATOMO WEBHOOK] Erro: Sem email na payload. Payload original:", rawBody);
    return NextResponse.json({ received: true });
  }

  // Processar somente pagamentos aprovados
  const approved = ["approved", "paid", "completed", "pago"].includes(String(status).toLowerCase());
  if (!approved) {
    console.log("[ATOMO WEBHOOK] Pagamento não está como aprovado. Status atual:", status);
    return NextResponse.json({ received: true });
  }

  // 2️⃣ Upsert cliente (CRM)
  const customer = await prisma.customer.upsert({
    where: { email: userEmail },
    update: { status: "ACTIVE", name: userName },
    create: {
      email: userEmail,
      name: userName,
      status: "ACTIVE",
    },
  });

  // 3️⃣ Criar ou atualizar licença desktop (tabela desktopLicense)
  let license = await prisma.desktopLicense.findFirst({
    where: { customerId: customer.id },
  });

  let licenseKey = "";

  if (license) {
    // Atualiza a licença existente (renovação)
    await prisma.desktopLicense.update({
      where: { id: license.id },
      data: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        plan,
      },
    });
    licenseKey = license.key;
  } else {
    // Gera uma nova licença no padrão NEXUS-XXXX-XXXX-XXXX
    const genSegment = () => Math.random().toString(36).slice(-4).padStart(4, '0').toUpperCase();
    licenseKey = `NEXUS-${genSegment()}-${genSegment()}-${genSegment()}`;
    
    await prisma.desktopLicense.create({
      data: {
        key: licenseKey,
        customerId: customer.id,
        plan,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 4️⃣ Criar usuário no portal (se ainda não existir)
  const normalized = userEmail.toLowerCase().trim();
  let user = await prisma.user.findUnique({ where: { username: normalized } });
  if (!user) {
    // Usar uma senha padrão temporária (ex: nexus123)
    const tempPassword = "mudar123";
    const hashed = await bcrypt.hash(tempPassword, 10);
    user = await prisma.user.create({
      data: {
        username: normalized,
        email: normalized,
        password: hashed,
        role: "CUSTOMER",
      },
    });
    // Log de senha temporária para que o admin possa comunicar ao cliente
    await prisma.interactionLog.create({
      data: {
        customerId: customer.id,
        type: "SYSTEM",
        content: `Usuário criado via webhook Atomo. Usuário: ${normalized} | Senha temporária: ${tempPassword}`,
      },
    });
  }

  // 5️⃣ Vincular usuário ao cliente
  await prisma.customer.update({
    where: { id: customer.id },
    data: { userId: user.id },
  });

  console.log(`[ATOMO WEBHOOK] Licença ${licenseKey} criada/atualizada para ${userEmail}`);
  return NextResponse.json({ received: true });
}
