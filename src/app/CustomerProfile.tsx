"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LucideX, LucideUser, LucideMail, LucidePhone, LucideMapPin,
  LucideActivity, LucideMessageSquare, LucideShield, LucideServer,
  LucideSend, LucideEdit, LucideSave, LucideTicket, LucideCreditCard,
  LucideSmartphone, LucideGlobe, LucideWifi, LucideLoader2,
  LucideCheckCircle, LucideAlertCircle, LucideCalendar, LucideTag
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
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${license.isActive && !expired ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
          <LucideShield size={14} />
        </div>
        <div>
          <p className="text-[11px] font-black text-white uppercase">{license.key ?? license.username ?? license.name}</p>
          <p className="text-[9px] text-slate-500 font-bold uppercase">{license.plan} · {license.role ?? "STANDARD"}</p>
        </div>
      </div>
      <div className="text-right">
        {license.expiresAt ? (
          <p className={`text-[10px] font-black ${expired ? "text-rose-400" : daysLeft! <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
            {expired ? "EXPIRADA" : daysLeft! <= 7 ? `${daysLeft}d restantes` : fmtDate(license.expiresAt)}
          </p>
        ) : (
          <p className="text-[10px] font-black text-emerald-400">ILIMITADA</p>
        )}
        <p className={`text-[8px] font-bold uppercase mt-0.5 ${license.isActive ? "text-emerald-600" : "text-rose-600"}`}>
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
      }
    } finally {
      setSubmittingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full md:w-[640px] h-full bg-[#0a0a0c] border-l border-white/10 flex items-center justify-center">
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
      <div className="relative w-full md:w-[640px] h-full bg-[#0a0a0c] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <LucideUser size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white uppercase tracking-wider">{customer.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${sourceColors[customer.source] ?? sourceColors.MANUAL}`}>
                    {customer.source ?? "MANUAL"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${customer.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : customer.status === "LEAD" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {customer.status}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono">ID: {customer.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <button onClick={handleSaveEdit} disabled={savingEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
                  {savingEdit ? <LucideLoader2 size={11} className="animate-spin" /> : <LucideSave size={11} />}
                  Salvar
                </button>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-[10px] font-bold hover:bg-white/10 transition-colors">
                  <LucideEdit size={11} /> Editar
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
                className={`h-1 flex-1 rounded-full transition-all ${customer.pipelineStage === stage ? "bg-blue-500" : STATUS_STAGES.indexOf(stage) < STATUS_STAGES.indexOf(customer.pipelineStage as any) ? "bg-blue-500/30" : "bg-white/5"}`} />
            ))}
          </div>
          <p className="text-[9px] text-slate-600 mt-1 font-bold uppercase tracking-widest">{customer.pipelineStage?.replace(/_/g, " ")}</p>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

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
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.label}</label>
                      <input type={f.type} value={editForm[f.key] ?? ""} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40">
                      {["LEAD", "ACTIVE", "INACTIVE"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Etapa do Pipeline</label>
                    <select value={editForm.pipelineStage} onChange={e => setEditForm({ ...editForm, pipelineStage: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40">
                      {STATUS_STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Notas</label>
                    <textarea rows={3} value={editForm.notes ?? ""} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none focus:border-blue-500/40 resize-none" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="glass-panel p-5 rounded-2xl space-y-3">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Contato</h3>
                    {[
                      { icon: LucideMail, value: customer.email, color: "text-blue-400" },
                      { icon: LucidePhone, value: customer.phone || "—", color: "text-emerald-400" },
                      { icon: LucideUser, value: customer.cpfCnpj || "CPF/CNPJ não informado", color: "text-purple-400" },
                      { icon: LucideMapPin, value: customer.address || "Endereço não informado", color: "text-amber-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <item.icon size={14} className={`${item.color} mt-0.5 shrink-0`} />
                        <span className="text-[11px] text-slate-300 font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Licenças", val: allLicenses.length, color: "text-blue-400", icon: LucideShield },
                      { label: "Chamados", val: (customer.Ticket ?? []).length, color: "text-indigo-400", icon: LucideTicket },
                      { label: "Assinaturas", val: (customer.subscriptions ?? []).length, color: "text-amber-400", icon: LucideCreditCard },
                    ].map((stat, i) => (
                      <div key={i} className="glass-panel p-4 rounded-xl text-center">
                        <stat.icon size={16} className={`${stat.color} mx-auto mb-2`} />
                        <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                        <p className="text-[8px] text-slate-600 font-bold uppercase">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {customer.notes && (
                    <div className="glass-panel p-4 rounded-xl border-amber-500/20 bg-amber-500/5">
                      <h3 className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest mb-2">Notas</h3>
                      <p className="text-[11px] text-amber-100/70 italic">{customer.notes}</p>
                    </div>
                  )}

                  <div className="glass-panel p-4 rounded-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cadastrado em</p>
                    <p className="text-[11px] text-slate-300 font-bold">{fmtDateTime(customer.createdAt)}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHAMADOS */}
          {activeTab === "chamados" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {(customer.Ticket ?? []).length === 0 ? (
                <div className="text-center py-12 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nenhum chamado</div>
              ) : (customer.Ticket ?? []).map((ticket: any) => (
                <div key={ticket.id} className="glass-panel p-4 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-white">{ticket.subject}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{fmtDate(ticket.createdAt)} · {ticket.replies?.length ?? 0} respostas</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ticket.status === "OPEN" ? "bg-blue-500/10 text-blue-400" : ticket.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-400" : "bg-slate-500/10 text-slate-500"}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ticket.priority === "URGENT" ? "bg-rose-500/10 text-rose-400" : ticket.priority === "HIGH" ? "bg-orange-500/10 text-orange-400" : "bg-slate-500/10 text-slate-500"}`}>
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
                <div className="text-center py-12 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nenhuma licença</div>
              ) : allLicenses.map((lic: any) => (
                <div key={lic.id} className="relative">
                  <span className={`absolute top-3 right-3 px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${lic._type === "desktop" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
                    {lic._type}
                  </span>
                  <LicenseBadge license={lic} />
                </div>
              ))}
            </div>
          )}

          {/* FINANCEIRO */}
          {activeTab === "financeiro" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {(customer.subscriptions ?? []).length === 0 ? (
                <div className="text-center py-12 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nenhuma assinatura</div>
              ) : (customer.subscriptions ?? []).map((sub: any) => (
                <div key={sub.id} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-black text-white">R$ {Number(sub.amount).toFixed(2)}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{sub.paymentMethod ?? "—"} · vence {fmtDate(sub.expiresAt)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${sub.status === "PAID" ? "bg-emerald-500/10 text-emerald-400" : sub.status === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div className="animate-in fade-in duration-200">
              <form onSubmit={handleAddLog} className="mb-6 space-y-2">
                <div className="flex gap-2">
                  {LOG_TYPES.map(t => (
                    <button type="button" key={t} onClick={() => setLogType(t)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${logType === t ? LOG_COLORS[t] + " ring-1 ring-current" : "text-slate-600 hover:text-slate-400 bg-white/[0.03]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea value={newLog} onChange={e => setNewLog(e.target.value)}
                    placeholder="Registrar nota, ligação, e-mail..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 text-[11px] text-white outline-none focus:border-blue-500/40 resize-none transition-colors"
                    rows={3} required />
                  <button type="submit" disabled={submittingLog}
                    className="absolute bottom-3 right-3 p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors disabled:opacity-50">
                    {submittingLog ? <LucideLoader2 size={12} className="animate-spin" /> : <LucideSend size={12} />}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {(customer.interactionLogs ?? []).length === 0 ? (
                  <div className="text-center py-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nenhum histórico</div>
                ) : (customer.interactionLogs ?? []).map((log: any) => (
                  <div key={log.id} className="flex gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black mt-0.5 ${LOG_COLORS[log.type as LogType] ?? LOG_COLORS.NOTE}`}>
                      {log.type[0]}
                    </div>
                    <div className="flex-1 glass-panel p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-black uppercase ${(LOG_COLORS[log.type as LogType] ?? LOG_COLORS.NOTE).split(" ")[0]}`}>{log.type}</span>
                        <time className="text-[9px] text-slate-600">{fmtDateTime(log.createdAt)}</time>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{log.content}</p>
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
