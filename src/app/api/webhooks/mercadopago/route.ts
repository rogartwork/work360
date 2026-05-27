import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from 'mercadopago';
import bcrypt from "bcryptjs";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-YOUR-TOKEN-HERE' 
});

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("data.id");

    if (type === "payment" && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === "approved") {
        const { plan_id, customer_email, customer_name } = paymentData.metadata;

        // 1. Criar ou atualizar o Cliente no CRM
        const customer = await prisma.customer.upsert({
          where: { email: customer_email },
          update: { status: "ACTIVE" },
          create: {
            email: customer_email,
            name: customer_name,
            status: "ACTIVE"
          }
        });

        // 2. Registrar a Assinatura (Subscription)
        const durationDays = plan_id === "trimestral" ? 90 : plan_id === "anual" ? 365 : 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        await prisma.subscription.create({
          data: {
            customerId: customer.id,
            amount: paymentData.transaction_amount || 0,
            status: "PAID",
            paymentMethod: paymentData.payment_method_id,
            paymentId: id.toString(),
            paidAt: new Date(),
            expiresAt: expiresAt
          }
        });

        // 3. Criar a Licença Web Automática
        const username = customer_email.split('@')[0] + Math.floor(Math.random() * 1000);
        const password = Math.random().toString(36).slice(-8);

        await prisma.webLicense.create({
          data: {
            customerId: customer.id,
            name: `Acesso via ${plan_id.toUpperCase()}`,
            username: username,
            password: password,
            plan: plan_id.toUpperCase(),
            maxSessions: plan_id === "mensal" ? 1 : 3,
            expiresAt: expiresAt
          }
        });

        // 4. Criar Usuário para Login no Sistema (Portal do Cliente)
        let user = await prisma.user.findUnique({
          where: { username: customer_email }
        });

        if (!user) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user = await prisma.user.create({
            data: {
              username: customer_email,
              email: customer_email,
              password: hashedPassword,
              role: "CUSTOMER"
            }
          });
        }

        // Vincular o User ID ao Customer
        await prisma.customer.update({
          where: { id: customer.id },
          data: { userId: user.id }
        });

        // Registrar no histórico do cliente (CRM) com a senha temporária gerada
        await prisma.interactionLog.create({
          data: {
            customerId: customer.id,
            type: "SYSTEM",
            content: `Acesso ao portal ativado automaticamente (Mercado Pago). Usuário: ${customer_email} | Senha temporária: ${password}`
          }
        });

        console.log(`[MP WEBHOOK] Fluxo completo para ${customer_email}: Customer + Subscription + WebLicense + User Login vinculado criado.`);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ ERRO WEBHOOK MP:", error.message);
    return NextResponse.json({ error: "Erro interno no webhook" }, { status: 500 });
  }
}
