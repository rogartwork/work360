/**
 * WORK360 — Incoming Message Handler
 * Processa mensagens recebidas do WhatsApp:
 * 1. Filtra mensagens irrelevantes (grupos, status, broadcasts, protocol)
 * 2. Upsert do contato (InboxContact)
 * 3. Vincula ao CRM se o número existir
 * 4. Salva a mensagem (InboxMessage)
 * 5. Notifica a UI via waManager (SSE)
 */

import { proto } from "@whiskeysockets/baileys";
import { prisma } from "@/lib/prisma";
import { waManager } from "./manager";
import { logToFile } from "./session";

/**
 * Desembrulha mensagens do WhatsApp que possam estar dentro de wrappers
 * como ephemeralMessage, viewOnceMessage, etc.
 */
function unwrapMessage(m: any): any {
  if (!m) return null;
  if (m.ephemeralMessage?.message) return unwrapMessage(m.ephemeralMessage.message);
  if (m.viewOnceMessage?.message) return unwrapMessage(m.viewOnceMessage.message);
  if (m.viewOnceMessageV2?.message) return unwrapMessage(m.viewOnceMessageV2.message);
  if (m.viewOnceMessageV2Extension?.message) return unwrapMessage(m.viewOnceMessageV2Extension.message);
  if (m.documentWithCaptionMessage?.message) return unwrapMessage(m.documentWithCaptionMessage.message);
  return m;
}

function extractBody(msg: proto.IWebMessageInfo): string | null {
  const rawMessage = msg.message;
  if (!rawMessage) {
    logToFile("[WA-HANDLER-EXTRACT] No rawMessage");
    return null;
  }

  const m = unwrapMessage(rawMessage);
  if (!m) {
    logToFile("[WA-HANDLER-EXTRACT] unwrapMessage returned null");
    return null;
  }

  logToFile(`[WA-HANDLER-EXTRACT] unwrapped keys: ${Object.keys(m).join(", ")}, conversation: ${m.conversation}`);

  // Ignorar mensagens de protocolo e sinalização interna do WhatsApp
  if (
    m.protocolMessage ||
    m.reactionMessage ||
    m.pollUpdateMessage ||
    m.senderKeyDistributionMessage
  ) {
    logToFile(`[WA-HANDLER-EXTRACT] Ignored protocol/reaction: protocolMessage=${!!m.protocolMessage}, reactionMessage=${!!m.reactionMessage}, pollUpdateMessage=${!!m.pollUpdateMessage}, senderKeyDistributionMessage=${!!m.senderKeyDistributionMessage}`);
    return null;
  }

  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return m.imageMessage.caption;
  if (m.videoMessage?.caption) return m.videoMessage.caption;
  if (m.documentMessage?.caption) return m.documentMessage.caption;

  if (m.audioMessage) return "[áudio]";
  if (m.videoMessage) return "[vídeo]";
  if (m.imageMessage) return "[imagem]";
  if (m.documentMessage) return "[documento]";
  if (m.stickerMessage) return "[sticker]";

  logToFile("[WA-HANDLER-EXTRACT] No matching message content type found, returning null");
  return null; // ignorar mensagem sem conteúdo identificável
}

function extractType(msg: proto.IWebMessageInfo): string {
  const rawMessage = msg.message;
  if (!rawMessage) return "TEXT";

  const m = unwrapMessage(rawMessage);
  if (!m) return "TEXT";

  if (m.imageMessage) return "IMAGE";
  if (m.audioMessage || m.ptvMessage) return "AUDIO";
  if (m.videoMessage) return "VIDEO";
  if (m.documentMessage) return "DOC";
  if (m.stickerMessage) return "STICKER";
  return "TEXT";
}

function normalizeJid(jid: string): string {
  if (!jid) return jid;
  if (jid.includes(":")) {
    const parts = jid.split("@");
    if (parts.length === 2) {
      const phonePart = parts[0].split(":")[0];
      return `${phonePart}@${parts[1]}`;
    }
  }
  return jid;
}

// JIDs que devem ser completamente ignorados (newsletter, grupos, status, broadcasts)
const IGNORED_JIDS = [
  "@broadcast",       // listas de transmissão
  "status@broadcast", // status do WhatsApp
  "@newsletter",      // newsletters do WhatsApp
  "@g.us",            // grupos (dupla segurança além do check abaixo)
];

