import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("WEBHOOK CAKTO RECEBIDO:", body);

    // Mapeamento campos CAKTO (Ajustar conforme documentação oficial)
    const email = body.customer?.email || body.email;
    const name = body.customer?.name || body.name;
    const status = body.payment_status || body.status; // 'approved', 'completed', etc.
    const planName = body.product_name || "Nexus360 Desktop";

    if (!email) {
      return NextResponse.json({ error: "Email não enviado" }, { status: 400 });
    }

    // Só processamos se o pagamento estiver aprovado
    // Nota: Ajustar a string 'approved' conforme o retorno real da CAKTO
    const isApproved = status === 'approved' || status === 'paid' || status === 'completed';

    if (isApproved) {
      // 1. Criar ou atualizar o Customer (CRM)
      const customer = await prisma.customer.upsert({
        where: { email },
        update: {
          status: "ACTIVE",
          name: name || "Cliente Nexus",
          source: "CAKTO"
        },
        create: {
          email,
          name: name || "Cliente Nexus",
          status: "ACTIVE",
          source: "CAKTO",
          pipelineStage: "CLOSED_WON"
        }
      });

      // 2. Criar a Licença Desktop se não existir
      // Gerar uma chave aleatória EX: NX360-XXXX-XXXX
      const licenseKey = `NX360-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      await prisma.desktopLicense.create({
        data: {
          key: licenseKey,
          customerId: customer.id,
          plan: planName,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias padrão
        }
      });

      // 3. Registrar a Transação
      await prisma.subscription.create({
        data: {
          customerId: customer.id,
          amount: body.amount || 0,
          status: "PAID",
          paymentMethod: "CAKTO",
          paymentId: body.id?.toString() || "manual",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paidAt: new Date()
        }
      });

      // 4. Criar Usuário para Login no Sistema (Portal do Cliente)
      const emailNormalized = email.toLowerCase().trim();
      let user = await prisma.user.findUnique({
        where: { username: emailNormalized }
      });

      const password = Math.random().toString(36).slice(-8);

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: {
            username: emailNormalized,
            email: emailNormalized,
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
          content: `Acesso ao portal ativado automaticamente (Cakto). Usuário: ${emailNormalized} | Senha temporária: ${password}`
        }
      });

      console.log(`Sucesso: Licença ${licenseKey} gerada para ${emailNormalized} e acesso ao portal criado.`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("ERRO WEBHOOK CAKTO:", error.message);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
