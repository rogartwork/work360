import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inbox/conversations — lista conversas agrupadas por contato
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? undefined;
  const onlyUnread = searchParams.get("unread") === "true";

  const contacts = await prisma.inboxContact.findMany({
    where: {
      messages: {
        some: {
          ...(sessionId && { sessionId }),
          ...(onlyUnread && { isRead: false }),
        },
      },
    },
    include: {
      customer: { select: { id: true, name: true, status: true, source: true } },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1, // última mensagem para preview
        where: sessionId ? { sessionId } : undefined,
      },
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              ...(sessionId && { sessionId }),
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(
    contacts.map((c) => ({
      contactId: c.id,
      phone: c.phone,
      name: c.name ?? c.pushName ?? c.phone,
      pushName: c.pushName,
      avatarUrl: c.avatarUrl,
      customerId: c.customerId,
      customerName: c.customer?.name,
      customerStatus: c.customer?.status,
      lastMessage: c.messages[0] ?? null,
      unreadCount: c._count.messages,
    }))
  );
}
