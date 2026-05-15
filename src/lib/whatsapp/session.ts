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

function getAuthDir(sessionId: string) {
  const dir = path.join(AUTH_DIR, sessionId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Mapa de sockets ativos (em memória, não persiste entre restarts)
const activeSockets: Map<string, ReturnType<typeof makeWASocket>> = new Map();

export async function startSession(sessionId: string, label: string) {
  if (activeSockets.has(sessionId)) {
    console.log(`[WA] Sessão ${sessionId} já ativa.`);
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

  // ── Mensagens recebidas ─────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key?.fromMe) continue; // ignorar msgs enviadas por nós
      await handleIncomingMessage(sessionId, msg);
    }
  });
}

export async function stopSession(sessionId: string) {
  const sock = activeSockets.get(sessionId);
  if (sock) {
    await sock.logout().catch(() => {});
    sock.end(undefined);
    activeSockets.delete(sessionId);
  }

  waManager.setSession(sessionId, {
    id: sessionId,
    label: waManager.getSession(sessionId)?.label ?? sessionId,
    status: "DISCONNECTED",
  });

  // Limpa arquivos de auth
  const authDir = getAuthDir(sessionId);
  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
  }

  await prisma.whatsAppSession
    .update({ where: { id: sessionId }, data: { status: "DISCONNECTED", qrCode: null } })
    .catch(() => {});
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
