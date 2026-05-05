"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  LucideUser, LucideCheckCircle, LucideSend, 
  LucideActivity, LucideAlertCircle, LucideRotateCcw, 
  LucideAlertOctagon, LucideCheckSquare, LucideChevronDown, LucideChevronUp
} from "lucide-react";

type SupportFilter = "UNSOLVED" | "OPEN" | "URGENT" | "CLOSED" | "ALL";

interface SupportViewProps {
  currentViewFilter: SupportFilter;
  onFilterChange: (f: SupportFilter) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
}

export default function SupportView({ currentViewFilter, onFilterChange, searchTerm, onSearchChange }: SupportViewProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [viewMode, setViewMode] = useState<"LIST" | "DETAIL">("LIST");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // List Filters & Sort
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: "asc" | "desc" }>({ key: "updatedAt", direction: "desc" });

  // Detail State
  const [replyMessage, setReplyMessage] = useState("");

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

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    if (!replyMessage || !selectedTicket) return;
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, message: replyMessage })
      });
      if (res.ok) {
        setReplyMessage("");
        fetchTickets();
      }
    } catch (err) {
      console.error("Erro ao responder:", err);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, status })
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  const priorityWeight = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTickets = useMemo(() => {
    let result = tickets;

    // 1. Aplicar Menu Lateral (Views)
    if (currentViewFilter === "UNSOLVED") result = result.filter(t => t.status !== "CLOSED");
    else if (currentViewFilter === "OPEN") result = result.filter(t => t.status === "OPEN");
    else if (currentViewFilter === "CLOSED") result = result.filter(t => t.status === "CLOSED");
    else if (currentViewFilter === "URGENT") result = result.filter(t => t.priority === "URGENT" && t.status !== "CLOSED");

    // 2. Aplicar Busca
    if (searchTerm) {
      result = result.filter(t => 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Aplicar Ordenação
    result = result.sort((a, b) => {
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
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Aberto</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-[9px] font-black uppercase tracking-widest border border-amber-500/20">Pendente</span>;
      case 'CLOSED': return <span className="px-2 py-1 bg-white/5 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest border border-white/5">Resolvido</span>;
      default: return <span className="px-2 py-1 bg-white/5 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-blue-500">
      <LucideActivity size={40} className="animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-120px)] animate-in fade-in duration-300 flex flex-col">

      {viewMode === "LIST" ? (
        /* ======================== VISÃO DE LISTA ======================== */
        <div className="flex-1 flex flex-col bg-[#0a0a0c] rounded-2xl border border-white/5 overflow-hidden shadow-2xl transition-all duration-300 min-h-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="p-4 w-12 text-center text-slate-500"><input type="checkbox" className="rounded border-white/20 bg-transparent" disabled /></th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24">ID</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white" onClick={() => handleSort('subject')}>
                      <div className="flex items-center gap-1">Assunto {sortConfig.key === 'subject' && (sortConfig.direction === 'asc' ? <LucideChevronUp size={12}/> : <LucideChevronDown size={12}/>)}</div>
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-48">Solicitante</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white w-32" onClick={() => handleSort('priority')}>
                      <div className="flex items-center gap-1">Prioridade {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? <LucideChevronUp size={12}/> : <LucideChevronDown size={12}/>)}</div>
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white w-32" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <LucideChevronUp size={12}/> : <LucideChevronDown size={12}/>)}</div>
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white w-40" onClick={() => handleSort('updatedAt')}>
                      <div className="flex items-center gap-1">Atualização {sortConfig.key === 'updatedAt' && (sortConfig.direction === 'asc' ? <LucideChevronUp size={12}/> : <LucideChevronDown size={12}/>)}</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredAndSortedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        Nenhum chamado encontrado nesta visualização.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedTickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        onClick={() => { setSelectedTicket(ticket); setViewMode("DETAIL"); }}
                        className={`border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.02] ${ticket.status === 'CLOSED' ? 'opacity-50' : ''}`}
                      >
                        <td className="p-4 text-center"><input type="checkbox" className="rounded border-white/20 bg-transparent" onClick={(e) => e.stopPropagation()} /></td>
                        <td className="p-4 text-[10px] font-black text-slate-400">#{ticket.id.slice(0,6).toUpperCase()}</td>
                        <td className="p-4 max-w-xs truncate">
                          <span className="font-bold text-white mr-2">{ticket.subject}</span>
                          <span className="text-slate-500 text-xs">{ticket.replies?.[ticket.replies.length - 1]?.message.slice(0, 40)}...</span>
                        </td>
                        <td className="p-4 font-medium text-slate-300 truncate">{ticket.customer?.name || "Cliente"}</td>
                        <td className="p-4">
                          {ticket.priority === 'URGENT' ? <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-400"><LucideAlertCircle size={12}/> Urgente</span> : 
                           ticket.priority === 'HIGH' ? <span className="text-[9px] font-black uppercase text-amber-400">Alta</span> :
                           <span className="text-[9px] font-black uppercase text-slate-400">{ticket.priority}</span>}
                        </td>
                        <td className="p-4">{getStatusBadge(ticket.status)}</td>
                        <td className="p-4 text-[10px] font-bold text-slate-500">{formatDate(ticket.updatedAt).split(" às ")[0]}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
      ) : (
        /* ======================== VISÃO DE DETALHES ======================== */
        selectedTicket && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Thread Principal */}
            <div className="lg:col-span-9 flex flex-col bg-[#0a0a0c] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
              <header className="p-6 border-b border-white/5 flex items-center gap-4 shrink-0 bg-white/[0.02]">
                <button 
                  onClick={() => setViewMode("LIST")}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  ← Fila
                </button>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white">{selectedTicket.subject}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ticket #{selectedTicket.id.toUpperCase()}</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#050505]">
                {selectedTicket.replies?.map((reply: any) => (
                  <div key={reply.id} className={`flex ${reply.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl ${reply.isAdmin ? 'bg-blue-600/10 border border-blue-500/20 text-blue-50 rounded-tr-sm' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                          <LucideUser size={12} />
                        </div>
                        <span className="text-xs font-bold">{reply.isAdmin ? 'Você (Suporte)' : selectedTicket.customer?.name}</span>
                        <span className="text-[9px] font-black text-slate-500 ml-auto">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-6 border-t border-white/5 bg-[#0a0a0c] ${selectedTicket.status === 'CLOSED' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="relative flex flex-col gap-3">
                  <textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={selectedTicket.status === 'CLOSED' ? "Chamado encerrado. Reabra para responder." : "Digite sua resposta detalhada para o cliente..."}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-medium outline-none focus:border-blue-500/50 transition-all resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Visível para o cliente</span>
                    <button 
                      onClick={handleSendReply}
                      disabled={!replyMessage}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl"
                    >
                      <LucideSend size={16} /> Enviar Resposta
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar de Propriedades */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2">
              <div className="bg-[#0a0a0c] rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
                
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Solicitante</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                      <LucideUser size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{selectedTicket.customer?.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{selectedTicket.customer?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-blue-500/50 appearance-none"
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Pendente</option>
                    <option value="CLOSED">Resolvido (Fechado)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prioridade</label>
                  {/* Desativado temporariamente pois não temos endpoint de update de priority pronto, mas fica visual */}
                  <select 
                    disabled
                    value={selectedTicket.priority}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-bold text-white outline-none opacity-50 appearance-none"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Categoria</label>
                  <input type="text" readOnly value={selectedTicket.category} className="w-full bg-transparent border-none text-xs font-bold text-slate-400 p-0" />
                </div>

                <div className="w-full h-px bg-white/5" />

                {selectedTicket.status === 'CLOSED' ? (
                  <button 
                    onClick={() => handleStatusChange('OPEN')}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2"
                  >
                    <LucideRotateCcw size={14} /> Reabrir Chamado
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusChange('CLOSED')}
                    className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <LucideCheckCircle size={14} /> Marcar como Resolvido
                  </button>
                )}

              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
