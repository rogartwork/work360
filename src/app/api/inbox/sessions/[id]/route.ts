import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stopSession } from "@/lib/whatsapp/session";
import { waManager } from "@/lib/whatsapp/manager";

// GET /api/inbox/sessions/[id] — status de uma sessão específica
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const live = waManager.getSession(id);
  const db = await prisma.whatsAppSession.findUnique({ where: { id } });

  if (!db) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  return NextResponse.json({
    ...db,
    status: live?.status ?? db.status,
    qrCode: live?.qrCode ?? db.qrCode,
    phoneNumber: live?.phoneNumber ?? db.phoneNumber,
  });
}

// DELETE /api/inbox/sessions/[id] — desconectar e remover sessão
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await stopSession(id);
  waManager.removeSession(id);

  await prisma.whatsAppSession.delete({ where: { id } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
