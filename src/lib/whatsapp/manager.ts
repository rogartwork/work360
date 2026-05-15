/**
 * WORK360 — WhatsApp Session Manager
 * Gerencia múltiplas sessões Baileys simultâneas em memória.
 * Cada sessão corresponde a um número de WhatsApp conectado.
 */

import { EventEmitter } from "events";

export type SessionStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "QR_PENDING"
  | "CONNECTED";

export interface SessionInfo {
  id: string;
  label: string;
  status: SessionStatus;
  qrCode?: string;
  phoneNumber?: string;
  lastSeenAt?: Date;
}

class WhatsAppManager extends EventEmitter {
  private sessions: Map<string, SessionInfo> = new Map();

  // Emite evento para todos os listeners (ex: SSE)
  broadcast(event: string, data: unknown) {
    this.emit(event, data);
    this.emit("*", { event, data });
  }

  getSession(id: string): SessionInfo | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  setSession(id: string, info: Partial<SessionInfo> & { id: string }) {
    const existing = this.sessions.get(id) ?? {
      id,
      label: info.label ?? id,
      status: "DISCONNECTED" as SessionStatus,
    };
    const updated: SessionInfo = { ...existing, ...info };
    this.sessions.set(id, updated);
    this.broadcast("session:update", updated);
    return updated;
  }

  removeSession(id: string) {
    this.sessions.delete(id);
    this.broadcast("session:removed", { id });
  }
}

// Singleton — compartilhado por toda a aplicação Next.js
declare global {
  // eslint-disable-next-line no-var
  var __work360_wa_manager: WhatsAppManager | undefined;
}

export const waManager =
  globalThis.__work360_wa_manager ??
  (globalThis.__work360_wa_manager = new WhatsAppManager());
