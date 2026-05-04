import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração do Mercado Pago (Token deve estar no .env)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-YOUR-TOKEN-HERE' 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, email, name } = body;

    // 1. Buscar detalhes do plano no banco (ou usar estático por enquanto)
    const plans: any = {
      "mensal": { title: "Nexus 360 Mensal", price: 147, duration: 30 },
      "trimestral": { title: "Nexus 360 Trimestral", price: 387, duration: 90 },
      "anual": { title: "Nexus 360 Anual", price: 1199, duration: 365 }
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // 2. Criar Preferência no Mercado Pago
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: `Assinatura Nexus-CRM: ${selectedPlan.title}`,
            quantity: 1,
            unit_price: selectedPlan.price,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: email,
          name: name
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/vendas/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/vendas/erro`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/vendas/pendente`
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_WEBHOOK_URL}/api/webhooks/mercadopago`,
        metadata: {
          plan_id: planId,
          customer_email: email,
          customer_name: name
        }
      }
    });

    return NextResponse.json({ 
      id: result.id, 
      init_point: result.init_point // Link para o checkout do MP
    });

  } catch (error: any) {
    console.error("ERRO CHECKOUT MP:", error.message);
    return NextResponse.json({ error: "Erro ao processar checkout" }, { status: 500 });
  }
}
