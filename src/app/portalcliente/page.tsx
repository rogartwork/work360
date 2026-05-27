"use client";

import { useState, useEffect } from "react";
import {
  LucideLayoutDashboard, LucideKey, LucideDownload, LucideCalendar,
  LucideUser, LucideLogOut, LucideMonitor, LucideShieldCheck,
  LucidePlusCircle, LucideRefreshCcw, LucideMessageSquare,
  LucideSend, LucidePlus, LucideArrowLeft, LucideActivity,
  LucideHash, LucideCheckCircle, LucideAlertCircle, LucideX,
  LucideHelpCircle, LucideLayers, LucideBrain, LucideUsers, LucideShield, LucideZap,
  LucideCopy, LucideGlobe
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'painel' | 'licencas' | 'suporte' | 'ajuda'>('painel');
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);

  // Nickname de Licenças
  const [editingLicenseId, setEditingLicenseId] = useState<string | null>(null);
  const [tempNickname, setTempNickname] = useState("");
  const [updatingNickname, setUpdatingNickname] = useState(false);

  // Player de Vídeo da Ajuda
  const [selectedVideoIdx, setSelectedVideoIdx] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(25);
  const [videoVolume, setVideoVolume] = useState(75);

  // FAQ Accordion
  const [expandedFaqIdx, setExpandedFaqIdx] = useState<number | null>(null);

  // Estados de Chamados
  const [resolvingTicket, setResolvingTicket] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(false);

  const openProfileModal = () => {
    setProfileName(customerData?.name || "");
    setProfilePassword("");
    setProfileError("");
    setProfileSuccess("");
    setShowProfileModal(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const res = await fetch("/api/customers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, password: profilePassword || undefined })
      });

      const data = await res.json();

      if (res.ok) {
        setCustomerData((prev: any) => ({ ...prev, name: profileName }));
        setProfileSuccess("Perfil atualizado com sucesso!");
        setProfilePassword("");
        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSuccess("");
        }, 1500);
      } else {
        setProfileError(data.error || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      setProfileError("Erro de conexão. Tente novamente.");
    } finally {
      setProfileLoading(false);
    }
  };

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
            phone: data.phone || "Não Cadastrado",
            licenses: data.licenses || [],
            webLicenses: data.webLicenses || [],
            licenseKey: data.licenses?.[0]?.key || data.webLicenses?.[0]?.username || "SEM LICENÇA ATIVA",
            plan: data.licenses?.[0]?.plan || data.webLicenses?.[0]?.plan || "Nenhum Plano",
            expiresAt: data.licenses?.[0]?.expiresAt || data.webLicenses?.[0]?.expiresAt || new Date().toISOString(),
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status,
            activeChips: (data.licenses?.length || 0) + (data.webLicenses?.reduce((acc: number, curr: any) => acc + (curr.maxSessions || 0), 0) || 0)
          });
        } else {
          if (res.status === 401) {
            window.location.href = "/portalcliente/login";
            return;
          }
          // Se não encontrar dados (ex: Admin sem perfil de cliente), usa mock
          setCustomerData({
            name: "Usuário Nexus", email: "aguardando@dados.com",
            licenses: [{ key: "NX-PENDENTE", plan: "PRO", expiresAt: new Date().toISOString() }],
            webLicenses: [],
            licenseKey: "NX-PENDENTE", plan: "Buscando...",
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            status: "PENDING", activeChips: 0
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
    window.location.href = "/portalcliente/login";
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

  const handleResolveTicket = async () => {
    if (!selectedTicket || resolvingTicket) return;
    if (!confirm("Tem certeza que deseja marcar este chamado como resolvido e encerrado?")) return;

    setResolvingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, status: "CLOSED" })
      });
      if (res.ok) {
        await fetchTickets();
      } else {
        alert("Erro ao marcar chamado como resolvido.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    } finally {
      setResolvingTicket(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket || deletingTicket) return;
    if (!confirm("Tem certeza absoluta que deseja excluir este chamado? Esta ação é irreversível e apagará todas as mensagens vinculadas a ele permanentemente.")) return;

    setDeletingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id })
      });
      if (res.ok) {
        setSelectedTicket(null);
        await fetchTickets();
      } else {
        alert("Erro ao excluir chamado.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    } finally {
      setDeletingTicket(false);
    }
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
      OPEN: { label: "Aguardando Suporte", cls: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20" },
      IN_PROGRESS: { label: "Respondido", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
      CLOSED: { label: "Resolvido", cls: "bg-white/5 text-slate-500 border-white/10" },
    };
    const s = map[status] ?? { label: status, cls: "bg-white/5 text-slate-500 border-white/10" };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-widest border ${s.cls}`}>{s.label}</span>;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1e2128] flex items-center justify-center text-[#38bdf8]">
      <LucideMonitor size={36} className="animate-bounce" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1e2128] text-[#eaeff5] font-sans selection:bg-[#38bdf8]/30">

      {/* ISOLATED NEUMORPHISM STYLES */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
           --bg-nm: #1e2128;
           --fg-nm: #eaeff5;
           --nm-sec: #94a3b8;
           --nm-primary: #38bdf8;
           --nm-shadow-light: #2b303b;
           --nm-shadow-dark: #0f1115;
        }
        .nm-flat {
           background: var(--bg-nm);
           box-shadow: 8px 8px 16px var(--nm-shadow-dark), -8px -8px 16px var(--nm-shadow-light);
           border-radius: 24px;
           border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .nm-inset {
           background: var(--bg-nm);
           box-shadow: inset 6px 6px 12px var(--nm-shadow-dark), inset -6px -6px 12px var(--nm-shadow-light);
           border-radius: 20px;
           border: 1px solid rgba(255, 255, 255, 0.01);
        }
        .nm-flat-sm {
           background: var(--bg-nm);
           box-shadow: 4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light);
           border-radius: 12px;
           border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .nm-inset-sm {
           background: var(--bg-nm);
           box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
           border-radius: 12px;
           border: 1px solid rgba(255, 255, 255, 0.01);
        }
        .nm-button {
           background: var(--bg-nm);
           box-shadow: 4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light);
           border-radius: 14px;
           transition: all 0.2s ease;
           border: 1px solid rgba(255, 255, 255, 0.02);
           outline: none;
        }
        .nm-button:hover {
           box-shadow: 2px 2px 4px var(--nm-shadow-dark), -2px -2px 4px var(--nm-shadow-light);
           transform: translateY(-1px);
        }
        .nm-button:active {
           box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
           transform: scale(0.98) translateY(0);
        }
      `}} />

      {/* SOFT GLOW */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] right-[5%] w-[45%] h-[45%] bg-[#38bdf8]/3 blur-[130px] rounded-full" />
      </div>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1e2128] border-r border-[#2b303b]/40 flex flex-col z-50">
        <div className="p-8 border-b border-[#2b303b]/40 flex justify-center">
          <img src="/xnexus.png" alt="Nexus" className="h-12 w-auto object-contain" />
        </div>

        <nav className="flex-1 p-4 space-y-4 mt-6">
          {([
            { id: 'painel', label: 'Dashboard', icon: LucideLayoutDashboard },
            { id: 'suporte', label: 'Central de Suporte', icon: LucideMessageSquare },
            { id: 'ajuda', label: 'Ajuda / Manual', icon: LucideHelpCircle },
          ] as const).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedTicket(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-mono text-[9px] font-black uppercase tracking-widest transition-all ${isActive
                  ? 'nm-inset text-[#38bdf8]'
                  : 'text-[#94a3b8] hover:text-[#eaeff5] nm-button'
                  }`}
              >
                <item.icon size={14} className={isActive ? "text-[#38bdf8]" : "text-[#94a3b8]"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2b303b]/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-400 hover:text-rose-500 font-mono text-[9px] font-black uppercase tracking-widest transition-all nm-button"
          >
            <LucideLogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-64 min-h-screen relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#1e2128]/85 backdrop-blur-md border-b border-[#2b303b]/30 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-mono font-black uppercase tracking-[0.2em] text-[#eaeff5]">
              {activeTab === 'painel'
                ? 'Dashboard'
                : activeTab === 'ajuda'
                  ? 'Manual de Operações'
                  : 'Central de Suporte'}
            </h1>
            <p className="text-[9px] text-[#94a3b8] font-mono uppercase tracking-widest mt-0.5">
              {activeTab === 'ajuda'
                ? 'NEXUS 360 — Protocolos de Elite & Segurança'
                : activeTab === 'suporte'
                  ? 'Gerencie seus chamados de suporte'
                  : 'Plataforma Nexus 360'}
            </p>
          </div>
          <div className="flex items-center gap-4 cursor-pointer group" onClick={openProfileModal}>
            <div className="text-right">
              {/* AJUSTE AQUI O TAMANHO DA FONTE MANUALMENTE (Ex: text-[24px], text-2xl, text-[28px]) */}
              <p className="text-[24px] font-mono font-black text-[#eaeff5] group-hover:text-[#38bdf8] transition-colors">{customerData.name}</p>
              <p className="text-[12px] text-[#94a3b8] font-mono leading-none">{customerData.email}</p>
              {customerData.createdAt && (
                <p className="text-[8px] text-[#94a3b8]/50 font-mono uppercase tracking-widest mt-1">
                  Conta criada em: {new Date(customerData.createdAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
            <div className="w-10 h-10 nm-flat flex items-center justify-center text-[#38bdf8] group-hover:scale-105 transition-transform shrink-0">
              <LucideUser size={16} />
            </div>
          </div>
        </header>

        <div className="p-8">

          {/* ── PAINEL ── */}
          {activeTab === 'painel' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Vertical Stack: Minhas Licenças, Software Nexus, Renovar Licença */}
              <div className="space-y-6 max-w-4xl">
                {/* Unified Subscription & Expiration */}
                <div className="nm-flat p-6 flex flex-col justify-between border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <LucideShieldCheck size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#94a3b8]">MINHA LICENÇAS</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 nm-inset rounded-lg">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[8px] font-mono font-black text-emerald-400 uppercase tracking-widest">ATIVA</span>
                                     <div className="space-y-4">
                    <div>
                      <p className="text-[8px] text-[#94a3b8]/60 font-mono uppercase tracking-widest">Plano Contratado</p>
                      <p className="text-sm font-black text-[#eaeff5] tracking-tight">
                        {customerData.licenses?.length > 0 && `${customerData.licenses.length}x Desktop`}
                        {customerData.licenses?.length > 0 && customerData.webLicenses?.length > 0 && " · "}
                        {customerData.webLicenses?.length > 0 && `${customerData.webLicenses.length}x Web`}
                        {(!customerData.licenses || customerData.licenses.length === 0) && (!customerData.webLicenses || customerData.webLicenses.length === 0) && "Nenhum Plano"}
                      </p>
                    </div>

                    {/* Grandiose Desktop License Box(es) */}
                    {(customerData.licenses && customerData.licenses.length > 0) && (
                      <div className="space-y-2 border-b border-[#2b303b]/20 pb-4 mb-4">
                        <p className="text-[8px] text-[#94a3b8]/60 font-mono uppercase tracking-widest">
                          Chaves de Acesso Desktop Ativas
                        </p>
                        <div className="space-y-4">
                          {customerData.licenses.map((license: any, idx: number) => {
                            const isCopied = copiedKeyIndex === idx;
                            return (
                              <div key={license.id || idx} className="space-y-1.5 group/copy">
                                <div className="flex justify-between items-center px-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[7.5px] text-[#94a3b8]/50 font-mono uppercase tracking-widest">Licença #{idx + 1}</span>
                                    {editingLicenseId === license.id ? (
                                      <div className="flex items-center gap-1.5 ml-1.5">
                                        <input
                                          type="text"
                                          value={tempNickname}
                                          onChange={(e) => setTempNickname(e.target.value)}
                                          className="bg-[#191b20] border border-[#38bdf8]/30 rounded-lg px-2 py-0.5 text-[8px] font-mono text-[#eaeff5] w-28 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/20 transition-all font-semibold"
                                          placeholder="Apelido..."
                                          maxLength={20}
                                          autoFocus
                                          onClick={(e) => e.stopPropagation()}
                                          onKeyDown={async (e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              if (updatingNickname) return;
                                              setUpdatingNickname(true);
                                              try {
                                                const res = await fetch(`/api/customers/licenses/${license.id}`, {
                                                  method: "PUT",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ label: tempNickname })
                                                });
                                                if (res.ok) {
                                                  setCustomerData((prev: any) => {
                                                    const updatedLicenses = prev.licenses.map((l: any) =>
                                                      l.id === license.id ? { ...l, label: tempNickname } : l
                                                    );
                                                    return { ...prev, licenses: updatedLicenses };
                                                  });
                                                  setEditingLicenseId(null);
                                                }
                                              } catch (err) {
                                                console.error(err);
                                              } finally {
                                                setUpdatingNickname(false);
                                              }
                                            } else if (e.key === 'Escape') {
                                              setEditingLicenseId(null);
                                            }
                                          }}
                                        />
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (updatingNickname) return;
                                            setUpdatingNickname(true);
                                            try {
                                              const res = await fetch(`/api/customers/licenses/${license.id}`, {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ label: tempNickname })
                                              });
                                              if (res.ok) {
                                                setCustomerData((prev: any) => {
                                                  const updatedLicenses = prev.licenses.map((l: any) =>
                                                    l.id === license.id ? { ...l, label: tempNickname } : l
                                                  );
                                                  return { ...prev, licenses: updatedLicenses };
                                                });
                                                setEditingLicenseId(null);
                                              }
                                            } catch (err) {
                                              console.error(err);
                                            } finally {
                                              setUpdatingNickname(false);
                                            }
                                          }}
                                          className="text-emerald-400 hover:text-emerald-300 text-[8px] font-black uppercase font-mono tracking-widest ml-0.5"
                                        >
                                          [OK]
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditingLicenseId(null); }}
                                          className="text-rose-400 hover:text-rose-300 text-[8px] font-black uppercase font-mono tracking-widest"
                                        >
                                          [X]
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 ml-1.5">
                                        {license.label && (
                                          <span className="text-[7.5px] text-[#38bdf8] font-mono font-bold uppercase tracking-widest bg-[#38bdf8]/5 px-1.5 py-0.5 border border-[#38bdf8]/10 rounded-md">
                                            {license.label}
                                          </span>
                                        )}
                                        {license.id && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingLicenseId(license.id);
                                              setTempNickname(license.label || "");
                                            }}
                                            className="opacity-40 hover:opacity-100 text-[#94a3b8] hover:text-[#38bdf8] transition-all ml-0.5"
                                            title="Editar Apelido"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[7.5px] text-[#94a3b8]/60 font-mono uppercase tracking-widest">
                                    Expira: <span className="text-indigo-400 font-bold">{new Date(license.expiresAt || customerData.expiresAt).toLocaleDateString("pt-BR")}</span>
                                  </span>
                                </div>

                                <div className="relative">
                                  <div className={`absolute inset-0 -m-1 rounded-3xl blur-md transition-all duration-500 pointer-events-none opacity-40 ${isCopied
                                    ? "bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-none"
                                    : "bg-[#38bdf8]/5 shadow-[0_0_15px_rgba(56,189,248,0.03)] animate-pulse group-hover/copy:animate-none group-hover/copy:bg-[#38bdf8]/10"
                                    }`} />

                                  <div
                                    onClick={() => {
                                      if (license.key) {
                                        navigator.clipboard.writeText(license.key);
                                        setCopiedKeyIndex(idx);
                                        setTimeout(() => setCopiedKeyIndex(null), 2000);
                                      }
                                    }}
                                    className={`relative z-10 flex items-center justify-between gap-4 px-4 py-3 nm-inset rounded-2xl cursor-pointer hover:text-[#38bdf8] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border overflow-hidden ${isCopied
                                      ? "border-emerald-500/30 bg-gradient-to-r from-[#1e2128] via-emerald-500/8 to-[#1e2128]"
                                      : "border-[#2b303b]/40 hover:border-[#38bdf8]/30 bg-gradient-to-r from-[#1e2128] via-[#38bdf8]/2 to-[#1e2128]"
                                      }`}
                                    title="Clique para copiar a chave"
                                  >
                                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
                                      <div className="w-16 h-full bg-gradient-to-r from-transparent via-[#38bdf8]/15 to-transparent -skew-x-20 absolute -left-20 transition-all duration-1000 ease-out group-hover/copy:translate-x-[600px] pointer-events-none" />
                                    </div>

                                    <span className="relative z-10 text-xs md:text-sm font-mono font-black tracking-widest text-[#eaeff5] group-hover/copy:text-[#38bdf8] group-hover/copy:drop-shadow-[0_0_6px_rgba(56,189,248,0.5)] transition-all uppercase select-all">
                                      {isCopied ? "COPIADA COM SUCESSO!" : (license.key || "NX-PENDENTE")}
                                    </span>

                                    <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 nm-button rounded-xl text-[8px] font-mono font-black uppercase tracking-widest shrink-0 transition-all text-[#94a3b8] group-hover/copy:text-[#38bdf8] group-hover/copy:nm-flat">
                                      {isCopied ? (
                                        <span className="text-emerald-400">COPIADO</span>
                                      ) : (
                                        <>
                                          <LucideCopy size={10} className="text-[#94a3b8]/60 group-hover/copy:text-[#38bdf8] transition-colors shrink-0" />
                                          COPIAR
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Grandiose Web License Box(es) */}
                    {(customerData.webLicenses && customerData.webLicenses.length > 0) && (
                      <div className="space-y-2">
                        <p className="text-[8px] text-[#94a3b8]/60 font-mono uppercase tracking-widest">
                          Painéis de Acesso Web Ativos
                        </p>
                        <div className="space-y-4">
                          {customerData.webLicenses.map((license: any, idx: number) => {
                            const webCopiedIdx = 2000 + idx;
                            const isCopied = copiedKeyIndex === webCopiedIdx;
                            return (
                              <div key={license.id || idx} className="space-y-1.5 group/copy bg-emerald-500/[0.01] p-3 rounded-2xl border border-emerald-500/5 hover:border-emerald-500/10 transition-all">
                                <div className="flex justify-between items-center px-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[7.5px] text-[#94a3b8]/50 font-mono uppercase tracking-widest">Instância Web #{idx + 1}</span>
                                    <span className="text-[7.5px] text-emerald-400 font-mono font-bold uppercase tracking-widest bg-emerald-500/5 px-1.5 py-0.5 border border-emerald-500/10 rounded-md">
                                      {license.plan || "PREMIUM"}
                                    </span>
                                  </div>
                                  <span className="text-[7.5px] text-[#94a3b8]/60 font-mono uppercase tracking-widest">
                                    Expira: <span className="text-indigo-400 font-bold">{new Date(license.expiresAt || customerData.expiresAt).toLocaleDateString("pt-BR")}</span>
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-[9px] font-mono">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[#94a3b8]/40 uppercase tracking-widest text-[7.5px]">Usuário</span>
                                    <div
                                      onClick={() => {
                                        navigator.clipboard.writeText(license.username);
                                        setCopiedKeyIndex(webCopiedIdx);
                                        setTimeout(() => setCopiedKeyIndex(null), 2000);
                                      }}
                                      className="nm-inset px-2.5 py-2 cursor-pointer rounded-xl flex items-center justify-between text-[#eaeff5] hover:text-[#38bdf8] transition-all"
                                    >
                                      <span className="truncate mr-1 font-bold">{isCopied ? "COPIADO!" : license.username}</span>
                                      <LucideCopy size={9} className="opacity-50 shrink-0" />
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[#94a3b8]/40 uppercase tracking-widest text-[7.5px]">Senha</span>
                                    <div
                                      onClick={() => {
                                        navigator.clipboard.writeText(license.password);
                                        setCopiedKeyIndex(webCopiedIdx + 100);
                                        setTimeout(() => setCopiedKeyIndex(null), 2000);
                                      }}
                                      className="nm-inset px-2.5 py-2 cursor-pointer rounded-xl flex items-center justify-between text-[#eaeff5] hover:text-[#38bdf8] transition-all"
                                    >
                                      <span className="truncate mr-1 font-bold">{copiedKeyIndex === (webCopiedIdx + 100) ? "COPIADO!" : license.password}</span>
                                      <LucideCopy size={9} className="opacity-50 shrink-0" />
                                    </div>
                                  </div>
                                </div>

                                <a
                                  href="/nexus360"
                                  className="mt-2 w-full py-2 nm-button text-[#38bdf8] hover:text-[#eaeff5] text-[7.5px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all rounded-xl border border-[#38bdf8]/10"
                                >
                                  <LucideGlobe size={10} /> Entrar no Painel Web
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(!customerData.licenses || customerData.licenses.length === 0) && (!customerData.webLicenses || customerData.webLicenses.length === 0) && (
                      <div className="py-4 text-center nm-inset rounded-2xl border border-white/5">
                        <p className="text-[9px] text-[#94a3b8]/40 font-mono uppercase tracking-widest">Nenhuma licença vinculada a esta conta</p>
                      </div>
                    )}    </div>
                    </div>
                  </div>
                </div>

                {/* Software Nexus Card */}
                <div className="nm-flat p-6 flex flex-col justify-between border border-[#38bdf8]/10 hover:border-[#38bdf8]/30 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <LucideDownload size={14} className="text-[#38bdf8] group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#94a3b8]">Software Nexus</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]/20 group-hover:bg-[#38bdf8] transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[8px] text-[#94a3b8]/60 font-mono uppercase tracking-widest">Build Estável</p>
                      <p className="text-2xl font-black tracking-tight text-[#38bdf8]">v3.1.3 Stable</p>
                      <p className="text-[9px] text-[#94a3b8]/60 mt-1 font-mono uppercase tracking-widest">Disponível para Windows 10/11</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Download iniciado! Verifique a barra de downloads.')}
                    className="mt-3 w-full py-3 nm-button text-[#38bdf8] hover:text-[#eaeff5] text-[8px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl"
                  >
                    <LucideDownload size={10} /> Baixar Executável
                  </button>
                </div>

                {/* Action Operations Cards */}
                <div className="nm-flat p-8 flex gap-6 items-start border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/20 group">
                  <div className="w-14 h-14 nm-inset flex items-center justify-center text-[#38bdf8] shrink-0 rounded-2xl">
                    <LucideRefreshCcw size={22} className="group-hover:scale-115 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-mono font-black uppercase text-[#eaeff5] mb-2 tracking-widest">Renovar Licença</h3>
                    <p className="text-[10px] text-[#94a3b8] mb-5 leading-relaxed font-semibold font-mono uppercase tracking-tight">
                      Mantenha sua operação de disparos e orquestração ativa. Renove agora sem perder seus logs de envio e histórico.
                    </p>
                    <button className="px-6 py-3.5 nm-button text-[9px] font-mono font-black uppercase tracking-widest transition-all text-[#eaeff5] hover:text-amber-400">
                      Renovar via PIX
                    </button>
                  </div>
                </div>

                {/* Histórico Financeiro & Faturas Card */}
                <div className="nm-flat p-6 flex flex-col justify-between border border-[#38bdf8]/5 hover:border-[#38bdf8]/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <LucideCalendar size={14} className="text-[#38bdf8]" />
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#94a3b8]">Histórico Financeiro & Faturas</span>
                    </div>
                    <span className="text-[8px] font-mono font-black text-[#94a3b8]/50 uppercase tracking-widest">Últimas Faturas</span>
                  </div>

                  <div className="space-y-3.5">
                    {!customerData?.subscriptions || customerData.subscriptions.length === 0 ? (
                      <div className="py-4 text-center nm-inset rounded-2xl border border-[#2b303b]/20">
                        <p className="text-[9px] text-[#94a3b8]/40 font-mono uppercase tracking-widest">Nenhuma fatura registrada nesta conta</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customerData.subscriptions.map((sub: any, idx: number) => {
                          const statusMap: Record<string, { label: string; cls: string }> = {
                            PAID: { label: "PAGO", cls: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
                            PENDING: { label: "PENDENTE", cls: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
                            EXPIRED: { label: "EXPIRADO", cls: "text-rose-400 bg-rose-500/5 border-rose-500/10" },
                            CANCELED: { label: "CANCELADO", cls: "text-[#94a3b8]/40 bg-white/5 border-white/5" },
                          };
                          const st = statusMap[sub.status] || { label: sub.status, cls: "text-[#94a3b8]/40 bg-white/5 border-white/5" };
                          return (
                            <div key={sub.id || idx} className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 nm-inset rounded-2xl border border-[#2b303b]/20 hover:border-[#38bdf8]/10 transition-all duration-300">
                              <div className="flex items-center gap-3">
                                <div className="text-left">
                                  <p className="text-[9px] font-mono font-black text-[#eaeff5] leading-tight">Fatura #{sub.id?.slice(-6).toUpperCase() || idx + 1}</p>
                                  <p className="text-[8px] text-[#94a3b8]/50 font-mono mt-0.5">
                                    Vencimento: {new Date(sub.expiresAt).toLocaleDateString("pt-BR")} {sub.paidAt && `· Pago em: ${new Date(sub.paidAt).toLocaleDateString("pt-BR")}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between md:justify-end gap-4">
                                <div className="text-right font-mono">
                                  <p className="text-[10px] font-black text-[#eaeff5] leading-none">R$ {sub.amount.toFixed(2)}</p>
                                  <p className="text-[7.5px] text-[#94a3b8]/60 font-black mt-0.5 uppercase tracking-widest">{sub.paymentMethod || "PIX"}</p>
                                </div>
                                <div className={`px-2 py-0.5 rounded border text-[7.5px] font-mono font-black tracking-widest ${st.cls}`}>
                                  {st.label}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUPORTE ── */}
          {activeTab === 'suporte' && (
            <div className="animate-in fade-in duration-200">

              {/* DETALHE DO TICKET */}
              {selectedTicket ? (
                <div className="h-[calc(100vh-180px)] flex flex-col">
                  {/* Barra topo com botão voltar */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="flex items-center gap-2 px-4 py-2.5 nm-button text-[#eaeff5] hover:text-[#38bdf8] text-[9px] font-mono font-black uppercase tracking-widest transition-all"
                    >
                      <LucideArrowLeft size={12} /> Voltar aos Chamados
                    </button>
                    <span className="text-[#94a3b8]/30 hidden sm:inline">|</span>
                    <span className="text-xs font-bold text-[#eaeff5] truncate flex-1 font-mono min-w-[120px]">{selectedTicket.subject}</span>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedTicket.status} />

                      {selectedTicket.status !== "CLOSED" && (
                        <button
                          onClick={handleResolveTicket}
                          disabled={resolvingTicket}
                          className="flex items-center gap-1.5 px-3 py-2 nm-button text-emerald-400 hover:text-emerald-300 disabled:opacity-40 text-[9px] font-mono font-black uppercase tracking-widest transition-all shrink-0"
                          title="Marcar chamado como Resolvido"
                        >
                          <LucideCheckCircle size={11} className={resolvingTicket ? "animate-spin" : ""} /> Chamado Resolvido
                        </button>
                      )}

                      <button
                        onClick={handleDeleteTicket}
                        disabled={deletingTicket}
                        className="flex items-center gap-1.5 px-3 py-2 nm-button text-rose-400 hover:text-rose-300 disabled:opacity-40 text-[9px] font-mono font-black uppercase tracking-widest transition-all shrink-0"
                        title="Excluir chamado e todas as respostas"
                      >
                        <LucideX size={11} className={deletingTicket ? "animate-spin" : ""} /> Excluir
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col nm-flat overflow-hidden min-h-0">
                    {/* Header do ticket */}
                    <div className="px-6 py-4 border-b border-[#2b303b]/40 bg-[#1e2128]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <LucideMessageSquare size={14} className="text-[#38bdf8] shrink-0" />
                        <h3 className="text-xs font-mono font-black uppercase text-[#eaeff5] truncate">{selectedTicket.subject}</h3>
                        <span className="text-[9px] font-mono font-black text-[#94a3b8] flex items-center gap-1 shrink-0">
                          <LucideHash size={9} />{selectedTicket.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2.5 py-1 border border-amber-500/10 rounded-lg text-[8px] font-mono font-black uppercase tracking-widest shrink-0">
                        <LucideAlertCircle size={10} className="animate-pulse" /> Limpeza automática de inativos (30 dias)
                      </div>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#1e2128]/20">
                      {(selectedTicket.replies ?? []).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[#94a3b8] text-[9px] font-mono uppercase tracking-widest">
                          Nenhuma mensagem ainda.
                        </div>
                      ) : (
                        (selectedTicket.replies ?? []).map((reply: any) => (
                          <div key={reply.id} className={`flex ${!reply.isAdmin ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 ${!reply.isAdmin
                              ? "bg-[#38bdf8]/5 border border-[#38bdf8]/15 rounded-tr-sm"
                              : "bg-[#2b303b]/20 border border-[#2b303b]/30 rounded-tl-sm"
                              }`}>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[8px] font-mono font-black uppercase tracking-widest text-[#38bdf8]">
                                  {reply.isAdmin ? "Suporte Técnico" : "Você"}
                                </span>
                                <span className="text-[8px] font-mono text-[#94a3b8]/50 ml-auto">{formatDate(reply.createdAt)}</span>
                              </div>
                              <p className="text-xs text-[#eaeff5]/90 leading-relaxed whitespace-pre-wrap font-medium">{reply.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Responder */}
                    {selectedTicket.status !== "CLOSED" ? (
                      <div className="px-6 py-4 border-t border-[#2b303b]/40 bg-[#1e2128]/50 shrink-0">
                        <div className="flex items-end gap-4">
                          <textarea
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSendReply(); }}
                            placeholder="Digite sua resposta... (Ctrl+Enter para enviar)"
                            rows={2}
                            className="flex-1 nm-inset py-3 px-4 text-xs outline-none text-[#eaeff5] placeholder:text-[#94a3b8]/30 transition-all resize-none font-medium"
                          />
                          <button
                            onClick={handleSendReply}
                            disabled={!replyMessage || sendingReply}
                            className="h-10 px-5 nm-button text-[#eaeff5] hover:text-[#38bdf8] disabled:opacity-40 rounded-xl text-[9px] font-mono font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0"
                          >
                            {sendingReply ? <LucideActivity size={12} className="animate-spin" /> : <LucideSend size={12} />}
                            Enviar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-6 py-4 border-t border-[#2b303b]/40 bg-[#1e2128]/50 shrink-0 text-center">
                        <span className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest flex items-center justify-center gap-2">
                          <LucideCheckCircle size={12} className="text-emerald-500" /> Chamado encerrado e resolvido
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* LISTA DE TICKETS */
                <div>
                  {/* Regra de Exclusão Banner */}
                  <div className="mb-6 p-4 nm-inset border border-amber-500/5 rounded-2xl flex items-center gap-3">
                    <LucideAlertCircle size={16} className="text-amber-400 shrink-0 animate-pulse" />
                    <p className="text-[9px] text-[#94a3b8] font-mono uppercase tracking-widest leading-relaxed">
                      <span className="text-amber-400 font-black">Regra do Portal:</span> Chamados sem respostas ou interação por parte do cliente por mais de 30 dias corridos são excluídos automaticamente.
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xs font-mono font-black uppercase tracking-widest text-[#eaeff5]">Seus Chamados</h2>
                      <p className="text-[9px] text-[#94a3b8] font-mono mt-0.5">{tickets.length} chamado{tickets.length !== 1 ? 's' : ''} no total</p>
                    </div>
                    <button
                      onClick={() => setShowNewTicketModal(true)}
                      className="flex items-center gap-2 px-5 py-3 nm-button text-[#eaeff5] hover:text-[#38bdf8] text-[9px] font-mono font-black uppercase tracking-widest transition-all"
                    >
                      <LucidePlus size={12} /> Abrir Chamado
                    </button>
                  </div>

                  <div className="nm-flat overflow-hidden">
                    {tickets.length === 0 ? (
                      <div className="py-20 flex flex-col items-center gap-4 text-[#94a3b8]">
                        <LucideMessageSquare size={36} className="opacity-20 text-[#38bdf8]" />
                        <p className="text-[9px] font-mono font-black uppercase tracking-widest">Nenhum chamado aberto ainda</p>
                        <button onClick={() => setShowNewTicketModal(true)} className="text-[9px] text-[#38bdf8] hover:underline font-mono font-black uppercase tracking-widest transition-all">
                          Abrir seu primeiro chamado →
                        </button>
                      </div>
                    ) : tickets.map((ticket, i) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`flex items-center gap-4 px-6 py-4.5 cursor-pointer hover:bg-[#38bdf8]/3 transition-all group ${i < tickets.length - 1 ? 'border-b border-[#2b303b]/30' : ''}`}
                      >
                        <div className={`w-9 h-9 nm-inset flex items-center justify-center shrink-0 ${ticket.status === 'OPEN' ? 'text-[#38bdf8]' :
                          ticket.status === 'IN_PROGRESS' ? 'text-amber-400' :
                            'text-[#94a3b8]'
                          }`}>
                          {ticket.status === 'CLOSED'
                            ? <LucideCheckCircle size={14} />
                            : ticket.status === 'IN_PROGRESS'
                              ? <LucideAlertCircle size={14} />
                              : <LucideMessageSquare size={14} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#eaeff5] truncate group-hover:text-[#38bdf8] transition-colors">{ticket.subject}</p>
                          <p className="text-[9px] text-[#94a3b8]/60 mt-0.5 font-mono">
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
            <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
              <div className="nm-flat p-6 border border-[#38bdf8]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#eaeff5]">Gerenciamento de Licenças</h3>
                  <p className="text-[9px] text-[#94a3b8] mt-0.5 uppercase tracking-widest font-mono">Consulte suas chaves de acesso, credenciais web e tempos de expiração</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 px-3 py-1.5 border border-emerald-500/10 rounded-xl text-[8px] font-mono font-black uppercase tracking-widest">
                  <LucideShield size={12} className="animate-pulse" /> Servidores Seguros e Ativos
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desktop Licenses Section */}
                <div className="space-y-4">
                  <h4 className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest px-1">Licenças Desktop (Aplicativo PC)</h4>
                  {(!customerData.licenses || customerData.licenses.length === 0) ? (
                    <div className="nm-inset p-8 text-center text-[#94a3b8]/40 text-[9px] font-mono uppercase tracking-widest">
                      Nenhuma licença Desktop ativa
                    </div>
                  ) : (
                    customerData.licenses.map((lic: any, idx: number) => {
                      const isCopied = copiedKeyIndex === idx;
                      const isEditing = editingLicenseId === lic.id;
                      const expired = lic.expiresAt && new Date(lic.expiresAt) < new Date();
                      
                      return (
                        <div key={lic.id || idx} className="nm-flat p-5 border border-purple-500/5 hover:border-purple-500/20 transition-all duration-300 relative group">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <LucideMonitor size={14} className="text-purple-400" />
                              <span className="text-[8px] font-mono font-black uppercase text-[#94a3b8]">LICENÇA DESKTOP #{idx + 1}</span>
                            </div>
                            <span className={`px-2 py-0.5 border rounded text-[7.5px] font-mono font-black tracking-widest uppercase ${
                              !lic.isActive ? "bg-rose-500/5 text-rose-400 border-rose-500/10" :
                              expired ? "bg-amber-500/5 text-amber-400 border-amber-500/10 animate-pulse" :
                              "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                            }`}>
                              {!lic.isActive ? "INATIVA" : expired ? "EXPIRADA" : "ATIVA"}
                            </span>
                          </div>

                          <div className="space-y-3 font-mono text-[9px]">
                            {/* Nickname / Apelido */}
                            <div className="flex justify-between items-center bg-[#191b20]/40 px-3 py-2 rounded-xl">
                              <span className="text-[#94a3b8]/50 uppercase tracking-widest text-[8px]">Apelido</span>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={tempNickname}
                                    onChange={(e) => setTempNickname(e.target.value)}
                                    className="bg-[#14161a] border border-[#38bdf8]/30 rounded-lg px-2 py-0.5 text-[9px] text-[#eaeff5] w-28 focus:outline-none focus:border-[#38bdf8] transition-all font-semibold"
                                    placeholder="Apelido..."
                                    maxLength={20}
                                    autoFocus
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (updatingNickname) return;
                                        setUpdatingNickname(true);
                                        try {
                                          const res = await fetch(`/api/customers/licenses/${lic.id}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ label: tempNickname })
                                          });
                                          if (res.ok) {
                                            setCustomerData((prev: any) => {
                                              const updated = prev.licenses.map((l: any) =>
                                                l.id === lic.id ? { ...l, label: tempNickname } : l
                                              );
                                              return { ...prev, licenses: updated };
                                            });
                                            setEditingLicenseId(null);
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setUpdatingNickname(false);
                                        }
                                      } else if (e.key === 'Escape') {
                                        setEditingLicenseId(null);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={async () => {
                                      if (updatingNickname) return;
                                      setUpdatingNickname(true);
                                      try {
                                        const res = await fetch(`/api/customers/licenses/${lic.id}`, {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ label: tempNickname })
                                        });
                                        if (res.ok) {
                                          setCustomerData((prev: any) => {
                                            const updated = prev.licenses.map((l: any) =>
                                              l.id === lic.id ? { ...l, label: tempNickname } : l
                                            );
                                            return { ...prev, licenses: updated };
                                          });
                                          setEditingLicenseId(null);
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      } finally {
                                        setUpdatingNickname(false);
                                      }
                                    }}
                                    className="text-emerald-400 text-[8px] font-black uppercase"
                                  >
                                    [OK]
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[#eaeff5] font-black uppercase">{lic.label || "NENHUM APELIDO"}</span>
                                  <button
                                    onClick={() => {
                                      setEditingLicenseId(lic.id);
                                      setTempNickname(lic.label || "");
                                    }}
                                    className="text-[#94a3b8] hover:text-[#38bdf8] transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Chave de acesso */}
                            <div className="flex flex-col gap-1">
                              <span className="text-[#94a3b8]/50 uppercase tracking-widest text-[8px]">Chave de Acesso</span>
                              <div
                                onClick={() => {
                                  if (lic.key) {
                                    navigator.clipboard.writeText(lic.key);
                                    setCopiedKeyIndex(idx);
                                    setTimeout(() => setCopiedKeyIndex(null), 2000);
                                  }
                                }}
                                className="nm-inset px-3 py-2 cursor-pointer rounded-xl flex items-center justify-between text-[#eaeff5] hover:text-[#38bdf8] transition-all"
                              >
                                <span className="font-mono text-[9px] md:text-[10.5px] font-black tracking-wider truncate mr-2 uppercase">
                                  {isCopied ? "COPIADA!" : lic.key}
                                </span>
                                <LucideCopy size={10} className="shrink-0 opacity-60" />
                              </div>
                            </div>

                            {/* Detalhes de Expiração & PC */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div className="bg-[#191b20]/30 px-3 py-2 rounded-xl">
                                <p className="text-[#94a3b8]/40 uppercase tracking-widest text-[7.5px] mb-0.5">Expira em</p>
                                <p className="text-[#eaeff5] font-black font-mono">{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString("pt-BR") : "ILIMITADO"}</p>
                              </div>
                              <div className="bg-[#191b20]/30 px-3 py-2 rounded-xl">
                                <p className="text-[#94a3b8]/40 uppercase tracking-widest text-[7.5px] mb-0.5">Dispositivo</p>
                                <p className="text-[#eaeff5] font-black font-mono truncate uppercase" title={lic.machineId}>
                                  {lic.machineId ? `VINCULADO` : "LIVRE"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Web Licenses Section */}
                <div className="space-y-4">
                  <h4 className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest px-1">Licenças Web (Painel Online)</h4>
                  {(!customerData.webLicenses || customerData.webLicenses.length === 0) ? (
                    <div className="nm-inset p-8 text-center text-[#94a3b8]/40 text-[9px] font-mono uppercase tracking-widest">
                      Nenhuma licença Web ativa
                    </div>
                  ) : (
                    customerData.webLicenses.map((lic: any, idx: number) => {
                      const webCopiedIdx = 1000 + idx;
                      const isCopied = copiedKeyIndex === webCopiedIdx;
                      const expired = lic.expiresAt && new Date(lic.expiresAt) < new Date();
                      
                      return (
                        <div key={lic.id || idx} className="nm-flat p-5 border border-emerald-500/5 hover:border-emerald-500/20 transition-all duration-300 relative group">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <LucideGlobe size={14} className="text-emerald-400" />
                              <span className="text-[8px] font-mono font-black uppercase text-[#94a3b8]">LICENÇA WEB #{idx + 1}</span>
                            </div>
                            <span className={`px-2 py-0.5 border rounded text-[7.5px] font-mono font-black tracking-widest uppercase ${
                              !lic.isActive ? "bg-rose-500/5 text-rose-400 border-rose-500/10" :
                              expired ? "bg-amber-500/5 text-amber-400 border-amber-500/10 animate-pulse" :
                              "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                            }`}>
                              {!lic.isActive ? "INATIVA" : expired ? "EXPIRADA" : "ATIVA"}
                            </span>
                          </div>

                          <div className="space-y-3 font-mono text-[9px]">
                            {/* Nome / Identificador */}
                            <div className="flex justify-between items-center bg-[#191b20]/40 px-3 py-2 rounded-xl">
                              <span className="text-[#94a3b8]/50 uppercase tracking-widest text-[8px]">Plano</span>
                              <span className="text-[#eaeff5] font-black uppercase">{lic.plan || "STANDARD"}</span>
                            </div>

                            {/* Usuário e Senha de Acesso */}
                            <div className="space-y-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-[#94a3b8]/50 uppercase tracking-widest text-[8px]">Usuário (Username)</span>
                                <div
                                  onClick={() => {
                                    navigator.clipboard.writeText(lic.username);
                                    setCopiedKeyIndex(webCopiedIdx);
                                    setTimeout(() => setCopiedKeyIndex(null), 2000);
                                  }}
                                  className="nm-inset px-3 py-2 cursor-pointer rounded-xl flex items-center justify-between text-[#eaeff5] hover:text-[#38bdf8] transition-all"
                                >
                                  <span className="font-mono text-[9.5px] font-black tracking-wider truncate mr-2">
                                    {isCopied ? "COPIADO!" : lic.username}
                                  </span>
                                  <LucideCopy size={10} className="shrink-0 opacity-60" />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <span className="text-[#94a3b8]/50 uppercase tracking-widest text-[8px]">Senha (Password)</span>
                                <div
                                  onClick={() => {
                                    navigator.clipboard.writeText(lic.password);
                                    setCopiedKeyIndex(webCopiedIdx + 500);
                                    setTimeout(() => setCopiedKeyIndex(null), 2000);
                                  }}
                                  className="nm-inset px-3 py-2 cursor-pointer rounded-xl flex items-center justify-between text-[#eaeff5] hover:text-[#38bdf8] transition-all"
                                >
                                  <span className="font-mono text-[9.5px] font-black tracking-wider truncate mr-2">
                                    {copiedKeyIndex === (webCopiedIdx + 500) ? "COPIADO!" : lic.password}
                                  </span>
                                  <LucideCopy size={10} className="shrink-0 opacity-60" />
                                </div>
                              </div>
                            </div>

                            {/* Detalhes de Expiração & Chips */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div className="bg-[#191b20]/30 px-3 py-2 rounded-xl">
                                <p className="text-[#94a3b8]/40 uppercase tracking-widest text-[7.5px] mb-0.5">Expira em</p>
                                <p className="text-[#eaeff5] font-black font-mono">{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString("pt-BR") : "ILIMITADO"}</p>
                              </div>
                              <div className="bg-[#191b20]/30 px-3 py-2 rounded-xl">
                                <p className="text-[#94a3b8]/40 uppercase tracking-widest text-[7.5px] mb-0.5">Chips Max</p>
                                <p className="text-[#eaeff5] font-black font-mono">{lic.maxSessions || 1} CHIPS</p>
                              </div>
                            </div>

                            {/* Botão Acessar Painel */}
                            <a
                              href="/nexus360"
                              className="mt-2 w-full py-3 nm-button text-[#38bdf8] hover:text-[#eaeff5] text-[8px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl border border-[#38bdf8]/10"
                            >
                              <LucideGlobe size={11} /> Acessar Painel Web
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── AJUDA / MANUAL ── */}
          {activeTab === 'ajuda' && (
            <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
              {/* Header da Seção */}
              <div className="nm-flat p-6 border border-[#38bdf8]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#eaeff5]">Central de Ajuda & Treinamento</h3>
                  <p className="text-[9px] text-[#94a3b8] mt-0.5 uppercase tracking-widest font-mono">Assista aos tutoriais práticos e tire suas dúvidas</p>
                </div>
                <div className="flex items-center gap-2 text-[#38bdf8] bg-[#38bdf8]/5 px-3 py-1.5 border border-[#38bdf8]/10 rounded-xl text-[8px] font-mono font-black uppercase tracking-widest">
                  <LucideBrain size={12} className="animate-pulse" /> Suporte Logístico de Elite
                </div>
              </div>

              {/* MÓDULO 1: VIDEO PLAYER INTERATIVO */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* O Player e Controles (2/3 da largura em telas grandes) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Tela do Player */}
                  <div className="relative nm-inset aspect-video rounded-3xl overflow-hidden flex flex-col justify-between p-6 border border-[#2b303b]/40 bg-[#14161a] group">
                    {/* Linha laser de escaneamento em loop */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#38bdf8]/15 to-transparent absolute top-0 animate-bounce pointer-events-none" />
                    </div>

                    {/* Badge do Status do Vídeo */}
                    <div className="relative z-10 self-start px-2.5 py-1 bg-black/40 backdrop-blur-md border border-[#38bdf8]/20 rounded-lg text-[8px] font-mono font-black uppercase tracking-widest text-[#38bdf8] flex items-center gap-1.5 shadow-[0_0_10px_rgba(56,189,248,0.15)]">
                      <span className={`w-1.5 h-1.5 rounded-full ${isVideoPlaying ? 'bg-emerald-400 animate-ping' : 'bg-[#38bdf8]'}`} />
                      {isVideoPlaying ? "Reproduzindo Tutorial" : "Vídeo Pausado"}
                    </div>

                    {/* Tela Principal (Título & Ação central) */}
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-4 text-center">
                      {!isVideoPlaying ? (
                        <button
                          onClick={() => setIsVideoPlaying(true)}
                          className="w-16 h-16 rounded-full nm-button flex items-center justify-center text-[#38bdf8] hover:text-[#eaeff5] hover:scale-110 active:scale-95 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] border border-[#38bdf8]/10"
                        >
                          <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsVideoPlaying(false)}
                          className="w-16 h-16 rounded-full nm-button flex items-center justify-center text-[#eaeff5] hover:text-[#38bdf8] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/5 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        </button>
                      )}

                      <div className="mt-4 max-w-md">
                        <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#eaeff5] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                          {[
                            "01. Primeiros Passos & Conexão de Instâncias",
                            "02. Configuração de Delay & Heurística Humana",
                            "03. Intelligence Chat (Escudo e Aquecimento)"
                          ][selectedVideoIdx]}
                        </h4>
                        <p className="text-[8px] text-[#94a3b8]/60 mt-1 font-mono uppercase tracking-widest leading-relaxed">
                          {[
                            "Aprenda a inicializar o Nexus, vincular instâncias e conectar múltiplos chips.",
                            "Domine tempos de espera e simulações humanas para blindar seus chips.",
                            "Ative diálogos em segundo plano para esquentar chips novos perante a heurística."
                          ][selectedVideoIdx]}
                        </p>
                      </div>
                    </div>

                    {/* Barra de Progresso do Player */}
                    <div className="relative z-10 w-full flex items-center gap-3">
                      <span className="text-[8px] font-mono text-[#94a3b8]/50 uppercase tracking-widest">
                        {isVideoPlaying ? `0${Math.floor((videoProgress * 10) / 60)}:${String((videoProgress * 10) % 60).padStart(2, '0')}` : "00:00"}
                      </span>
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          setVideoProgress(percent);
                        }}
                        className="flex-1 h-1.5 nm-inset rounded-full overflow-hidden cursor-pointer relative"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-[#38bdf8] to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-[#94a3b8]/50 uppercase tracking-widest">
                        {["12:45", "08:30", "15:10"][selectedVideoIdx]}
                      </span>
                    </div>
                  </div>

                  {/* Controles do Player */}
                  <div className="nm-flat px-6 py-4 flex items-center justify-between gap-6 border border-[#2b303b]/20">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-[#eaeff5] hover:text-[#38bdf8] transition-all"
                      >
                        {isVideoPlaying ? (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setVideoProgress(0);
                          setIsVideoPlaying(false);
                        }}
                        className="w-10 h-10 rounded-xl nm-button flex items-center justify-center text-[#94a3b8] hover:text-[#eaeff5] transition-all"
                        title="Reiniciar Vídeo"
                      >
                        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                      </button>
                    </div>

                    {/* Controle de Volume */}
                    <div className="flex items-center gap-3 w-1/3">
                      <svg className="w-4 h-4 text-[#94a3b8] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const val = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          setVideoVolume(val);
                        }}
                        className="flex-1 h-1 nm-inset rounded-full overflow-hidden cursor-pointer relative"
                      >
                        <div
                          className="h-full bg-[#38bdf8] rounded-full transition-all duration-300"
                          style={{ width: `${videoVolume}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-[#94a3b8]/50 uppercase tracking-widest w-6 text-right">{videoVolume}%</span>
                    </div>
                  </div>
                </div>

                {/* Playlist (1/3 da largura) */}
                <div className="space-y-3">
                  <span className="text-[8px] font-mono font-black text-[#94a3b8]/60 uppercase tracking-widest px-1 block">Módulos Disponíveis</span>

                  {[
                    { title: "01. Conexão e Inicialização", duration: "12:45", desc: "Primeiros passos no Nexus 360", color: "border-[#38bdf8]/10 text-[#38bdf8]" },
                    { title: "02. Delay & Heurística", duration: "08:30", desc: "Ajuste de pausas de disparo", color: "border-amber-500/10 text-amber-400" },
                    { title: "03. Intelligence Chat", duration: "15:10", desc: "Aquecimento contínuo de chips", color: "border-purple-500/10 text-purple-400" },
                  ].map((vid, idx) => {
                    const isSelected = selectedVideoIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedVideoIdx(idx);
                          setVideoProgress(15);
                          setIsVideoPlaying(true);
                        }}
                        className={`p-4 cursor-pointer border rounded-2xl transition-all duration-300 ${isSelected
                          ? "nm-inset border-[#38bdf8]/25"
                          : "nm-flat border-[#2b303b]/20 hover:border-[#38bdf8]/10 hover:scale-[1.01]"
                          }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="text-[9px] font-mono font-black uppercase tracking-widest text-[#eaeff5] truncate flex-1 pr-2">{vid.title}</h5>
                          <span className="text-[7.5px] font-mono text-[#94a3b8]/50 shrink-0 font-bold">{vid.duration}</span>
                        </div>
                        <p className="text-[8px] text-[#94a3b8]/50 font-mono uppercase tracking-tight leading-normal">{vid.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MÓDULO 2: ACCORDIONS FAQ */}
              <div className="space-y-4 pt-4">
                <div className="px-1">
                  <h4 className="text-xs font-mono font-black uppercase tracking-widest text-[#eaeff5]">Perguntas Frequentes (FAQ)</h4>
                  <p className="text-[9px] text-[#94a3b8] mt-0.5 uppercase tracking-widest font-mono">Dúvidas rápidas sobre a operação tática do software</p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      q: "Quantos chips posso conectar simultaneamente?",
                      a: "O Nexus 360 não impõe limites artificiais de chips. O volume máximo é determinado pela capacidade de hardware e quantidade de licenças contratadas em sua conta. Recomendamos até 10 chips por máquina física para manter um excelente desempenho operacional."
                    },
                    {
                      q: "Qual o delay ideal recomendado para evitar banimentos?",
                      a: "Para disparos seguros, sugerimos um delay entre 30 a 90 segundos entre mensagens. O recurso 'Heurística Humana' do Nexus gerencia delays variáveis de digitação (simulando toques no teclado de tamanhos diferentes), o que dilui o padrão robótico."
                    },
                    {
                      q: "Como funciona a garantia de entrega de mensagens?",
                      a: "O sistema opera de forma assíncrona. Caso ocorra queda de internet ou instabilidade local, o motor tático entra em modo de cura (Auto-Healing) e restabelece os fluxos de envio automaticamente de onde parou sem duplicar disparos."
                    },
                    {
                      q: "Posso utilizar proxies privados de outros países?",
                      a: "Sim. A blindagem por IP aceita proxies do tipo HTTP/Socks5 de qualquer região. Recomendamos proxies residenciais ou móveis dedicados (4G/5G) com Geolocalização compatível com a região de DDD dos chips."
                    },
                    {
                      q: "O que é o recurso 'Intelligence Chat' e como ativá-lo?",
                      a: "O Intelligence Chat é o nosso exclusivo módulo de aquecimento e blindagem de chips. Quando ativado, os chips da sua frota iniciam conversações bilaterais automáticas entre si nas pausas de disparo. Isso gera tráfego de entrada e saída orgânico, limpando o rastro heurístico e aumentando a autoridade das contas."
                    },
                    {
                      q: "O que acontece se um dos chips conectados sofrer desconexão?",
                      a: "O Nexus 360 possui um sistema de redundância inteligente (Circuit Breaker). Caso um chip perca a conexão ou sofra logout, o Nexus isola aquela instância imediatamente para não interromper os outros envios, redistribuindo o fluxo de disparos pendentes para os demais chips ativos."
                    },
                    {
                      q: "Consigo enviar mídias (fotos, vídeos, áudios) e arquivos em massa?",
                      a: "Sim. O módulo de envio suporta fotos, vídeos curtos, documentos PDF e arquivos diversos. Para áudios, o Nexus simula a gravação em tempo real (mostrando a indicação 'Gravando áudio...' no topo da conversa para o contato destinatário), o que aumenta a taxa de conversão."
                    },
                    {
                      q: "Como funciona a ferramenta de extração de contatos?",
                      a: "O extrator integrado permite capturar membros de grupos que você participa, contatos de conversas ativas ou de listas segmentadas. A extração é feita de forma assíncrona em milissegundos e os contatos extraídos podem ser exportados em CSV/Excel."
                    },
                    {
                      q: "O que é o sistema 'Mimetismo Humano' de digitação?",
                      a: "É o nosso algoritmo avançado que impede que o robô envie mensagens instantaneamente. Antes de despachar cada texto, o sistema calcula dinamicamente o número de caracteres da mensagem, inicia o status 'Digitando...' e simula a digitação na velocidade de um ser humano médio."
                    },
                    {
                      q: "A ferramenta funciona em segundo plano mesmo com o PC desligado?",
                      a: "Como o Nexus 360 é um software desktop de alta performance projetado para rodar localmente na sua máquina (garantindo total controle e privacidade sobre seus dados), o computador precisa estar ligado para que os envios prossigam."
                    }
                  ].map((faq, idx) => {
                    const isExpanded = expandedFaqIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="nm-flat border border-[#2b303b]/20 rounded-2xl overflow-hidden transition-all duration-300"
                      >
                        <button
                          onClick={() => setExpandedFaqIdx(isExpanded ? null : idx)}
                          className="w-full flex items-center justify-between px-6 py-4.5 text-left font-mono hover:text-[#38bdf8] transition-colors"
                        >
                          <span className="text-[10px] font-black uppercase text-[#eaeff5] tracking-tight">{faq.q}</span>
                          <span className="text-xs shrink-0 text-[#94a3b8]/60 transition-transform duration-300 ml-4 font-black">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </button>

                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-96 border-t border-[#2b303b]/25 bg-[#191b20]/20" : "max-h-0"
                            }`}
                        >
                          <div className="p-6 text-xs text-[#94a3b8] font-medium leading-relaxed font-mono">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AVISO LEGAL */}
              <div className="nm-flat p-6 rounded-2xl border border-rose-500/5 mt-4">
                <div className="flex items-center gap-2.5 text-rose-400 mb-2">
                  <LucideZap size={14} className="animate-pulse" />
                  <h4 className="font-black text-[12px] font-mono uppercase tracking-widest">Aviso Legal & Protocolo</h4>
                </div>
                <p className="text-[10px] text-[#94a3b8]/70 leading-relaxed uppercase font-black font-mono tracking-tight">
                  A WORKMANOS - DESENVOLVEDORA DO SOFTWARE NEXUS360 NÃO SE RESPONSABILIZA POR PROCESSOS DE FILTRAGEM HEURÍSTICA DEVIDO AO ABUSO DE DISPAROS. A SAÚDE TÁTICA E O AQUECIMENTO DA FILA PERTENCEM SEMPRE AO OPERADOR. O NEXUS É UMA FERRAMENTA DE ALTA LOGÍSTICA E PRECISÃO.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL NOVO CHAMADO */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewTicketModal(false)} />
          <div className="relative nm-flat bg-[#1e2128] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#eaeff5]">Abrir Chamado</h3>
                <p className="text-[9px] text-[#94a3b8] mt-0.5 uppercase tracking-widest font-mono">Fale com nossa equipe técnica</p>
              </div>
              <button onClick={() => setShowNewTicketModal(false)} className="w-8 h-8 nm-button flex items-center justify-center text-[#94a3b8] hover:text-[#eaeff5] transition-all">
                <LucideX size={14} />
              </button>
            </div>

            {ticketError && (
              <div className="mb-4 p-4 nm-inset border-rose-500/10 text-rose-400 text-[9px] font-mono font-bold uppercase tracking-widest text-center">
                {ticketError}
              </div>
            )}

            <form onSubmit={handleNewTicket} className="space-y-5">
              <div>
                <label className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest block mb-1.5 ml-1">Assunto do Chamado</label>
                <input
                  type="text" required
                  value={newTicketSubject}
                  onChange={e => setNewTicketSubject(e.target.value)}
                  placeholder="Ex: Instalação da licença no Windows"
                  className="w-full nm-inset py-3.5 px-4 text-xs outline-none text-[#eaeff5] placeholder:text-[#94a3b8]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest block mb-1.5 ml-1">Descrição Detalhada</label>
                <textarea
                  required rows={4}
                  value={newTicketMessage}
                  onChange={e => setNewTicketMessage(e.target.value)}
                  placeholder="Descreva o problema ou dúvida com o máximo de detalhes possível..."
                  className="w-full nm-inset py-3.5 px-4 text-xs outline-none text-[#eaeff5] placeholder:text-[#94a3b8]/30 transition-all resize-none font-medium"
                />
              </div>
              <div className="flex gap-4 pt-3">
                <button type="button" onClick={() => setShowNewTicketModal(false)}
                  className="flex-1 py-3 nm-button text-[#94a3b8] hover:text-[#eaeff5] text-[9px] font-mono font-black uppercase tracking-widest transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={ticketLoading}
                  className="flex-1 py-3 nm-button text-[#eaeff5] hover:text-[#38bdf8] text-[9px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  {ticketLoading ? <LucideActivity size={12} className="animate-spin" /> : <><LucideSend size={12} /> Enviar Chamado</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowProfileModal(false)} />
          <div className="relative nm-flat bg-[#1e2128] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#eaeff5]">Meu Perfil</h3>
                <p className="text-[9px] text-[#94a3b8] mt-0.5 uppercase tracking-widest font-mono">Gerencie seus dados de acesso</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 nm-button flex items-center justify-center text-[#94a3b8] hover:text-[#eaeff5] transition-all">
                <LucideX size={14} />
              </button>
            </div>

            {profileError && (
              <div className="mb-4 p-4 nm-inset border-rose-500/10 text-rose-400 text-[9px] font-mono font-bold uppercase tracking-widest text-center">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-4 nm-inset border-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-widest text-center">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest block mb-1.5 ml-1">E-mail (Login)</label>
                  <div className="w-full nm-inset py-3.5 px-4 text-xs text-[#94a3b8]/60 bg-[#1e2128]/40 select-none overflow-x-auto whitespace-nowrap">
                    {customerData?.email}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest block mb-1.5 ml-1">Telefone</label>
                  <div className="w-full nm-inset py-3.5 px-4 text-xs text-[#94a3b8]/60 bg-[#1e2128]/40 select-none overflow-x-auto whitespace-nowrap">
                    {customerData?.phone || "Não Cadastrado"}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#1e2128]/50 border border-[#2b303b]/40 rounded-xl font-mono text-[8px] text-[#94a3b8] uppercase tracking-widest leading-relaxed">
                ⚠️ O E-mail e o Telefone são vinculados à sua licença original de compra e não podem ser modificados pelo painel.
              </div>

              <div>
                <label className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest block mb-1.5 ml-1">Nome de Exibição</label>
                <input
                  type="text" required
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full nm-inset py-3.5 px-4 text-xs outline-none text-[#eaeff5] placeholder:text-[#94a3b8]/30 transition-all focus:border-[#38bdf8]/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-mono font-black text-[#94a3b8] uppercase tracking-widest block mb-1.5 ml-1">Nova Senha (Opcional)</label>
                <input
                  type="password"
                  value={profilePassword}
                  onChange={e => setProfilePassword(e.target.value)}
                  placeholder="Preencha apenas se quiser alterar"
                  className="w-full nm-inset py-3.5 px-4 text-xs outline-none text-[#eaeff5] placeholder:text-[#94a3b8]/30 transition-all focus:border-[#38bdf8]/20"
                />
              </div>

              <div className="flex gap-4 pt-3">
                <button type="button" onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 nm-button text-[#94a3b8] hover:text-[#eaeff5] text-[9px] font-mono font-black uppercase tracking-widest transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={profileLoading}
                  className="flex-1 py-3 nm-button text-[#eaeff5] hover:text-[#38bdf8] text-[9px] font-mono font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  {profileLoading ? <LucideActivity size={12} className="animate-spin" /> : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
