"use client";

import { useState, useEffect } from "react";
import {
  LucideLayoutDashboard, LucideKey, LucideDownload, LucideCalendar,
  LucideUser, LucideLogOut, LucideRocket, LucideShieldCheck,
  LucidePlusCircle, LucideRefreshCcw, LucideMessageSquare,
  LucideSend, LucidePlus, LucideArrowLeft, LucideActivity,
  LucideHash, LucideCheckCircle, LucideAlertCircle, LucideX
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'painel' | 'licencas' | 'suporte'>('painel');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (selectedTicket) {
          const updated = data.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/customers/me");
        if (res.ok) {
          const data = await res.json();
          setCustomerData({
            name: data.name,
            email: data.email,
            licenseKey: data.licenses?.[0]?.key || "SEM LICENÇA ATIVA",
            plan: data.licenses?.[0]?.plan || "Nenhum Plano",
            expiresAt: data.licenses?.[0]?.expiresAt || new Date().toISOString(),
            status: data.status,
            activeChips: data.licenses?.length || 0
          });
        } else {
          // Se não encontrar dados (ex: Admin sem perfil de cliente), usa mock ou redireciona
          setCustomerData({
            name: "Usuário Nexus", email: "aguardando@dados.com",
            licenseKey: "NX-PENDENTE", plan: "Buscando...",
            expiresAt: new Date().toISOString(), status: "PENDING", activeChips: 0
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados do cliente:", err);
      } finally {
        await fetchTickets();
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/nexus360");
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError("");
    setTicketLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newTicketSubject, message: newTicketMessage })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchTickets();
        setShowNewTicketModal(false);
        setNewTicketSubject("");
        setNewTicketMessage("");
      } else {
        setTicketError(data.error || "Erro ao criar chamado.");
      }
    } catch (err) {
      setTicketError("Erro de conexão. Tente novamente.");
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage || !selectedTicket) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, message: replyMessage })
      });
      if (res.ok) { setReplyMessage(""); fetchTickets(); }
    } catch (err) { console.error(err); }
    finally { setSendingReply(false); }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin}min atrás`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h atrás`;
    return d.toLocaleDateString("pt-BR");
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; cls: string }> = {
      OPEN: { label: "Aguardando Suporte", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
      IN_PROGRESS: { label: "Respondido", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
      CLOSED: { label: "Resolvido", cls: "bg-white/5 text-slate-500 border-white/10" },
    };
    const s = map[status] ?? { label: status, cls: "bg-white/5 text-slate-500 border-white/10" };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${s.cls}`}>{s.label}</span>;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-indigo-400">
      <LucideRocket size={36} className="animate-bounce" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0a0a0c] border-r border-white/5 flex flex-col z-50">
        <div className="p-10 border-b border-white/5">
          <img src="/xnexus.png" alt="Nexus" className="h-16 w-auto object-contain" />
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {([
            { id: 'painel', label: 'Dashboard', icon: LucideLayoutDashboard },
            { id: 'licencas', label: 'Minhas Licenças', icon: LucideKey },
            { id: 'suporte', label: 'Central de Suporte', icon: LucideMessageSquare },
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedTicket(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'
                }`}
            >
              <item.icon size={15} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500/60 hover:bg-rose-500/10 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-all">
            <LucideLogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-60 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">
              {activeTab === 'painel' ? 'Dashboard' : activeTab === 'licencas' ? 'Minhas Licenças' : 'Central de Suporte'}
            </h1>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">
              {activeTab === 'suporte' ? 'Gerencie seus chamados de suporte' : 'Plataforma Nexus 360'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black text-white">{customerData.name}</p>
              <p className="text-[9px] text-slate-600">{customerData.email}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <LucideUser size={16} />
            </div>
          </div>
        </header>

        <div className="p-8">

          {/* ── PAINEL ── */}
          {activeTab === 'painel' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: LucideShieldCheck, label: "Assinatura", value: "ATIVA", valueClass: "text-emerald-400", sub: customerData.plan, bg: "bg-emerald-500/8 border-emerald-500/15" },
                  { icon: LucideCalendar, label: "Expira em", value: new Date(customerData.expiresAt).toLocaleDateString("pt-BR"), valueClass: "text-white", sub: "Renovação automática", bg: "bg-white/[0.03] border-white/5" },
                  { icon: LucideDownload, label: "Software", value: "v1.0 Desktop", valueClass: "text-indigo-400", sub: "Disponível para download", bg: "bg-indigo-500/8 border-indigo-500/15" },
                ].map(c => (
                  <div key={c.label} className={`${c.bg} border rounded-2xl p-6`}>
                    <div className="flex items-center gap-2 mb-4">
                      <c.icon size={16} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{c.label}</span>
                    </div>
                    <p className={`text-xl font-black ${c.valueClass}`}>{c.value}</p>
                    <p className="text-[9px] text-slate-600 mt-1">{c.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: LucideRefreshCcw, title: "Renovar Licença", desc: "Mantenha sua operação ativa. Renove agora sem perder seus dados.", btn: "Renovar via PIX", btnClass: "bg-white/5 hover:bg-white/10 border border-white/10 text-white" },
                  { icon: LucidePlusCircle, title: "Adicionar Chip", desc: "Precisa de mais escala? Adquira licenças adicionais.", btn: "Expandir Escala", btnClass: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20" },
                ].map(c => (
                  <div key={c.title} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                      <c.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black mb-1">{c.title}</h3>
                      <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">{c.desc}</p>
                      <button className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${c.btnClass}`}>{c.btn}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SUPORTE ── */}
          {activeTab === 'suporte' && (
            <div className="animate-in fade-in duration-200">

              {/* DETALHE DO TICKET */}
              {selectedTicket ? (
                <div className="h-[calc(100vh-160px)] flex flex-col">
                  {/* Barra topo com botão voltar bem visível */}
                  <div className="flex items-center gap-3 mb-4 shrink-0">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all"
                    >
                      <LucideArrowLeft size={13} /> Voltar aos Chamados
                    </button>
                    <span className="text-slate-700">·</span>
                    <span className="text-xs font-bold text-slate-400 truncate flex-1">{selectedTicket.subject}</span>
                    <StatusBadge status={selectedTicket.status} />
                  </div>

                  <div className="flex-1 flex flex-col bg-[#0a0a0c] rounded-xl border border-white/5 overflow-hidden min-h-0">
                    {/* Header do ticket */}
                    <div className="px-5 py-3 border-b border-white/5 bg-white/[0.015] flex items-center gap-3 shrink-0">
                      <LucideMessageSquare size={14} className="text-indigo-400" />
                      <h3 className="text-sm font-black text-white truncate flex-1">{selectedTicket.subject}</h3>
                      <span className="text-[9px] font-black text-slate-600 flex items-center gap-1 shrink-0">
                        <LucideHash size={9} />{selectedTicket.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#050505]">
                      {(selectedTicket.replies ?? []).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-700 text-[10px] uppercase tracking-widest">
                          Nenhuma mensagem ainda.
                        </div>
                      ) : (
                        (selectedTicket.replies ?? []).map((reply: any) => (
                          <div key={reply.id} className={`flex ${!reply.isAdmin ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[72%] rounded-xl px-4 py-3 ${!reply.isAdmin
                              ? "bg-indigo-600/20 border border-indigo-500/25 rounded-br-sm"
                              : "bg-white/[0.04] border border-white/[0.06] rounded-bl-sm"
                              }`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  {reply.isAdmin ? "Suporte Técnico" : "Você"}
                                </span>
                                <span className="text-[8px] text-slate-700 ml-auto">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Responder */}
                    {selectedTicket.status !== "CLOSED" ? (
                      <div className="px-5 py-3 border-t border-white/5 bg-[#0a0a0c] shrink-0">
                        <div className="flex items-end gap-3">
                          <textarea
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSendReply(); }}
                            placeholder="Digite sua mensagem… (Ctrl+Enter para enviar)"
                            rows={2}
                            className="flex-1 bg-white/[0.03] border border-white/8 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-indigo-500/40 transition-all resize-none text-slate-200 placeholder:text-slate-700"
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
                      </div>
                    ) : (
                      <div className="px-5 py-3 border-t border-white/5 bg-[#0a0a0c] shrink-0 text-center">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
                          <LucideCheckCircle size={12} className="text-emerald-600" /> Chamado encerrado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* LISTA DE TICKETS */
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-widest text-white">Seus Chamados</h2>
                      <p className="text-[9px] text-slate-600 mt-0.5">{tickets.length} chamado{tickets.length !== 1 ? 's' : ''} no total</p>
                    </div>
                    <button
                      onClick={() => setShowNewTicketModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                    >
                      <LucidePlus size={14} /> Abrir Chamado
                    </button>
                  </div>

                  <div className="bg-[#0a0a0c] rounded-xl border border-white/5 overflow-hidden">
                    {tickets.length === 0 ? (
                      <div className="py-16 flex flex-col items-center gap-3 text-slate-700">
                        <LucideMessageSquare size={32} className="opacity-30" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum chamado aberto ainda</p>
                        <button onClick={() => setShowNewTicketModal(true)} className="text-[9px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest transition-colors">
                          Abrir primeiro chamado →
                        </button>
                      </div>
                    ) : tickets.map((ticket, i) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-white/[0.025] transition-colors group ${i < tickets.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-white/5 text-slate-600'
                          }`}>
                          {ticket.status === 'CLOSED'
                            ? <LucideCheckCircle size={14} />
                            : ticket.status === 'IN_PROGRESS'
                              ? <LucideAlertCircle size={14} />
                              : <LucideMessageSquare size={14} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{ticket.subject}</p>
                          <p className="text-[9px] text-slate-600 mt-0.5">
                            #{ticket.id.slice(0, 6).toUpperCase()} · {formatDate(ticket.updatedAt)}
                            {ticket.replies?.length > 0 && ` · ${ticket.replies.length} mensagem${ticket.replies.length !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── LICENÇAS ── */}
          {activeTab === 'licencas' && (
            <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <LucideKey size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{customerData.plan}</h3>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">{customerData.licenseKey}</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">Ativa</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Expira em", value: new Date(customerData.expiresAt).toLocaleDateString("pt-BR") },
                  { label: "Chips Ativos", value: customerData.activeChips },
                ].map(item => (
                  <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL NOVO CHAMADO */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewTicketModal(false)} />
          <div className="relative bg-[#0d0d10] border border-white/10 w-full max-w-lg rounded-2xl p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Abrir Chamado</h3>
                <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-widest">Fale com nossa equipe técnica</p>
              </div>
              <button onClick={() => setShowNewTicketModal(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                <LucideX size={14} />
              </button>
            </div>

            {ticketError && (
              <div className="mb-4 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] font-bold text-rose-400">
                {ticketError}
              </div>
            )}

            <form onSubmit={handleNewTicket} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Assunto</label>
                <input
                  type="text" required
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  placeholder="Ex: Problema com conexão WhatsApp"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500/40 transition-all text-slate-200 placeholder:text-slate-700"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Descrição</label>
                <textarea
                  required rows={4}
                  value={newTicketMessage}
                  onChange={e => setNewTicketMessage(e.target.value)}
                  placeholder="Descreva o problema com detalhes…"
                  className="w-full bg-white/[0.03] border border-white/8 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500/40 transition-all resize-none text-slate-200 placeholder:text-slate-700"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={ticketLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                  {ticketLoading ? <LucideActivity size={14} className="animate-spin" /> : <><LucideSend size={13} /> Enviar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
