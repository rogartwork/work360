/**
 * WORK360 — WhatsApp Session (Baileys)
 * Gerencia o ciclo de vida de uma sessão: conexão, QR Code, eventos.
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  proto,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";
import { waManager, SessionStatus } from "./manager";
import { handleIncomingMessage } from "./messageHandler";

const AUTH_DIR = path.join(process.cwd(), ".wa_sessions");

export function logToFile(msg: string) {
  try {
    const logPath = path.join(process.cwd(), "wa_live_events.log");
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logPath, line);
  } catch (err) {
    console.error("Erro ao escrever no arquivo de log:", err);
  }
}

function getAuthDir(sessionId: string) {
  const dir = path.join(AUTH_DIR, sessionId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── Mapa de sockets ativos — persiste via globalThis para sobreviver a hot reloads ──
declare global {
  // eslint-disable-next-line no-var
  var __work360_active_sockets: Map<string, ReturnType<typeof makeWASocket>> | undefined;
}

const activeSockets: Map<string, ReturnType<typeof makeWASocket>> =
  globalThis.__work360_active_sockets ??
  (globalThis.__work360_active_sockets = new Map());

export async function startSession(sessionId: string, label: string) {
  if (activeSockets.has(sessionId)) {
    console.log(`[WA] Sessão ${sessionId} já ativa em memória.`);
    return;
  }

  waManager.setSession(sessionId, {
    id: sessionId,
    label,
    status: "CONNECTING",
  });

  const authDir = getAuthDir(sessionId);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ["WORK360", "Chrome", "1.1.0"],
    syncFullHistory: false,
  });

  activeSockets.set(sessionId, sock);

  // ── QR Code ────────────────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    logToFile(`[CONEXÃO] update: connection=${connection}, qr=${!!qr}, lastDisconnect=${lastDisconnect ? JSON.stringify(lastDisconnect) : 'none'}`);

    if (qr) {
      // Importação dinâmica do qrcode para evitar problemas de SSR
      const QRCode = (await import("qrcode")).default;
      const qrBase64 = await QRCode.toDataURL(qr);

      waManager.setSession(sessionId, {
        id: sessionId,
        label,
        status: "QR_PENDING",
        qrCode: qrBase64,
      });

      // Persiste QR no banco para recuperação via SSE
      await prisma.whatsAppSession.upsert({
        where: { id: sessionId },
        update: { status: "QR_PENDING", qrCode: qrBase64 },
        create: { id: sessionId, label, status: "QR_PENDING", qrCode: qrBase64 },
      });
    }

    if (connection === "open") {
      const phone = sock.user?.id?.split(":")[0] ?? undefined;
      logToFile(`[CONEXÃO] ✅ Aberta! Usuário ID: ${sock.user?.id}, Phone: ${phone}`);

      // Armazena o próprio número do chip para filtrar mensagens
      // O chip é apenas um canal — nunca deve aparecer como contato ou cliente
      if (phone) {
        ownPhone = phone; // ex: "5511964233985"
      }

      waManager.setSession(sessionId, {
        id: sessionId,
        label,
        status: "CONNECTED",
        qrCode: undefined,
        phoneNumber: phone,
        lastSeenAt: new Date(),
      });

      await prisma.whatsAppSession.upsert({
        where: { id: sessionId },
        update: {
          status: "CONNECTED",
          qrCode: null,
          phoneNumber: phone,
          lastSeenAt: new Date(),
        },
        create: {
          id: sessionId,
          label,
          status: "CONNECTED",
          phoneNumber: phone,
          lastSeenAt: new Date(),
        },
      });

      console.log(`[WA] ✅ Sessão conectada: ${sessionId} (${phone})`);
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      logToFile(`[CONEXÃO] ❌ Fechada. shouldReconnect=${shouldReconnect}, erro=${JSON.stringify(lastDisconnect?.error)}`);

      console.log(
        `[WA] Sessão fechada: ${sessionId}. Reconectar: ${shouldReconnect}`
      );

      activeSockets.delete(sessionId);

      const newStatus: SessionStatus = shouldReconnect
        ? "CONNECTING"
        : "DISCONNECTED";

      waManager.setSession(sessionId, { id: sessionId, label, status: newStatus });

      await prisma.whatsAppSession.update({
        where: { id: sessionId },
        data: { status: newStatus, qrCode: null },
      }).catch(() => {});

      if (shouldReconnect) {
        setTimeout(() => startSession(sessionId, label), 3000);
      }
    }
  });

  // ── Salvar credenciais ──────────────────────────────────────
  sock.ev.on("creds.update", saveCreds);

  // Número próprio do chip (canal de comunicação — nunca deve ser contato/cliente)
  // Será preenchido no evento "connection.update" quando status === "open"
  let ownPhone: string | undefined = sock.user?.id?.split(":")[0];

  // ── Mensagens recebidas ─────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    logToFile(`[MENSAGENS] upsert recebido. Tipo: "${type}", Qtd: ${messages?.length}`);

    // Apenas processar notificações de novas mensagens, não sync de histórico
    if (type !== "notify") {
      logToFile(`[MENSAGENS] Ignorando evento pois o tipo não é "notify" (é "${type}")`);
      return;
    }

    // Tentar capturar o próprio número se ainda não disponível
    if (!ownPhone && sock.user?.id) {
      ownPhone = sock.user.id.split(":")[0];
      logToFile(`[MENSAGENS] Número próprio obtido do socket: ${ownPhone}`);
    }

    for (const msg of messages) {
      const jid = msg.key?.remoteJid;
      const isFromMe = msg.key?.fromMe;
      logToFile(`[MENSAGENS] Analisando msg ID: ${msg.key?.id}, JID: ${jid}, fromMe: ${isFromMe}, HasMessageObj: ${!!msg.message}`);
      if (jid && jid.includes("@lid")) {
        logToFile(`[MENSAGENS] [DEBUG-LID] Objeto msg completo: ${JSON.stringify(msg)}`);
      }


      // Ignorar mensagens enviadas por nós (próprio número)
      if (isFromMe) {
        logToFile(`[MENSAGENS] Ignorada: fromMe=true`);
        continue;
      }
      // Ignorar mensagens sem JID de origem
      if (!jid) {
        logToFile(`[MENSAGENS] Ignorada: sem remoteJid`);
        continue;
      }
      // Ignorar mensagens sem conteúdo (protocol/keep-alive)
      if (!msg.message) {
        logToFile(`[MENSAGENS] Ignorada: sem conteúdo (msg.message está vazio/protocolo/keep-alive)`);
        continue;
      }

      // Ignorar se o JID é o próprio chip (canal, não cliente)
      if (ownPhone) {
        const remoteDigits = jid.replace(/\D/g, "");
        const ownDigits = ownPhone.replace(/\D/g, "");
        const ownShort = ownDigits.replace(/^55/, ""); // sem código do país
        if (remoteDigits === ownDigits || remoteDigits === ownShort || remoteDigits.includes(ownShort)) {
          logToFile(`[MENSAGENS] Ignorada: mensagem do próprio chip (JID: ${jid}, OwnPhone: ${ownPhone})`);
          continue;
        }
      }

      logToFile(`[MENSAGENS] Enviando para o handleIncomingMessage: JID ${jid}`);
      await handleIncomingMessage(sessionId, msg);
    }
  });
}


export async function stopSession(sessionId: string) {
  const sock = activeSockets.get(sessionId);
  if (sock) {
    try {
      await sock.logout();
    } catch (_) { /* ignora erro de logout */ }
    try {
      sock.end(undefined);
    } catch (_) { /* ignora */ }
    activeSockets.delete(sessionId);
  }

  waManager.setSession(sessionId, {
    id: sessionId,
    label: waManager.getSession(sessionId)?.label ?? sessionId,
    status: "DISCONNECTED",
  });
  waManager.removeSession(sessionId);

  // Limpa arquivos de auth
  const authDir = getAuthDir(sessionId);
  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
  }

  await prisma.whatsAppSession
    .delete({ where: { id: sessionId } })
    .catch(() => {});

  console.log(`[WA] 🗑️ Sessão removida: ${sessionId}`);
}

export function getActiveSocket(sessionId: string) {
  return activeSockets.get(sessionId);
}

/** Recarrega sessões persistidas ao iniciar o servidor */
export async function restorePersistedSessions() {
  const sessions = await prisma.whatsAppSession.findMany({
    where: { status: { in: ["CONNECTED", "CONNECTING"] } },
  });
  for (const s of sessions) {
    console.log(`[WA] Restaurando sessão: ${s.id} (${s.label})`);
    startSession(s.id, s.label).catch(console.error);
  }
}
