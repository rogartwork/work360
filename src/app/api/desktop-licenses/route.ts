import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NEXUS-${segment()}-${segment()}-${segment()}`;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const licenses = await prisma.desktopLicense.findMany({
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(licenses);
}

/**
 * POST /api/desktop-licenses
 * Cria uma nova licença Desktop vinculada a um cliente
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  try {
    const { customerId, plan, expiresAt } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'ID do cliente é obrigatório.' }, { status: 400 });
    }

    const key = generateLicenseKey();

    const license = await prisma.desktopLicense.create({
      data: {
        key,
        customerId,
        plan: plan || 'STANDARD',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(license, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