export async function handleIncomingMessage(
  sessionId: string,
  msg: proto.IWebMessageInfo
) {
  try {
    const rawJid = msg.key?.remoteJid;
    if (!rawJid) {
      logToFile("[WA-HANDLER] Ignorado: mensagem sem remoteJid");
      return;
    }

    logToFile(`[WA-HANDLER] Recebida mensagem de JID: ${rawJid}, fromMe: ${msg.key?.fromMe}`);

    // ── Resolução de JID @lid para Phone Number (@s.whatsapp.net) ──
    let jid = rawJid;
    if (rawJid.includes("@lid")) {
      const sock = (globalThis as any).__work360_active_sockets?.get(sessionId);
      if (sock) {
        const store = sock.signalRepository?.lidMapping;
        if (store) {
          try {
            const resolved = await store.getPNForLID(rawJid);
            if (resolved) {
              logToFile(`[WA-HANDLER] JID @lid ${rawJid} resolvido para PN ${resolved} via lidMapping`);
              jid = resolved;
            }
          } catch (e: any) {
            logToFile(`[WA-HANDLER] Erro ao buscar getPNForLID: ${e.message}`);
          }
        }
      }

      // Fallback: tentar obter do Alt field do message key
      if (jid.includes("@lid")) {
        const altJid = (msg.key as any)?.remoteJidAlt || (msg as any)?.remoteJidAlt || (msg as any)?.participantAlt;
        if (altJid && altJid.endsWith("@s.whatsapp.net")) {
          logToFile(`[WA-HANDLER] JID @lid ${rawJid} resolvido para PN ${altJid} via Alt Field`);
          jid = altJid;
        }
      }
    }

    // Normalizar JID resolvido para remover qualquer sufixo de dispositivo (ex: :0@s.whatsapp.net)
    jid = normalizeJid(jid);

    // ── Filtros de JID ──────────────────────────────────────────
    // Ignorar se o JID é o próprio chip (canal, não cliente)
    const sock = (globalThis as any).__work360_active_sockets?.get(sessionId);
    const ownPhone = sock?.user?.id?.split(":")[0];
    if (ownPhone) {
      const remoteDigits = jid.replace(/\D/g, "");
      const ownDigits = ownPhone.replace(/\D/g, "");
      const ownShort = ownDigits.replace(/^55/, ""); // sem código do país
      if (remoteDigits === ownDigits || remoteDigits === ownShort || remoteDigits.includes(ownShort)) {
        logToFile(`[WA-HANDLER] Ignorado: mensagem do próprio chip (JID: ${jid}, OwnPhone: ${ownPhone})`);
        return;
      }
    }

    // Ignorar grupos
    if (jid.endsWith("@g.us")) {
      logToFile(`[WA-HANDLER] Ignorado: grupo (${jid})`);
      return;
    }
    // Ignorar broadcasts, status, newsletters e outros JIDs especiais
    if (IGNORED_JIDS.some(j => jid.includes(j))) {
      logToFile(`[WA-HANDLER] Ignorado: JID na blacklist (${jid})`);
      return;
    }
    // Aceitar apenas contatos individuais @s.whatsapp.net ou @lid
    if (!jid.endsWith("@s.whatsapp.net") && !jid.endsWith("@lid")) {
      logToFile(`[WA-HANDLER] Ignorado: não termina com @s.whatsapp.net nem @lid (${jid})`);
      return;
    }

    // ── Filtros de mensagem ─────────────────────────────────────
    const body = extractBody(msg);
    // Ignorar mensagens sem corpo identificável (protocol, reaction, etc.)
    if (body === null) {
      logToFile(`[WA-HANDLER] Ignorado: mensagem sem corpo ou protocolo/reação de ${jid}`);
      return;
    }

    const type = extractType(msg);
    const pushName = msg.pushName ?? undefined;

    logToFile(`[WA-HANDLER] Mensagem aceita. Corpo: "${body}", Tipo: ${type}, PushName: ${pushName}`);

    // 1. Upsert InboxContact
    const contact = await prisma.inboxContact.upsert({
      where: { phone: jid },
      update: {
        ...(pushName && { pushName }),
        updatedAt: new Date(),
      },
      create: {
        phone: jid,
        name: pushName,
        pushName,
      },
    });

    // 2. Tenta vincular ao CRM se o número bater com algum Customer existente
    // 2. Tenta vincular ao CRM se o número bater com algum Customer existente
    let customerId = contact.customerId;
    if (!customerId) {
      // Extrai apenas os dígitos, remove o código do país 55 se presente
      const rawDigits = jid.replace(/\D/g, "");
      // Tenta com e sem código do país para máxima compatibilidade
      const phoneVariants = [
        rawDigits,
        rawDigits.replace(/^55/, ""),
        rawDigits.length === 13 ? rawDigits.slice(2) : null, // remove +55
        rawDigits.length === 11 ? `55${rawDigits}` : null,   // adiciona +55
      ].filter(Boolean) as string[];

      let customer = null;
      for (const variant of phoneVariants) {
        customer = await prisma.customer.findFirst({
          where: { phone: { contains: variant } },
        });
        if (customer) break;
      }

      if (customer) {
        logToFile(`[WA-HANDLER] Vinculando contato ${jid} ao cliente CRM "${customer.name}" (ID: ${customer.id})`);
        await prisma.inboxContact.update({
          where: { id: contact.id },
          data: { customerId: customer.id },
        });
        customerId = customer.id;
      }
    }

    // 3. Verificar se mensagem duplicada já existe (evitar duplicatas no sync)
    const msgId = msg.key?.id;
    if (msgId) {
      const existing = await prisma.inboxMessage.findFirst({
        where: { sessionId, contactId: contact.id, body, direction: "IN" },
        orderBy: { sentAt: "desc" },
        take: 1,
      });
      // Se a mesma mensagem chegou há menos de 2 segundos, é duplicata do sync
      if (existing && (Date.now() - new Date(existing.sentAt).getTime()) < 2000) {
        logToFile(`[WA-HANDLER] Ignorado: mensagem duplicada do sync de ${jid}`);
        return;
      }
    }

    // 4. Salva mensagem
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

    // Salva log de interação no CRM se o contato estiver associado a um cliente
    if (customerId) {
      try {
        await prisma.interactionLog.create({
          data: {
            customerId,
            type: "WHATSAPP",
            content: `[Cliente]: ${body}`
          }
        });
        logToFile(`[WA-HANDLER] ✅ Log de interação criado no CRM para o cliente ${customerId}`);
      } catch (logErr: any) {
        logToFile(`[WA-HANDLER-LOG] Erro ao criar log de interação para recebimento: ${logErr.message}`);
      }
    }

    // 5. Notifica UI em tempo real
    waManager.broadcast("message:new", {
      sessionId,
      message: saved,
    });

    logToFile(`[WA-HANDLER] ✅ Mensagem salva com sucesso de ${jid}: ${body.slice(0, 80)}`);
  } catch (err: any) {
    logToFile(`[WA-HANDLER] ❌ Erro ao processar mensagem recebida: ${err.message}\n${err.stack}`);
  }
}
