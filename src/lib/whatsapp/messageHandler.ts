/**
 * WORK360 — Incoming Message Handler
 * Processa mensagens recebidas do WhatsApp:
 * 1. Upsert do contato (InboxContact)
 * 2. Upsert do cliente no CRM (Customer), se telefone já existir
 * 3. Salva a mensagem (InboxMessage)
 * 4. Notifica a UI via waManager (SSE)
 */

import { proto } from "@whiskeysockets/baileys";
import { prisma } from "@/lib/prisma";
import { waManager } from "./manager";

function extractBody(msg: proto.IWebMessageInfo): string | null {
  const m = msg.message;
  if (!m) return null;
  return (
    m.conversation ??
    m.extendedTextMessage?.text ??
    m.imageMessage?.caption ??
    m.videoMessage?.caption ??
    m.documentMessage?.caption ??
    "[mídia]"
  );
}

function extractType(msg: proto.IWebMessageInfo): string {
  const m = msg.message;
  if (!m) return "TEXT";
  if (m.imageMessage) return "IMAGE";
  if (m.audioMessage || m.ptvMessage) return "AUDIO";
  if (m.videoMessage) return "VIDEO";
  if (m.documentMessage) return "DOC";
  return "TEXT";
}

export async function handleIncomingMessage(
  sessionId: string,
  msg: proto.IWebMessageInfo
) {
  try {
    const rawJid = msg.key?.remoteJid;
    if (!rawJid || rawJid.endsWith("@g.us")) return; // ignora grupos

    const pushName = msg.pushName ?? undefined;
    const body = extractBody(msg);
    const type = extractType(msg);

    // 1. Upsert InboxContact
    const contact = await prisma.inboxContact.upsert({
      where: { phone: rawJid },
      update: {
        ...(pushName && { pushName }),
        updatedAt: new Date(),
      },
      create: {
        phone: rawJid,
        name: pushName,
        pushName,
      },
    });

    // 2. Tenta vincular ao CRM se o número bater com algum Customer
    if (!contact.customerId) {
      const phoneDigits = rawJid.replace(/\D/g, "").replace(/^55/, "");
      const customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { phone: { contains: phoneDigits } },
            { email: rawJid }, // fallback improvável mas cobre casos de API channel
          ],
        },
      });

      if (customer) {
        await prisma.inboxContact.update({
          where: { id: contact.id },
          data: { customerId: customer.id },
        });
      } else {
        // Cria novo customer como Lead automaticamente
        const newCustomer = await prisma.customer.create({
          data: {
            name: pushName ?? rawJid,
            email: `wa_${rawJid}@work360.local`, // placeholder único
            phone: rawJid,
            source: "WHATSAPP",
            status: "LEAD",
            pipelineStage: "NEW_LEAD",
          },
        });
        await prisma.inboxContact.update({
          where: { id: contact.id },
          data: { customerId: newCustomer.id },
        });

        // Log de interação no CRM
        await prisma.interactionLog.create({
          data: {
            customerId: newCustomer.id,
            type: "WHATSAPP",
            content: `Lead criado automaticamente via WhatsApp · ${rawJid}`,
          },
        });
      }
    }

    // 3. Salva mensagem
    const saved = await prisma.inboxMessage.create({
      data: {
        sessionId,
        contactId: contact.id,
        direction: "IN",
        type,
        body,
        isRead: false,
      },
      include: { contact: true },
    });

    // 4. Notifica UI em tempo real
    waManager.broadcast("message:new", {
      sessionId,
      message: saved,
    });

    console.log(`[WA] 📩 ${rawJid}: ${body?.slice(0, 60)}`);
  } catch (err) {
    console.error("[WA] Erro ao processar mensagem:", err);
  }
}
