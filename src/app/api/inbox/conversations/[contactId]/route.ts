import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inbox/conversations/[contactId] — mensagens de uma conversa
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined; // paginação
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  const messages = await prisma.inboxMessage.findMany({
    where: {
      contactId,
      ...(sessionId && { sessionId }),
      ...(cursor && { id: { lt: cursor } }),
    },
    orderBy: { sentAt: "desc" },
    take: limit,
    include: { session: { select: { label: true } } },
  });

  // Marca como lidas
  await prisma.inboxMessage.updateMany({
    where: { contactId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json(messages.reverse()); // cronológico para a UI
}
