"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LucideX, LucideUser, LucideMail, LucidePhone, LucideMapPin,
  LucideActivity, LucideMessageSquare, LucideShield, LucideServer,
  LucideSend, LucideEdit, LucideSave, LucideTicket, LucideCreditCard,
  LucideSmartphone, LucideGlobe, LucideWifi, LucideLoader2,
  LucideCheckCircle, LucideAlertCircle, LucideCalendar, LucideTag, LucideKey
} from "lucide-react";

interface CustomerProfileProps {
  customerId: string;
  onClose: () => void;
}

const LOG_TYPES = ["NOTE", "CALL", "EMAIL", "WHATSAPP", "COMPRA"] as const;
type LogType = typeof LOG_TYPES[number];

const LOG_COLORS: Record<LogType, string> = {
  NOTE: "text-slate-400 bg-slate-500/10",
  CALL: "text-blue-400 bg-blue-500/10",
  EMAIL: "text-purple-400 bg-purple-500/10",
  WHATSAPP: "text-emerald-400 bg-emerald-500/10",
  COMPRA: "text-amber-400 bg-amber-500/10",
};

const STATUS_STAGES = [
  "NEW_LEAD", "CONTACTED", "PROPOSAL_SENT", "NEGOTIATING", "CLOSED_WON", "CLOSED_LOST"
] as const;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function LicenseBadge({ license }: { license: any }) {
  const expired = license.expiresAt && new Date(license.expiresAt) < new Date();
  const daysLeft = license.expiresAt
    ? Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${license.isActive && !expired ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
          <LucideShield size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[11px] md:text-[12px] font-black text-white uppercase break-all">{license.key ?? license.username ?? license.name}</p>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${license._type === "desktop" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
              {license._type}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 truncate">{license.plan} · {license.role ?? "STANDARD"}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        {license.expiresAt ? (
          <p className={`text-[11px] font-black ${expired ? "text-rose-400" : daysLeft! <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
            {expired ? "EXPIRADA" : daysLeft! <= 7 ? `${daysLeft}d` : fmtDate(license.expiresAt)}
          </p>
        ) : (
          <p className="text-[11px] font-black text-emerald-400">ILIMITADA</p>
        )}
        <p className={`text-[9px] font-bold uppercase mt-0.5 ${license.isActive ? "text-emerald-600" : "text-rose-600"}`}>
          {license.isActive ? "ATIVA" : "INATIVA"}
        </p>
      </div>
    </div>
  );
}

export default function CustomerProfile({ customerId, onClose }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"geral" | "chamados" | "licencas" | "financeiro" | "timeline">("geral");
  const [newLog, setNewLog] = useState("");
  const [logType, setLogType] = useState<LogType>("NOTE");
  const [submittingLog, setSubmittingLog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [portalPassword, setPortalPassword] = useState("");
  const [showPortalForm, setShowPortalForm] = useState(false);
  const [portalAction, setPortalAction] = useState<"enable" | "reset" | null>(null);
  const [submittingPortal, setSubmittingPortal] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [portalSuccess, setPortalSuccess] = useState("");

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPortalPassword(pass);
  };

  const handlePortalAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalPassword) return;
    setSubmittingPortal(true);
    setPortalError("");
    setPortalSuccess("");

    try {
      const method = portalAction === "enable" ? "POST" : "PUT";
      const res = await fetch(`/api/customers/${customerId}/portal-access`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: portalPassword })
      });

      if (res.ok) {
        setPortalSuccess(
          portalAction === "enable" 
            ? "Acesso ao portal liberado com sucesso!" 
            : "Senha redefinida com sucesso!"
        );
        setPortalPassword("");
        setShowPortalForm(false);
        setPortalAction(null);
        await fetchCustomer();
      } else {
        const data = await res.json();
        setPortalError(data.error || "Erro ao realizar operação");
      }
    } catch (err) {
      setPortalError("Erro de conexão ao servidor");
    } finally {
      setSubmittingPortal(false);
    }
  };

  const handlePortalAccessRevoke = async () => {
    if (!window.confirm("Atenção: Tem certeza que deseja revogar o acesso do cliente ao portal? O usuário será excluído e ele não poderá mais fazer login.")) {
      return;
    }
    setSubmittingPortal(true);
    setPortalError("");
    setPortalSuccess("");

    try {
      const res = await fetch(`/api/customers/${customerId}/portal-access`, {
        method: "DELETE"
      });

      if (res.ok) {
        setPortalSuccess("Acesso ao portal revogado com sucesso!");
        await fetchCustomer();
      } else {
        const data = await res.json();
        setPortalError(data.error || "Erro ao revogar acesso");
      }
    } catch (err) {
      setPortalError("Erro de conexão ao servidor");
    } finally {
      setSubmittingPortal(false);
    }
  };

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
        setEditForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          cpfCnpj: data.cpfCnpj ?? "",
          address: data.address ?? "",
          notes: data.notes ?? "",
          status: data.status ?? "LEAD",
          pipelineStage: data.pipelineStage ?? "NEW_LEAD",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        await fetchCustomer();
        setEditing(false);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setSubmittingLog(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newLog, type: logType }),
      });
      if (res.ok) {
        setNewLog("");
        fetchCustomer();
      } else {
        const errData = await res.json();
        alert(`Erro ao enviar: ${errData.error ?? "Verifique os dados e tente novamente."}`);
      }
    } catch (err) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm("Deseja realmente remover esta interação do histórico do cliente?")) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${customerId}/interactions?logId=${logId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchCustomer();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao remover interação");
      }
    } catch {
      alert("Erro de conexão ao tentar remover interação.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full md:w-[800px] h-full bg-[#0a0a0c] border-l border-white/10 flex items-center justify-center">
          <LucideLoader2 size={32} className="text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const allLicenses = [...(customer.licenses ?? []).map((l: any) => ({ ...l, _type: "desktop" })), ...(customer.webLicenses ?? []).map((l: any) => ({ ...l, _type: "web" }))];
  const openTickets = (customer.Ticket ?? []).filter((t: any) => t.status !== "CLOSED");
  const sourceColors: Record<string, string> = {
    MANUAL: "bg-slate-500/10 text-slate-400",
    WHATSAPP: "bg-emerald-500/10 text-emerald-400",
    API: "bg-blue-500/10 text-blue-400",
  };

  const tabs = [
    { id: "geral", label: "Geral" },
    { id: "chamados", label: `Chamados (${openTickets.length})` },
    { id: "licencas", label: `Licenças (${allLicenses.length})` },
    { id: "financeiro", label: `Financeiro (${(customer.subscriptions ?? []).length})` },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:w-[800px] h-full bg-[#0a0a0c] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <LucideUser size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider break-words">{customer.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black uppercase shrink-0 ${sourceColors[customer.source] ?? sourceColors.MANUAL}`}>
                    {customer.source ?? "MANUAL"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black uppercase ${customer.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : customer.status === "LEAD" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {customer.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {customer.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <button onClick={handleSaveEdit} disabled={savingEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
                  {savingEdit ? <LucideLoader2 size={13} className="animate-spin" /> : <LucideSave size={13} />}
                  Salvar
                </button>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-[11px] font-bold hover:bg-white/10 transition-colors">
                  <LucideEdit size={13} /> Editar
                </button>
              )}
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
                <LucideX size={18} />
              </button>
            </div>
          </div>

          {/* Pipeline Stage */}
          <div className="flex gap-1 mt-2">
            {STATUS_STAGES.map(stage => (
              <div key={stage} title={stage}
                className={`h-1.5 flex-1 rounded-full transition-all ${customer.pipelineStage === stage ? "bg-blue-500" : STATUS_STAGES.indexOf(stage) < STATUS_STAGES.indexOf(customer.pipelineStage as any) ? "bg-blue-500/30" : "bg-white/5"}`} />
            ))}
          </div>
          <p className="text-[9.5px] md:text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest">{customer.pipelineStage?.replace(/_/g, " ")}</p>
 
          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[11px] md:text-[12px] font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* GERAL */}
          {activeTab === "geral" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {editing ? (
                <div className="space-y-4">
                  {[
                    { label: "Nome", key: "name", type: "text" },
                    { label: "E-mail", key: "email", type: "email" },
                    { label: "Telefone", key: "phone", type: "text" },
                    { label: "CPF/CNPJ", key: "cpfCnpj", type: "text" },
                    { label: "Endereço", key: "address", type: "text" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.label}</label>
                      <input type={f.type} value={editForm[f.key] ?? ""} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40">
                      {["LEAD", "ACTIVE", "INACTIVE"].map(s => <option key={s} value={s} className="bg-[#0a0a0c] text-white">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Etapa do Pipeline</label>
                    <select value={editForm.pipelineStage} onChange={e => setEditForm({ ...editForm, pipelineStage: e.target.value })}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40">
                      {STATUS_STAGES.map(s => <option key={s} value={s} className="bg-[#0a0a0c] text-white">{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Notas</label>
                    <textarea rows={3} value={editForm.notes ?? ""} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40 resize-none" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="glass-panel p-5 rounded-2xl space-y-3.5">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3.5">Contato</h3>
                    {[
                      { icon: LucideMail, value: customer.email, color: "text-blue-400" },
                      { icon: LucidePhone, value: customer.phone || "—", color: "text-emerald-400" },
                      { icon: LucideUser, value: customer.cpfCnpj || "CPF/CNPJ não informado", color: "text-purple-400" },
                      { icon: LucideMapPin, value: customer.address || "Endereço não informado", color: "text-amber-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <item.icon size={16} className={`${item.color} mt-0.5 shrink-0`} />
                        <span className="text-[12px] text-slate-300 font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
 
                  {/* Painel: Acesso ao Portal */}
                  <div className="glass-panel p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <LucideKey size={14} className="text-blue-400" /> Acesso ao Portal
                      </h3>
                      {customer.user ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-500/10 text-slate-400 border border-slate-500/10">
                          Inativo
                        </span>
                      )}
                    </div>

                    {portalSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                        {portalSuccess}
                      </div>
                    )}
                    {portalError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold">
                        {portalError}
                      </div>
                    )}

                    {customer.user ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5">
                          <div className="min-w-0 flex-1 mr-2">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Usuário / Login</p>
                            <p className="text-[12px] text-white font-mono mt-0.5 truncate" title={customer.user.username}>{customer.user.username}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setPortalAction("reset");
                                setShowPortalForm(true);
                                setPortalPassword("");
                                setPortalError("");
                                setPortalSuccess("");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase transition-colors border border-blue-500/15"
                            >
                              Alterar Senha
                            </button>
                            <button
                              onClick={handlePortalAccessRevoke}
                              disabled={submittingPortal}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase transition-colors border border-rose-500/15 disabled:opacity-50"
                            >
                              Revogar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-slate-400">Este cliente ainda não possui acesso ao portal.</p>
                        {!showPortalForm && (
                          <button
                            onClick={() => {
                              setPortalAction("enable");
                              setShowPortalForm(true);
                              setPortalPassword("");
                              setPortalError("");
                              setPortalSuccess("");
                            }}
                            className="px-3.5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/10 flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <LucideKey size={12} /> Liberar Acesso
                          </button>
                        )}
                      </div>
                    )}

                    {showPortalForm && (
                      <form onSubmit={handlePortalAccessSubmit} className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {portalAction === "enable" ? "Definir Senha do Portal" : "Definir Nova Senha"}
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPortalForm(false)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <LucideX size={14} />
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Mínimo 6 caracteres"
                            value={portalPassword}
                            onChange={(e) => setPortalPassword(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 focus:border-blue-500/40 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={generateStrongPassword}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase rounded-lg border border-white/10 transition-colors whitespace-nowrap"
                          >
                            Gerar Senha
                          </button>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setShowPortalForm(false)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-bold uppercase rounded-lg transition-colors border border-transparent"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={submittingPortal}
                            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg transition-colors shadow-lg shadow-blue-500/10 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {submittingPortal ? (
                              <LucideLoader2 size={12} className="animate-spin" />
                            ) : (
                              "Confirmar"
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Licenças", val: allLicenses.length, color: "text-blue-400", icon: LucideShield },
                      { label: "Chamados", val: (customer.Ticket ?? []).length, color: "text-indigo-400", icon: LucideTicket },
                      { label: "Assinaturas", val: (customer.subscriptions ?? []).length, color: "text-amber-400", icon: LucideCreditCard },
                    ].map((stat, i) => (
                      <div key={i} className="glass-panel p-4 rounded-xl text-center">
                        <stat.icon size={18} className={`${stat.color} mx-auto mb-2`} />
                        <p className="text-lg md:text-xl font-black text-white">{stat.val}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
 
                  {customer.notes && (
                    <div className="glass-panel p-4 rounded-xl border-amber-500/20 bg-amber-500/5">
                      <h3 className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-2">Notas</h3>
                      <p className="text-[12px] text-amber-100/70 italic leading-relaxed">{customer.notes}</p>
                    </div>
                  )}
 
                  <div className="glass-panel p-4 rounded-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cadastrado em</p>
                    <p className="text-[12px] text-slate-300 font-bold">{fmtDateTime(customer.createdAt)}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHAMADOS */}
          {activeTab === "chamados" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {(customer.Ticket ?? []).length === 0 ? (
                <div className="text-center py-12 text-[11px] font-bold text-slate-600 uppercase tracking-widest">Nenhum chamado</div>
              ) : (customer.Ticket ?? []).map((ticket: any) => (
                <div key={ticket.id} className="glass-panel p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[12px] font-black text-white">{ticket.subject}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{fmtDate(ticket.createdAt)} · {ticket.replies?.length ?? 0} respostas</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${ticket.status === "OPEN" ? "bg-blue-500/10 text-blue-400" : ticket.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-500"}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${ticket.priority === "URGENT" ? "bg-rose-500/10 text-rose-400" : ticket.priority === "HIGH" ? "bg-orange-500/10 text-orange-400" : "bg-slate-500/10 text-slate-500"}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LICENÇAS */}
          {activeTab === "licencas" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {allLicenses.length === 0 ? (
                <div className="text-center py-12 text-[11px] font-bold text-slate-600 uppercase tracking-widest">Nenhuma licença</div>
              ) : allLicenses.map((lic: any) => (
                <div key={lic.id}>
                  <LicenseBadge license={lic} />
                </div>
              ))}
            </div>
          )}

          {/* FINANCEIRO */}
          {activeTab === "financeiro" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {(customer.subscriptions ?? []).length === 0 ? (
                <div className="text-center py-12 text-[11px] font-bold text-slate-600 uppercase tracking-widest">Nenhuma assinatura</div>
              ) : (customer.subscriptions ?? []).map((sub: any) => (
                <div key={sub.id} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[12.5px] md:text-[13px] font-black text-white">R$ {Number(sub.amount).toFixed(2)}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{sub.paymentMethod ?? "—"} · vence {fmtDate(sub.expiresAt)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${sub.status === "PAID" ? "bg-emerald-500/10 text-emerald-400" : sub.status === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div className="animate-in fade-in duration-200">
              <form onSubmit={handleAddLog} className="mb-6 space-y-2.5">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {LOG_TYPES.map(t => (
                    <button type="button" key={t} onClick={() => setLogType(t)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-black uppercase transition-all ${logType === t ? LOG_COLORS[t] + " ring-1 ring-current" : "text-slate-400 hover:text-slate-200 bg-white/[0.03]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea value={newLog} onChange={e => setNewLog(e.target.value)}
                    placeholder={
                      logType === "WHATSAPP"
                        ? `Enviar mensagem WhatsApp para ${customer?.phone ?? "(sem telefone cadastrado)"}...`
                        : logType === "CALL" ? "Registrar ligação realizada..."
                        : logType === "EMAIL" ? "Registrar e-mail enviado/recebido..."
                        : logType === "COMPRA" ? "Registrar compra ou transação..."
                        : "Registrar nota, observação..."
                    }
                    className={`w-full bg-white/5 border rounded-xl p-4 pr-12 text-[12px] text-white outline-none resize-none transition-colors ${
                      logType === "WHATSAPP"
                        ? "border-emerald-500/30 focus:border-emerald-500/60"
                        : "border-white/10 focus:border-blue-500/40"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        (e.target as HTMLTextAreaElement).form?.requestSubmit();
                      }
                    }}
                    rows={3} required />
                  <button type="submit" disabled={submittingLog}
                    className={`absolute bottom-3 right-3 p-2.5 text-white rounded-lg transition-colors disabled:opacity-50 ${
                      logType === "WHATSAPP" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-500 hover:bg-blue-400"
                    }`}>
                    {submittingLog ? <LucideLoader2 size={14} className="animate-spin" /> : <LucideSend size={14} />}
                  </button>
                </div>
                {logType === "WHATSAPP" && !customer?.phone && (
                  <p className="text-[10px] text-amber-400 font-bold uppercase mt-1.5 flex items-center gap-1">
                    ⚠️ Cadastre o telefone do cliente na aba Geral para enviar pelo WhatsApp.
                  </p>
                )}
              </form>
 
              <div className="space-y-3.5">
                {(customer.interactionLogs ?? []).length === 0 ? (
                  <div className="text-center py-8 text-[11px] font-bold text-slate-600 uppercase tracking-widest">Nenhum histórico</div>
                ) : (customer.interactionLogs ?? []).map((log: any) => (
                  <div key={log.id} className="flex gap-3 animate-in fade-in duration-200">
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5 ${LOG_COLORS[log.type as LogType] ?? LOG_COLORS.NOTE}`}>
                      {log.type[0]}
                    </div>
                    <div className="flex-1 glass-panel p-3.5 rounded-xl group relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-black uppercase ${(LOG_COLORS[log.type as LogType] ?? LOG_COLORS.NOTE).split(" ")[0]}`}>{log.type}</span>
                        <div className="flex items-center gap-2.5">
                          <time className="text-[10px] text-slate-500">{fmtDateTime(log.createdAt)}</time>
                          <button 
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                            title="Excluir do histórico"
                          >
                            <LucideX size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[12px] text-slate-200 leading-relaxed whitespace-pre-wrap">{log.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
