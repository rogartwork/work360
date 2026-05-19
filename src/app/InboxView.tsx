"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  LucideWifi, LucideWifiOff, LucideQrCode, LucidePlus, LucideTrash2,
  LucideSmartphone, LucideSearch, LucideSend, LucideUser, LucideLoader2,
  LucideRefreshCcw, LucideCheckCheck, LucideMessageCircle, LucideX,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface WASession {
  id: string;
  label: string;
  status: "DISCONNECTED" | "CONNECTING" | "QR_PENDING" | "CONNECTED";
  qrCode?: string;
  phoneNumber?: string;
  unreadCount?: number;
}

interface Conversation {
  contactId: string;
  phone: string;
  name: string;
  pushName?: string;
  customerId?: string;
  customerName?: string;
  customerStatus?: string;
  unreadCount: number;
  lastMessage?: { body: string; direction: string; sentAt: string };
}

interface Message {
  id: string;
  direction: "IN" | "OUT";
  type: string;
  body: string | null;
  sentAt: string;
  isRead: boolean;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function statusColor(status: WASession["status"]) {
  switch (status) {
    case "CONNECTED": return "bg-emerald-500";
    case "QR_PENDING": return "bg-amber-400 animate-pulse";
    case "CONNECTING": return "bg-blue-400 animate-pulse";
    default: return "bg-slate-600";
  }
}

function statusLabel(status: WASession["status"]) {
  switch (status) {
    case "CONNECTED": return "Conectado";
    case "QR_PENDING": return "Aguardando QR";
    case "CONNECTING": return "Conectando...";
    default: return "Desconectado";
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function InboxView() {
  const [sessions, setSessions] = useState<WASession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeContact, setActiveContact] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [showNewSession, setShowNewSession] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [qrModal, setQrModal] = useState<WASession | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ── Fetch sessions ──────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/inbox/sessions");
    if (res.ok) setSessions(await res.json());
  }, []);

  // ── Fetch conversations ─────────────────────────────────────────────────────
  const fetchConversations = useCallback(async (sessionId?: string) => {
    const url = sessionId
      ? `/api/inbox/conversations?sessionId=${sessionId}`
      : "/api/inbox/conversations";
    const res = await fetch(url);
    if (res.ok) setConversations(await res.json());
  }, []);

