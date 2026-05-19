import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || !session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Buscar o cliente vinculado ao usuário logado
    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId }
    });

    if (!customer) {
      return NextResponse.json({ error: "Perfil de cliente não encontrado" }, { status: 404 });
    }

    // 2. Extrair dados da requisição
    const { label } = await req.json();
    const { id: licenseId } = await params;

    if (!licenseId) {
      return NextResponse.json({ error: "ID da licença é obrigatório" }, { status: 400 });
    }

    // 3. Buscar a licença e validar a posse
    const license = await prisma.desktopLicense.findUnique({
      where: { id: licenseId }
    });

    if (!license) {
      return NextResponse.json({ error: "Licença não encontrada" }, { status: 404 });
    }

    if (license.customerId !== customer.id) {
      return NextResponse.json({ error: "Não autorizado a alterar esta licença" }, { status: 403 });
    }

    // 4. Atualizar o label/nickname da licença
    const updatedLicense = await prisma.desktopLicense.update({
      where: { id: licenseId },
      data: { label: label || null }
    });

    return NextResponse.json({ success: true, license: updatedLicense });

  } catch (error: any) {
    console.error("ERRO UPDATE LICENSE NICKNAME:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar o apelido da licença" }, { status: 500 });
  }
}
