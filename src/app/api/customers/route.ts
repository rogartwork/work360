import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      include: {
        affiliate: {
          select: {
            referralCode: true,
          }
        },
        _count: {
          select: {
            licenses: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("ERRO GET CUSTOMERS:", error.message);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'SUPER_ADMIN' && session.role !== 'SUPPORT')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, cpfCnpj, address, notes, affiliateId } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e Email são obrigatórios" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        address,
        notes,
        affiliateId,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("ERRO POST CUSTOMER:", error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email ou CPF/CNPJ já cadastrado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
