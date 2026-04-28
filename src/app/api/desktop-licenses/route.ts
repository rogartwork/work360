import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NEXUS-${segment()}-${segment()}-${segment()}`;
}

/**
 * GET /api/desktop-licenses
 * Lista todas as licenças Desktop
 */
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const licenses = await prisma.desktopLicense.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(licenses);
}

/**
 * POST /api/desktop-licenses
 * Cria uma nova licença Desktop
 */
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  try {
    const { clientName, email, plan, expiresAt, notes } = await req.json();

    if (!clientName || typeof clientName !== 'string') {
      return NextResponse.json({ error: 'Nome do cliente é obrigatório.' }, { status: 400 });
    }

    const key = generateLicenseKey();

    const license = await prisma.desktopLicense.create({
      data: {
        key,
        clientName: clientName.trim(),
        email: email?.trim() || null,
        plan: plan || 'STANDARD',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(license, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
