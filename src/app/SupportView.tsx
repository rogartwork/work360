"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LucideUser, LucideCheckCircle, LucideSend,
  LucideActivity, LucideAlertCircle, LucideRotateCcw,
  LucideAlertOctagon, LucideCheckSquare, LucideChevronDown, LucideChevronUp,
  LucideMessageSquare, LucideClock, LucideHash, LucideArrowLeft
} from "lucide-react";

type SupportFilter = "UNSOLVED" | "OPEN" | "URGENT" | "CLOSED" | "ALL";

interface SupportViewProps {
  currentViewFilter: SupportFilter;
  onFilterChange: (f: SupportFilter) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  resetKey?: number;
}

export default function SupportView({ currentViewFilter, onFilterChange, searchTerm, onSearchChange, resetKey }: SupportViewProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"LIST" | "DETAIL">("LIST");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "updatedAt", direction: "desc" });
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Volta para a lista sempre que o filtro muda via sidebar
  useEffect(() => {
    setViewMode("LIST");
    setSelectedTicket(null);
  }, [resetKey]);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSendReply = async () => {
    if (!replyMessage || !selectedTicket) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, message: replyMessage }),
      });
      if (res.ok) { setReplyMessage(""); fetchTickets(); }
    } catch (err) {
      console.error("Erro ao responder:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, status }),
      });
      if (res.ok) fetchTickets();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  const priorityWeight = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets];
    if (currentViewFilter === "UNSOLVED") result = result.filter(t => t.status !== "CLOSED");
    else if (currentViewFilter === "OPEN") result = result.filter(t => t.status === "OPEN");
    else if (currentViewFilter === "CLOSED") result = result.filter(t => t.status === "CLOSED");
    else if (currentViewFilter === "URGENT") result = result.filter(t => t.priority === "URGENT" && t.status !== "CLOSED");

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.subject.toLowerCase().includes(q) ||
        (t.customer?.name || "").toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === "priority") {
        const valA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
        const valB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      }
      if (sortConfig.key === "updatedAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortConfig.key === "status") {
        return sortConfig.direction === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      }
      return 0;
    });

    return result;
  }, [tickets, searchTerm, currentViewFilter, sortConfig]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin}min`;
    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const formatDateFull = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortConfig.key === col
      ? sortConfig.direction === "asc"
        ? <LucideChevronUp size={10} className="text-indigo-400" />
        : <LucideChevronDown size={10} className="text-indigo-400" />
      : <LucideChevronDown size={10} className="opacity-20" />;

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string }> = {
      OPEN:        { label: "Aberto",   cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
      IN_PROGRESS: { label: "Pendente", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
      CLOSED:      { label: "Resolvido",cls: "bg-white/5 text-slate-500 border-white/10" },
    };
    const s = map[status] ?? { label: status, cls: "bg-white/5 text-slate-500 border-white/10" };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${s.cls}`}>
        {s.label}
      </span>
    );
  };

  const PriorityTag = ({ priority }: { priority: string }) => {
    if (priority === "URGENT") return <span className="flex items-center gap-1 text-[9px] font-black text-rose-400"><LucideAlertCircle size={10} /> Urgente</span>;
    if (priority === "HIGH")   return <span className="text-[9px] font-black text-amber-400">Alta</span>;
    return <span className="text-[9px] font-black text-slate-600">{priority || "—"}</span>;
  };

  // Formata número com zeros à esquerda: 1 → #00001
  const fmtNum = (n: number) => `#${String(n).padStart(5, "0")}`;

  if (loading) return (
    <div className="h-full flex items-center justify-center text-indigo-500">
      <LucideActivity size={32} className="animate-spin" />
    </div>
  );

  // ─── DETAIL VIEW ───────────────────────────────────────────────────────────
  if (viewMode === "DETAIL" && selectedTicket) {
    const replies = selectedTicket.replies ?? [];
    const isClosed = selectedTicket.status === "CLOSED";

    return (
      <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-200">
        {/* ── Barra de topo compacta ── */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <button
            onClick={() => setViewMode("LIST")}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            <LucideArrowLeft size={13} /> Fila
          </button>
          <span className="text-slate-700">·</span>
          <span className="text-[10px] font-black text-slate-400 truncate flex-1">{selectedTicket.subject}</span>
          <StatusBadge status={selectedTicket.status} />
        </div>

        {/* ── Layout principal ── */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">

          {/* ── THREAD ── */}
          <div className="col-span-9 flex flex-col bg-[#0a0a0c] rounded-xl border border-white/5 overflow-hidden min-h-0">

            {/* Cabeçalho da thread */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 bg-white/[0.015] shrink-0">
              <LucideMessageSquare size={14} className="text-indigo-400 shrink-0" />
              <h3 className="text-sm font-black text-white truncate flex-1">{selectedTicket.subject}</h3>
              <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1 shrink-0">
                <LucideHash size={10} />{fmtNum(selectedTicket.ticketNumber)}
              </span>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#050505] custom-scrollbar">
              {replies.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-widest">
                  Nenhuma mensagem ainda.
                </div>
              ) : (
                replies.map((reply: any) => (
                  <div key={reply.id} className={`flex ${reply.isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[72%] rounded-xl px-4 py-3 ${
                      reply.isAdmin
                        ? "bg-indigo-600/15 border border-indigo-500/20 text-indigo-50 rounded-br-sm"
                        : "bg-white/[0.04] border border-white/[0.06] text-slate-200 rounded-bl-sm"
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                          {reply.isAdmin ? "Suporte" : selectedTicket.customer?.name ?? "Cliente"}
                        </span>
                        <span className="text-[8px] text-slate-600 ml-auto">{formatDateFull(reply.createdAt)}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input de resposta */}
            <div className={`px-5 py-3 border-t border-white/5 bg-[#0a0a0c] shrink-0 ${isClosed ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-end gap-3">
                <textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSendReply(); }}
                  placeholder={isClosed ? "Chamado encerrado." : "Responder ao cliente… (Ctrl+Enter para enviar)"}
                  rows={2}
                  className="flex-1 bg-white/[0.03] border border-white/8 rounded-lg px-3 py-2.5 text-xs font-medium outline-none focus:border-indigo-500/40 transition-all resize-none text-slate-200 placeholder:text-slate-700"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage || sendingReply}
                  className="h-10 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0"
                >
                  {sendingReply ? <LucideActivity size={13} className="animate-spin" /> : <LucideSend size={13} />}
                  Enviar
                </button>
              </div>
              <p className="text-[8px] text-slate-700 mt-1.5">Visível para o cliente · Ctrl+Enter para enviar</p>
            </div>
          </div>

          {/* ── PROPRIEDADES ── */}
          <div className="col-span-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar">

            {/* Solicitante */}
            <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3">Solicitante</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <LucideUser size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{selectedTicket.customer?.name ?? "—"}</p>
                  <p className="text-[9px] text-slate-500 truncate">{selectedTicket.customer?.email ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* Detalhes */}
            <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-4 flex flex-col gap-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Detalhes</p>

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Status</span>
                <StatusBadge status={selectedTicket.status} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Prioridade</span>
                <PriorityTag priority={selectedTicket.priority} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Mensagens</span>
                <span className="text-[9px] font-black text-slate-300">{replies.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><LucideClock size={9} /> Aberto</span>
                <span className="text-[9px] font-black text-slate-400">{formatDate(selectedTicket.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">Atualizado</span>
                <span className="text-[9px] font-black text-slate-400">{formatDate(selectedTicket.updatedAt)}</span>
              </div>

              {selectedTicket.category && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Categoria</span>
                  <span className="text-[9px] font-black text-slate-400">{selectedTicket.category}</span>
                </div>
              )}
            </div>

            {/* Alterar Status */}
            <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-4 flex flex-col gap-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Ações</p>

              {/* Botões de status rápido */}
              {!isClosed && (
                <button
                  onClick={() => handleStatusChange(selectedTicket.status === "OPEN" ? "IN_PROGRESS" : "OPEN")}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/8 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  {selectedTicket.status === "OPEN" ? "Marcar como Pendente" : "Marcar como Aberto"}
                </button>
              )}

              {isClosed ? (
                <button
                  onClick={() => handleStatusChange("OPEN")}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/8 text-slate-400 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <LucideRotateCcw size={11} /> Reabrir Chamado
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange("CLOSED")}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15 transition-all flex items-center justify-center gap-1.5"
                >
                  <LucideCheckCircle size={11} /> Marcar Resolvido
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-120px)] animate-in fade-in duration-300 flex flex-col">
      <div className="flex-1 flex flex-col bg-[#0a0a0c] rounded-xl border border-white/5 overflow-hidden shadow-2xl min-h-0">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#0a0a0c] border-b border-white/5">
                <th className="px-4 py-2.5 w-10 text-center">
                  <input type="checkbox" className="rounded border-white/10 bg-transparent scale-90" disabled />
                </th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-600 w-20">ID</th>
                <th
                  className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-600 cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => handleSort("subject")}
                >
                  <div className="flex items-center gap-1">Assunto <SortIcon col="subject" /></div>
                </th>
                <th className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-600 w-40">Solicitante</th>
                <th
                  className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-600 w-28 cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center gap-1">Prio <SortIcon col="priority" /></div>
                </th>
                <th
                  className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-600 w-28 cursor-pointer hover:text-slate-300 transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">Status <SortIcon col="status" /></div>
                </th>
                <th
                  className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-600 w-20 cursor-pointer hover:text-slate-300 transition-colors text-right"
                  onClick={() => handleSort("updatedAt")}
                >
                  <div className="flex items-center justify-end gap-1">Atualiz. <SortIcon col="updatedAt" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest">
                    Nenhum chamado nesta visualização.
                  </td>
                </tr>
              ) : (
                filteredAndSortedTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => { setSelectedTicket(ticket); setViewMode("DETAIL"); }}
                    className={`border-b border-white/[0.03] cursor-pointer transition-colors hover:bg-white/[0.025] group ${ticket.status === "CLOSED" ? "opacity-40" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-center">
                      <input type="checkbox" className="rounded border-white/10 bg-transparent scale-90" onClick={e => e.stopPropagation()} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[9px] font-black text-slate-600 font-mono">{fmtNum(ticket.ticketNumber)}</span>
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{ticket.subject}</p>
                      {ticket.replies?.length > 0 && (
                        <p className="text-[9px] text-slate-600 truncate mt-0.5">
                          {ticket.replies[ticket.replies.length - 1]?.message?.slice(0, 55)}…
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-medium text-slate-400 truncate block">{ticket.customer?.name ?? "—"}</span>
                    </td>
                    <td className="px-3 py-2.5"><PriorityTag priority={ticket.priority} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={ticket.status} /></td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[9px] font-bold text-slate-600">{formatDate(ticket.updatedAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da tabela com contagem */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between bg-white/[0.01] shrink-0">
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
            {filteredAndSortedTickets.length} chamado{filteredAndSortedTickets.length !== 1 ? "s" : ""}
          </span>
          <button onClick={fetchTickets} className="text-[9px] font-black text-slate-700 hover:text-indigo-400 uppercase tracking-widest transition-colors">
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}
