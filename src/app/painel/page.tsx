"use client";

import { useState, useEffect } from "react";
import { 
  LucideLayoutDashboard, LucideKey, LucideDownload, LucideCalendar, 
  LucideUser, LucideLogOut, LucideRocket, LucideShieldCheck, 
  LucidePlusCircle, LucideRefreshCcw, LucideMessageSquare, 
  LucideSend, LucidePlus, LucideChevronRight, LucideActivity
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'painel' | 'licencas' | 'suporte'>('painel');
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);
  
  // Estados do Help Desk
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  
  // Chat do Cliente
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");

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
    } catch (err) {
      console.error("Erro ao buscar tickets:", err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // No futuro, buscar dados reais do cliente logado
        // Por enquanto simulamos os dados do cliente, mas os TICKETS são reais
        setCustomerData({
          id: "cust_123",
          name: "Cliente Nexus",
          email: "teste@nexus.com",
          licenseKey: "NX360-A1B2-C3D4-E5F6",
          plan: "Nexus 360 Trimestral",
          expiresAt: "2026-08-15",
          status: "ACTIVE",
          activeChips: 6
        });
        await fetchTickets();
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/vendas");
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newTicketSubject,
          message: newTicketMessage
        })
      });

      if (res.ok) {
        await fetchTickets();
        setShowNewTicketModal(false);
        setNewTicketSubject("");
        setNewTicketMessage("");
      }
    } catch (err) {
      console.error("Erro ao criar ticket:", err);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage || !selectedTicket) return;
    
    try {
      const res = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: replyMessage
        })
      });

      if (res.ok) {
        setReplyMessage("");
        fetchTickets();
      }
    } catch (err) {
      console.error("Erro ao responder:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin text-blue-500">
          <LucideRocket size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR CLIENTE */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0c] border-r border-white/5 p-6 hidden lg:flex flex-col z-50 shadow-2xl">
        <div className="mb-12 flex items-center gap-2">
          <img src="/xnexus.png" alt="Nexus 360" className="h-8 w-auto object-contain" />
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('painel')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'painel' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <LucideLayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('licencas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'licencas' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <LucideKey size={18} /> Minhas Licenças
          </button>
          <button 
            onClick={() => setActiveTab('suporte')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'suporte' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <LucideMessageSquare size={18} /> Help Desk
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500/70 hover:bg-rose-500/10 text-xs font-black uppercase tracking-widest transition-all"
        >
          <LucideLogOut size={18} /> Sair
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 p-8 md:p-12 min-h-screen relative overflow-hidden">
        
        {/* BACKGROUND GLOW */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="relative z-10 flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              {activeTab === 'painel' ? 'Visão Geral' : activeTab === 'licencas' ? 'Minhas Licenças' : 'Central de Suporte'}
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
              {activeTab === 'painel' ? `Olá! Bem-vindo de volta.` : 'Gerencie sua operação e suporte.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{customerData.name}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{customerData.email}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-xl">
               <LucideUser size={24} />
             </div>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO */}
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'painel' && (
            <>
              {/* CARDS DE STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-panel p-8 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <LucideShieldCheck size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assinatura</span>
                  </div>
                  <div className="text-2xl font-black uppercase text-emerald-400 tracking-tighter">ATIVA</div>
                  <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{customerData.plan}</p>
                </div>

                <div className="glass-panel p-8 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <LucideCalendar size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expira em</span>
                  </div>
                  <div className="text-2xl font-black uppercase tracking-tighter">{new Date(customerData.expiresAt).toLocaleDateString("pt-BR")}</div>
                  <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Renovação automática ativa</p>
                </div>

                <div className="glass-panel p-8 rounded-[2rem] border border-blue-600/10 bg-blue-600/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                      <LucideDownload size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Software</span>
                  </div>
                  <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
                    Baixar v1.0 Desktop
                  </button>
                </div>
              </div>

              {/* AÇÕES DE GESTÃO (RENOVAR / COMPRAR) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-blue-500/20 transition-all">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                    <LucideRefreshCcw size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Renovar Minha Licença</h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                      Mantenha sua operação rodando sem interrupções. Renove agora reaproveitando todos os seus dados.
                    </p>
                    <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Renovar via PIX
                    </button>
                  </div>
                </div>

                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-blue-500/20 transition-all">
                  <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                    <LucidePlusCircle size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Adicionar Novo Chip</h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                      Precisa de mais escala? Adquira licenças adicionais para rodar em outras máquinas ou instâncias.
                    </p>
                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
                      Expandir Escala
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'suporte' && (
            <div className="max-w-4xl mx-auto h-[70vh] flex flex-col glass-panel rounded-[2.5rem] border border-white/5 overflow-hidden">
              {!selectedTicket ? (
                <>
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-600 rounded-full" />
                      Seus Chamados
                    </h2>
                    <button 
                      onClick={() => setShowNewTicketModal(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                    >
                      <LucidePlus size={16} /> Abrir Novo Chamado
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-white/[0.01]">
                    {tickets.length === 0 ? (
                      <div className="p-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
                        Você ainda não abriu nenhum chamado.
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <div 
                          key={ticket.id} 
                          onClick={() => setSelectedTicket(ticket)}
                          className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400' : ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/5' : 'bg-slate-500/10 text-slate-500'}`}>
                                <LucideMessageSquare size={20} />
                              </div>
                              <div>
                                <h4 className="font-black text-sm uppercase tracking-tight">{ticket.subject}</h4>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Atualizado: {formatDate(ticket.updatedAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${ticket.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' : ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'}`}>
                                {ticket.status === 'OPEN' ? 'Aguardando Resposta' : ticket.status === 'IN_PROGRESS' ? 'Respondido' : 'Finalizado'}
                              </span>
                              <LucideChevronRight size={20} className="text-slate-700 group-hover:text-white transition-all" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full relative">
                  {/* CABEÇALHO DO CHAT */}
                  <header className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02]">
                    <div>
                      <button onClick={() => setSelectedTicket(null)} className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1 transition-all">
                        ← Voltar aos chamados
                      </button>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-white/90">{selectedTicket.subject}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">ID: #{selectedTicket.id.toUpperCase()}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${selectedTicket.status === 'OPEN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : selectedTicket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-slate-500 border-transparent'}`}>
                      {selectedTicket.status === 'OPEN' ? 'Aguardando Suporte' : selectedTicket.status === 'IN_PROGRESS' ? 'Aguardando Você' : 'Chamado Finalizado'}
                    </span>
                  </header>

                  {/* MENSAGENS */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                    {selectedTicket.replies?.map((reply: any) => (
                      <div key={reply.id} className={`flex ${!reply.isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl shadow-xl ${!reply.isAdmin ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-[#1a1a1f] border border-white/5 text-slate-200 rounded-tl-sm'}`}>
                          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                          <div className={`text-[8px] font-bold mt-3 flex items-center gap-2 uppercase tracking-widest ${!reply.isAdmin ? 'text-white/60' : 'text-slate-500'}`}>
                            {reply.isAdmin ? 'Suporte Técnico' : 'Você'} 
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" /> 
                            {formatDate(reply.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* INPUT RESPONDER */}
                  <div className={`p-6 md:p-8 border-t border-white/5 bg-white/[0.02] transition-all`}>
                    <div className="relative flex items-center gap-4">
                      <textarea 
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Digite sua resposta detalhada..."
                        rows={2}
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-blue-500/50 transition-all resize-none"
                      />
                      <button 
                        onClick={handleSendReply}
                        disabled={!replyMessage}
                        className="w-14 h-14 shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-blue-600/20"
                      >
                        <LucideSend size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* MODAL NOVO CHAMADO */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowNewTicketModal(false)} />
          <div className="relative glass-panel w-full max-w-xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Abrir Chamado</h3>
            <p className="text-slate-500 text-xs font-medium mb-8 uppercase tracking-widest">Fale diretamente com nossa equipe técnica.</p>
            
            <form onSubmit={handleNewTicket} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assunto / Tópico</label>
                <input 
                  type="text" 
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="Ex: Problema com renovação ou erro de API"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descreva seu problema</label>
                <textarea 
                  required
                  rows={4}
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  placeholder="Dê detalhes para que possamos ajudar mais rápido..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={ticketLoading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
                >
                  {ticketLoading ? <LucideActivity size={16} className="animate-spin" /> : <><LucideSend size={16} /> Enviar Chamado</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(20px);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