  // ── Fetch messages ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (contactId: string, sessionId?: string) => {
    setLoadingMsg(true);
    const url = sessionId
      ? `/api/inbox/conversations/${contactId}?sessionId=${sessionId}`
      : `/api/inbox/conversations/${contactId}`;
    const res = await fetch(url);
    if (res.ok) setMessages(await res.json());
    setLoadingMsg(false);
  }, []);

  // ── SSE global ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource("/api/inbox/events");
    eventSourceRef.current = es;

    es.addEventListener("session:update", () => fetchSessions());
    es.addEventListener("session:removed", () => {
      fetchSessions();
      setActiveSessionId(null);
    });
    es.addEventListener("message:new", (e: MessageEvent) => {
      const { message } = JSON.parse(e.data);
      // Atualiza mensagens se for da conversa ativa
      if (activeContact?.contactId === message.contactId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          // Proteção contra duplicação de mensagens idênticas enviadas no mesmo momento (ex: concorrência de microtasks)
          const isSimilar = prev.some((m) =>
            m.direction === message.direction &&
            m.body === message.body &&
            Math.abs(new Date(m.sentAt).getTime() - new Date(message.sentAt).getTime()) < 3000
          );
          if (isSimilar) return prev;
          return [...prev, message];
        });
      }
      // Atualiza badge de não lidos
      fetchConversations(activeSessionId ?? undefined);
    });

    return () => es.close();
  }, [fetchSessions, fetchConversations, activeContact, activeSessionId]);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSessions();
    fetchConversations();
  }, [fetchSessions, fetchConversations]);

  useEffect(() => {
    fetchConversations(activeSessionId ?? undefined);
  }, [activeSessionId, fetchConversations]);

  // ── Scroll para baixo ao receber mensagem ───────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Abrir conversa ──────────────────────────────────────────────────────────
  const openConversation = (conv: Conversation) => {
    setActiveContact(conv);
    fetchMessages(conv.contactId, activeSessionId ?? undefined);
    // Remove badge localmente
    setConversations((prev) =>
      prev.map((c) => (c.contactId === conv.contactId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // ── Enviar resposta ─────────────────────────────────────────────────────────
  const sendReply = async () => {
    if (!replyText.trim() || !activeContact || !activeSessionId) return;
    setSending(true);
    try {
      const res = await fetch(
        `/api/inbox/conversations/${activeContact.contactId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: activeSessionId, body: replyText.trim() }),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === saved.id)) return prev;
          // Proteção contra duplicação de mensagens idênticas enviadas no mesmo momento (ex: concorrência de microtasks)
          const isSimilar = prev.some((m) =>
            m.direction === saved.direction &&
            m.body === saved.body &&
            Math.abs(new Date(m.sentAt).getTime() - new Date(saved.sentAt).getTime()) < 3000
          );
          if (isSimilar) return prev;
          return [...prev, saved];
        });
        setReplyText("");
      }
    } finally {
      setSending(false);
    }
  };

  // ── Criar nova sessão ───────────────────────────────────────────────────────
  const createSession = async () => {
    if (!newLabel.trim()) return;
    const res = await fetch("/api/inbox/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    if (res.ok) {
      const s = await res.json();
      setShowNewSession(false);
      setNewLabel("");
      fetchSessions();
      setActiveSessionId(s.id);
      // Abre modal QR logo após criar
      setTimeout(() => {
        setSessions((prev) => {
          const found = prev.find((x) => x.id === s.id);
          if (found) setQrModal(found);
          return prev;
        });
      }, 1500);
    }
  };

  // ── Remover sessão ──────────────────────────────────────────────────────────
  const removeSession = async (id: string) => {
    if (!confirm("Desconectar e remover esta sessão WhatsApp? Esta ação não pode ser desfeita.")) return;
    setRemovingId(id);
    try {
      const res = await fetch(`/api/inbox/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSessions();
        if (activeSessionId === id) setActiveSessionId(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Erro ao remover sessão: ${err?.error ?? "Tente novamente."}`);
        await fetchSessions(); // recarrega para refletir estado real
      }
    } catch (e) {
      alert("Erro de conexão ao tentar remover a sessão.");
    } finally {
      setRemovingId(null);
    }
  };

  // ─── Filtros ────────────────────────────────────────────────────────────────
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // ─── QR Modal — atualiza apenas se já estiver aberto pelo usuário ─────────
  // NÃO reabre automaticamente via SSE. Só atualiza o QR code image e detecta sucesso.
  useEffect(() => {
    if (!qrModal) return;
    const live = sessions.find((s) => s.id === qrModal.id);
    if (!live) return;
    // Só atualiza se o QR mudou ou se conectou com sucesso
    if (live.status !== qrModal.status || live.qrCode !== qrModal.qrCode) {
      setQrModal(live);
    }
  }, [sessions, qrModal?.id]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-white/5 bg-[#0d0d0f]">

      {/* ── COLUNA ESQUERDA: Sessões + Conversas ── */}
      <div className="w-80 shrink-0 flex flex-col border-r border-white/5">

        {/* Sessões WhatsApp */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Conexões WhatsApp
            </p>
            <button
              onClick={() => setShowNewSession(true)}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              title="Nova conexão"
            >
              <LucidePlus size={12} />
            </button>
          </div>

          {/* Nova sessão */}
          {showNewSession && (
            <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createSession()}
                placeholder="Nome da conta..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 outline-none focus:border-emerald-500/40"
              />
              <button
                onClick={createSession}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30 transition-colors"
              >
                OK
              </button>
              <button
                onClick={() => { setShowNewSession(false); setNewLabel(""); }}
                className="w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
              >
                <LucideX size={12} />
              </button>
            </div>
          )}

          {sessions.length === 0 ? (
            <p className="text-[10px] text-slate-600 text-center py-2">
              Nenhuma conexão ainda
            </p>
          ) : (
            <div className="space-y-1.5">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all group ${
                    activeSessionId === s.id
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                  onClick={() => {
                    setActiveSessionId(s.id);
                    if (s.status === "QR_PENDING") setQrModal(s);
                  }}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(s.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-200 truncate">{s.label}</p>
                    <p className="text-[9px] text-slate-600 truncate">
                      {s.phoneNumber ? `+${s.phoneNumber}` : statusLabel(s.status)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {s.status === "QR_PENDING" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setQrModal(s); }}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-amber-400 hover:bg-amber-500/10"
                        title="Ver QR Code"
                      >
                        <LucideQrCode size={11} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSession(s.id); }}
                      disabled={removingId === s.id}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40"
                      title="Remover sessão"
                    >
                      {removingId === s.id
                        ? <LucideLoader2 size={11} className="animate-spin text-rose-400" />
                        : <LucideTrash2 size={11} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Busca de conversas */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Conversas {totalUnread > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px]">
                  {totalUnread}
                </span>
              )}
            </p>
            <button onClick={() => fetchConversations(activeSessionId ?? undefined)} className="text-slate-600 hover:text-slate-400 transition-colors">
              <LucideRefreshCcw size={11} />
            </button>
          </div>
          <div className="relative">
            <LucideSearch size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full bg-white/5 border border-white/5 rounded-lg pl-8 pr-3 py-2 text-[11px] text-slate-300 outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
              <LucideMessageCircle size={32} className="text-slate-800" />
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                {activeSessionId ? "Nenhuma conversa ainda" : "Selecione uma conexão"}
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.contactId}
                onClick={() => openConversation(conv)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-white/[0.03] ${
                  activeContact?.contactId === conv.contactId
                    ? "bg-blue-500/10 border-l-2 border-l-blue-500"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 relative">
                  <LucideUser size={14} className="text-slate-500" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[11px] font-bold truncate ${conv.unreadCount > 0 ? "text-white" : "text-slate-300"}`}>
                      {conv.customerName ?? conv.name}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[9px] text-slate-600 flex-shrink-0">
                        {fmtTime(conv.lastMessage.sentAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 truncate">
                    {conv.lastMessage?.direction === "OUT" && (
                      <LucideCheckCheck size={10} className="inline mr-1 text-blue-400" />
                    )}
                    {conv.lastMessage?.body ?? "Sem mensagens"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ÁREA DE CHAT ── */}
      {activeContact ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header do chat */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4 bg-[#0f0f12]">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <LucideUser size={16} className="text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">
                {activeContact.customerName ?? activeContact.name}
              </p>
              <p className="text-[10px] text-slate-500">
                {activeContact.phone.replace("@s.whatsapp.net", "")}
                {activeContact.customerStatus && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    activeContact.customerStatus === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" :
                    activeContact.customerStatus === "LEAD" ? "bg-amber-500/20 text-amber-400" :
                    "bg-slate-500/20 text-slate-400"
                  }`}>
                    {activeContact.customerStatus}
                  </span>
                )}
              </p>
            </div>
            {activeContact.customerId && (
              <a
                href={`/?crm=${activeContact.customerId}`}
                target="_blank"
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                Ver no CRM →
              </a>
            )}
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {loadingMsg ? (
              <div className="flex items-center justify-center h-full">
                <LucideLoader2 size={24} className="text-slate-600 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <LucideSmartphone size={32} className="text-slate-800" />
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">Nenhuma mensagem</p>
              </div>
            ) : (
              messages
                .filter((msg, index, self) => self.findIndex(m => m.id === msg.id) === index)
                .map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "OUT" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[12px] leading-relaxed ${
                    msg.direction === "OUT"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white/[0.06] text-slate-200 rounded-bl-sm"
                  }`}>
                    <p>{msg.body ?? "[mídia]"}</p>
                    <p className={`text-[9px] mt-1 ${msg.direction === "OUT" ? "text-blue-200/70" : "text-slate-600"} text-right`}>
                      {fmtTime(msg.sentAt)}
                      {msg.direction === "OUT" && (
                        <LucideCheckCheck size={10} className="inline ml-1" />
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input de resposta */}
          <div className="px-6 py-4 border-t border-white/5 bg-[#0f0f12]">
            {!activeSessionId ? (
              <p className="text-center text-[11px] text-slate-600 py-2">
                Selecione uma sessão conectada para responder
              </p>
            ) : (
              <div className="flex gap-3 items-end">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    // Enviar apenas com Ctrl+Enter ou Meta+Enter (Cmd+Enter no Mac)
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  placeholder="Digite a mensagem... (Ctrl+Enter para enviar, Enter para nova linha)"
                  rows={1}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-slate-300 outline-none focus:border-blue-500/40 resize-none transition-colors"
                  style={{ maxHeight: 120 }}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {sending ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideSend size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
            <LucideSmartphone size={32} className="text-slate-700" />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm">Caixa de Entrada WORK360</p>
            <p className="text-[11px] text-slate-600 mt-1">Selecione uma conversa para começar</p>
          </div>
          {sessions.filter((s) => s.status === "CONNECTED").length === 0 && (
            <button
              onClick={() => setShowNewSession(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors"
            >
              <LucidePlus size={14} /> Conectar WhatsApp
            </button>
          )}
        </div>
      )}

      {/* ── MODAL QR CODE ── */}
      {qrModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-[#111114] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-white text-sm">Conectar WhatsApp</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{qrModal.label}</p>
              </div>
              <button onClick={() => setQrModal(null)} className="text-slate-600 hover:text-slate-400 transition-colors">
                <LucideX size={16} />
              </button>
            </div>

            {qrModal.status === "QR_PENDING" && qrModal.qrCode ? (
              <>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-4">
                  <img src={qrModal.qrCode} alt="QR Code WhatsApp" className="w-52 h-52" />
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="text-[11px] text-slate-400">
                    Abra o WhatsApp no celular → <strong>Aparelhos Conectados</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Toque em <strong>Conectar um aparelho</strong> e escaneie o QR
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-amber-400 font-bold">Aguardando leitura...</span>
                  </div>
                </div>
              </>
            ) : qrModal.status === "CONNECTED" ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <LucideWifi size={28} className="text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-bold">Conectado com sucesso!</p>
                <p className="text-[11px] text-slate-500">{qrModal.phoneNumber}</p>
                <button onClick={() => setQrModal(null)} className="mt-2 px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-bold">
                  Fechar
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <LucideLoader2 size={32} className="text-blue-400 animate-spin" />
                <p className="text-[11px] text-slate-400">Inicializando sessão...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
