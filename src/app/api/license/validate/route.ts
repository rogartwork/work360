import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/license/validate
 * 
 * Endpoint chamado pelo NEXUS 360 Desktop para validar a licença.
 * 
 * Corpo da requisição:
 * {
 *   key: "NEXUS-XXXX-XXXX-XXXX",
 *   machineId: "hash-da-maquina",
 *   version: "1.0.0",
 *   product: "NEXUS360D"
 * }
 * 
 * Resposta de sucesso:
 * { valid: true, status: "ATIVA", clientName: "...", expiresAt: "...", plan: "..." }
 *
 * Resposta de falha:
 * { valid: false, status: "INVALIDA" | "EXPIRADA", message: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, machineId, version, product } = body;

    // Validação básica da requisição
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { valid: false, status: 'INVALIDA', message: 'Chave de licença não fornecida.' },
        { status: 400 }
      );
    }

    if (product !== 'NEXUS360D') {
      return NextResponse.json(
        { valid: false, status: 'INVALIDA', message: 'Produto não reconhecido.' },
        { status: 400 }
      );
    }

    // Buscar a licença no banco
    const license = await prisma.desktopLicense.findUnique({
      where: { key: key.trim().toUpperCase() },
      include: {
        customer: {
          include: {
            user: true
          }
        }
      }
    });

    if (!license) {
      return NextResponse.json({
        valid: false,
        status: 'INVALIDA',
        message: 'Chave de licença não encontrada. Verifique e tente novamente.',
      });
    }

    // Verificar se está ativa
    if (!license.isActive) {
      return NextResponse.json({
        valid: false,
        status: 'INVALIDA',
        message: 'Esta licença foi desativada pelo administrador. Entre em contato com o suporte.',
      });
    }

    // Verificar validade
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        status: 'EXPIRADA',
        message: `Licença expirada em ${new Date(license.expiresAt).toLocaleDateString('pt-BR')}. Renove para continuar.`,
        clientName: license.customer.name,
        expiresAt: license.expiresAt.toISOString(),
      });
    }

    // ── Binding de Máquina ──────────────────────────────────────
    // Se a licença ainda não tem machineId vinculado, vincular agora.
    // Se já tem, verificar se é a mesma máquina.
    if (machineId) {
      if (!license.machineId) {
        // Primeiro uso — vincular à máquina
        await prisma.desktopLicense.update({
          where: { key: license.key },
          data: {
            machineId,
            lastSeenAt: new Date(),
          },
        });
      } else if (license.machineId !== machineId) {
        // Máquina diferente — bloquear
        return NextResponse.json({
          valid: false,
          status: 'INVALIDA',
          message: 'Esta licença já está vinculada a outro computador. Entre em contato com o suporte para transferência.',
        });
      } else {
        // Mesma máquina — atualizar lastSeenAt
        await prisma.desktopLicense.update({
          where: { key: license.key },
          data: { lastSeenAt: new Date() },
        });
      }
    }

    // ── Obter limites da Licença Desktop ou aplicar fallback ──
    let maxSessions = license.maxSessions ?? 5; 
    let allowWarmup = license.allowWarmup ?? true;
    let allowInclusion = license.allowInclusion ?? true;
    let allowMessager = license.allowMessager ?? true;
    let allowDisplay = license.allowDisplay ?? true;

    if (license.customer?.user) {
      // Legacy fallback se os campos nao existirem e houver user vinculado
      const u = license.customer.user;
      if (license.maxSessions === undefined) maxSessions = u.maxSessions;
      if (license.allowWarmup === undefined) allowWarmup = u.allowWarmup;
      if (license.allowInclusion === undefined) allowInclusion = u.allowInclusion;
      if (license.allowMessager === undefined) allowMessager = u.allowMessager;
      if (license.allowDisplay === undefined) allowDisplay = u.allowDisplay;
    } else if (license.maxSessions === undefined) {
      // Fallback baseado no plano se o usuário SaaS não estiver diretamente vinculado
      const planName = (license.plan || 'STANDARD').toUpperCase();
      if (planName === 'GOLD' || planName === 'PREMIUM' || planName === 'ENTERPRISE') {
        maxSessions = 10;
      } else if (planName === 'SILVER' || planName === 'STANDARD' || planName === 'PRO') {
        maxSessions = 5;
      } else {
        maxSessions = 1;
        allowWarmup = false;
        allowInclusion = false;
        allowMessager = false;
        allowDisplay = false;
      }
    }

    // ── Sucesso ─────────────────────────────────────────────────
    return NextResponse.json({
      valid: true,
      status: 'ATIVA',
      clientName: license.customer.name,
      clientEmail: license.customer.email,
      expiresAt: license.expiresAt?.toISOString() ?? null,
      plan: license.plan,
      maxSessions,
      allowWarmup,
      allowInclusion,
      allowMessager,
      allowDisplay,
      message: `Licença ativa. Bem-vindo, ${license.customer.name}!`,
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('[NEXUS-HUB License Validate] Erro:', error.message);
    return NextResponse.json(
      { valid: false, status: 'INVALIDA', message: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
