"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LucideUser, LucidePlus, LucideActivity, LucidePhone, LucideMail,
  LucideFileText, LucideSearch, LucideUsers, LucideTag, LucideMapPin,
  LucideCalendar, LucideEdit, LucideList, LucideLayoutGrid,
  LucideMessageSquare, LucideSmartphone, LucideGlobe, LucideShield,
  LucideTicket, LucideFilter, LucideTrash2,
  LucideArrowUpDown, LucideChevronUp, LucideChevronDown
} from "lucide-react";
import CustomerProfile from "./CustomerProfile";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpfCnpj: string | null;
  status: string;
  source: string;
  pipelineStage: string;
  affiliate?: { referralCode: string };
  licenses: Array<{ isActive: boolean; expiresAt: string | null }>;
  webLicenses: Array<{ isActive: boolean; expiresAt: string | null }>;
  Ticket: Array<{ status: string }>;
  interactionLogs: Array<{ createdAt: string }>;
  _count: { licenses: number };
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = "ALL" | "ACTIVE" | "LEAD" | "INACTIVE" | "TRASHED";
type SourceFilter = "ALL" | "MANUAL" | "WHATSAPP" | "API";

function SourceIcon({ source }: { source: string }) {
  if (source === "WHATSAPP") return <LucideSmartphone size={11} className="text-emerald-400" />;
  if (source === "API") return <LucideGlobe size={11} className="text-blue-400" />;
  return <LucideUser size={11} className="text-slate-500" />;
}

function LicenseBadge({ licenses, webLicenses }: { licenses: any[]; webLicenses: any[] }) {
  const all = [...licenses, ...webLicenses];
  const active = all.filter(l => l.isActive && (!l.expiresAt || new Date(l.expiresAt) > new Date()));
  const expiringSoon = all.filter(l => {
    if (!l.expiresAt || !l.isActive) return false;
    const days = Math.ceil((new Date(l.expiresAt).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 7;
  });

  if (all.length === 0) return <span className="text-[9px] text-slate-700 font-bold uppercase">Sem licença</span>;
  if (expiringSoon.length > 0) return (
    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
      Expira em breve
    </span>
  );
  if (active.length > 0) return (
    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      {active.length} ativa{active.length > 1 ? "s" : ""}
    </span>
  );
  return <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Expirada</span>;
}

function getLicenseSortValue(customer: Customer) {
  const all = [...(customer.licenses ?? []), ...(customer.webLicenses ?? [])];
  const active = all.filter(l => l.isActive && (!l.expiresAt || new Date(l.expiresAt) > new Date()));
  const expiringSoon = all.filter(l => {
    if (!l.expiresAt || !l.isActive) return false;
    const days = Math.ceil((new Date(l.expiresAt).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 7;
  });

  if (all.length === 0) return 0; // Sem licença
  if (expiringSoon.length > 0) return 2; // Expira em breve
  if (active.length > 0) return 3; // Ativa
  return 1; // Expirada
}

function fmtRelative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 30) return `${days}d atrás`;
  return d.toLocaleDateString("pt-BR");
}

export default function CRMView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", cpfCnpj: "", address: "", notes: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [profileCustomerId, setProfileCustomerId] = useState<string | null>(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <LucideArrowUpDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    if (sortConfig.direction === "asc") {
      return <LucideChevronUp size={10} className="text-blue-400 ml-1" />;
    }
    return <LucideChevronDown size={10} className="text-blue-400 ml-1" />;
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja enviar o cliente "${name}" para a lixeira? Ele ficará inativo e poderá ser recuperado nos próximos 60 dias.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setShowModal(false);
        setEditingCustomerId(null);
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao enviar cliente para a lixeira");
      }
    } catch {
      alert("Erro de conexão ao tentar enviar cliente para a lixeira.");
    }
  };

  const handleRestoreCustomer = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente restaurar o cliente "${name}" para a base ativa?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" })
      });
      if (res.ok) {
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao restaurar cliente");
      }
    } catch {
      alert("Erro de conexão ao tentar restaurar cliente.");
    }
  };

  const handleDeletePermanent = async (id: string, name: string) => {
    if (!window.confirm(`ATENÇÃO: Tem certeza que deseja excluir PERMANENTEMENTE o cliente "${name}"? Esta ação não pode ser desfeita e removerá todas as licenças, chamados, notas e dados vinculados.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}?permanent=true`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir permanentemente o cliente");
      }
    } catch {
      alert("Erro de conexão ao tentar excluir permanentemente o cliente.");
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData("customerId", id); };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("customerId");
    if (!id) return;
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    await fetch(`/api/customers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === "TRASHED" ? "/api/customers?trash=true" : "/api/customers";
      const res = await fetch(url);
      if (res.ok) setCustomers(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    if (statusFilter === "TRASHED") {
      setViewMode("list");
    }
  }, [statusFilter]);

  const handleOpenEditModal = async (customer: Customer) => {
    setEditingCustomerId(customer.id);
    try {
      const res = await fetch(`/api/customers/${customer.id}`);
      if (res.ok) {
        const full = await res.json();
        setFormData({ name: full.name ?? "", email: full.email ?? "", phone: full.phone ?? "", cpfCnpj: full.cpfCnpj ?? "", address: full.address ?? "", notes: full.notes ?? "" });
      }
    } catch { }
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const url = editingCustomerId ? `/api/customers/${editingCustomerId}` : "/api/customers";
      const method = editingCustomerId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) {
        setShowModal(false);
        setEditingCustomerId(null);
        setFormData({ name: "", email: "", phone: "", cpfCnpj: "", address: "", notes: "" });
        fetchCustomers();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao salvar cliente");
      }
    } catch { setError("Erro de rede."); }
    finally { setSubmitting(false); }
  };

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone ?? "").includes(searchTerm) ||
      (c.cpfCnpj ?? "").includes(searchTerm);
    const matchStatus = statusFilter === "ALL" || statusFilter === "TRASHED" || c.status === statusFilter;
    const matchSource = sourceFilter === "ALL" || c.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const sortedCustomers = [...filtered].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any = "";
    let bValue: any = "";

    switch (sortConfig.key) {
      case "cliente":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "contato":
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case "canal":
        aValue = (a.source ?? "MANUAL").toLowerCase();
        bValue = (b.source ?? "MANUAL").toLowerCase();
        break;
      case "licenca":
        aValue = getLicenseSortValue(a);
        bValue = getLicenseSortValue(b);
        break;
      case "chamados":
        aValue = (a.Ticket ?? []).filter(t => t.status !== "CLOSED").length;
        bValue = (b.Ticket ?? []).filter(t => t.status !== "CLOSED").length;
        break;
      case "ultimo_contato":
        aValue = new Date(a.interactionLogs?.[0]?.createdAt ?? a.updatedAt).getTime();
        bValue = new Date(b.interactionLogs?.[0]?.createdAt ?? b.updatedAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const statsData = [
    { label: "Total", val: customers.length, color: "text-blue-400", icon: LucideUsers },
    { label: "Ativos", val: customers.filter(c => c.status === "ACTIVE").length, color: "text-emerald-400", icon: LucideActivity },
    { label: "Leads", val: customers.filter(c => c.status === "LEAD").length, color: "text-amber-400", icon: LucideTag },
    { label: "Via WhatsApp", val: customers.filter(c => c.source === "WHATSAPP").length, color: "text-green-400", icon: LucideSmartphone },
  ];

  const statusPills: Array<{ id: StatusFilter; label: string }> = [
    { id: "ALL", label: "Todos" }, { id: "ACTIVE", label: "Ativos" },
    { id: "LEAD", label: "Leads" }, { id: "INACTIVE", label: "Inativos" },
  ];

  const sourcePills: Array<{ id: SourceFilter; label: string }> = [
    { id: "ALL", label: "Qualquer origem" }, { id: "MANUAL", label: "Manual" },
    { id: "WHATSAPP", label: "WhatsApp" }, { id: "API", label: "API" },
  ];

  return (
    <section className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <LucideUsers size={24} className={statusFilter === "TRASHED" ? "text-rose-500" : "text-blue-500"} /> 
            {statusFilter === "TRASHED" ? "Lixeira de Clientes" : "CRM · Clientes"}
          </h2>
          <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">
            {statusFilter === "TRASHED" 
              ? "Clientes inativos · auto-limpeza em 60 dias" 
              : "Base centralizada · leads · licenças · faturamento"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setStatusFilter(prev => prev === "TRASHED" ? "ALL" : "TRASHED")}
            className={`p-2.5 rounded-xl transition-all border flex items-center justify-center shrink-0 ${
              statusFilter === "TRASHED" 
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse" 
                : "bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10"
            }`}
            title={statusFilter === "TRASHED" ? "Voltar para Clientes Ativos" : "Ver Lixeira"}
          >
            <LucideTrash2 size={15} />
          </button>
          <div className="flex bg-white/5 rounded-xl p-1 shrink-0">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-blue-500 text-white" : "text-slate-500 hover:text-slate-300"}`} title="Lista">
              <LucideList size={15} />
            </button>
            <button 
              onClick={() => setViewMode("kanban")} 
              disabled={statusFilter === "TRASHED"}
              className={`p-1.5 rounded-lg transition-all ${statusFilter === "TRASHED" ? "opacity-30 cursor-not-allowed text-slate-600" : viewMode === "kanban" ? "bg-blue-500 text-white" : "text-slate-500 hover:text-slate-300"}`} 
              title={statusFilter === "TRASHED" ? "Visualização Kanban desabilitada na Lixeira" : "Kanban"}
            >
              <LucideLayoutGrid size={15} />
            </button>
          </div>
          <button onClick={() => { setEditingCustomerId(null); setFormData({ name: "", email: "", phone: "", cpfCnpj: "", address: "", notes: "" }); setShowModal(true); }}
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shrink-0">
            <LucidePlus size={14} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      {statusFilter !== "TRASHED" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statsData.map((s, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}><s.icon size={16} /></div>
              <div>
                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                <p className="text-[9px] text-slate-600 font-bold uppercase">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <LucideSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[11px] text-white outline-none focus:border-blue-500/40 w-52 transition-colors" />
        </div>
        <div className="flex gap-1">
          {statusPills.map(p => (
            <button key={p.id} onClick={() => setStatusFilter(p.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${statusFilter === p.id ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "bg-white/[0.03] text-slate-500 hover:text-slate-300 border border-transparent"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-2 pl-2 border-l border-white/5">
          {sourcePills.map(p => (
            <button key={p.id} onClick={() => setSourceFilter(p.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${sourceFilter === p.id ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-white/[0.03] text-slate-500 hover:text-slate-300 border border-transparent"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 select-none">
                  <th
                    onClick={() => requestSort("cliente")}
                    className="px-5 py-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center">
                      Cliente
                      {renderSortIcon("cliente")}
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("contato")}
                    className="px-4 py-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center">
                      Contato
                      {renderSortIcon("contato")}
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("canal")}
                    className="px-4 py-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center">
                      Canal
                      {renderSortIcon("canal")}
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("licenca")}
                    className="px-4 py-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center">
                      Licença
                      {renderSortIcon("licenca")}
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("chamados")}
                    className="px-4 py-4 text-center cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center justify-center">
                      Chamados
                      {renderSortIcon("chamados")}
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("ultimo_contato")}
                    className="px-4 py-4 cursor-pointer hover:text-white transition-colors group"
                  >
                    <div className="flex items-center">
                      Último contato
                      {renderSortIcon("ultimo_contato")}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {loading ? (
                  <tr><td colSpan={7} className="py-20 text-center">
                    <LucideActivity size={32} className="mx-auto text-slate-800 animate-spin mb-3" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Carregando...</p>
                  </td></tr>
                ) : sortedCustomers.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Nenhum cliente encontrado</p>
                  </td></tr>
                ) : sortedCustomers.map(customer => {
                  const openTickets = (customer.Ticket ?? []).filter(t => t.status !== "CLOSED").length;
                  const lastContact = customer.interactionLogs?.[0]?.createdAt ?? customer.updatedAt;
                  return (
                    <tr key={customer.id} className="group hover:bg-white/[0.015] transition-all">
                      <td className="px-5 py-3">
                        <button onClick={() => setProfileCustomerId(customer.id)} className="flex items-center gap-3 text-left">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
                            <LucideUser size={13} />
                          </div>
                          <div>
                            <p className="font-black text-[11px] text-white group-hover:text-blue-400 transition-colors uppercase">{customer.name}</p>
                            <p className="text-[9px] text-slate-600 font-mono">{customer.cpfCnpj || customer.id.slice(0, 8)}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <LucideMail size={10} className="text-blue-500/50" />
                            <span className="text-[9px] font-bold truncate max-w-[140px]">{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <LucidePhone size={10} className="text-emerald-500/50" />
                              <span className="text-[9px] font-bold">{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <SourceIcon source={customer.source} />
                          <span className={`text-[9px] font-black uppercase ${customer.source === "WHATSAPP" ? "text-emerald-400" : customer.source === "API" ? "text-blue-400" : "text-slate-500"}`}>
                            {customer.source ?? "MANUAL"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <LicenseBadge licenses={customer.licenses ?? []} webLicenses={customer.webLicenses ?? []} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {openTickets > 0 ? (
                          <button onClick={() => setProfileCustomerId(customer.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-black hover:bg-indigo-500/20 transition-colors">
                            <LucideTicket size={10} /> {openTickets}
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-700 font-bold">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] text-slate-500 font-bold">{fmtRelative(lastContact)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setProfileCustomerId(customer.id)}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-purple-500/10 text-slate-500 hover:text-purple-400 text-[9px] font-bold transition-colors">
                            360°
                          </button>
                          {statusFilter === "TRASHED" ? (
                            <>
                              <button onClick={() => handleRestoreCustomer(customer.id, customer.name)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 transition-all">
                                Restaurar
                              </button>
                              <button onClick={() => handleDeletePermanent(customer.id, customer.name)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[9px] font-bold border border-rose-500/20 transition-all">
                                <LucideTrash2 size={10} /> Excluir Definitivo
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleOpenEditModal(customer)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 text-[9px] font-bold transition-colors">
                                <LucideEdit size={10} /> Editar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start min-h-[500px]">
          {[
            { id: "LEAD", title: "Leads", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
            { id: "ACTIVE", title: "Ativos", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
            { id: "INACTIVE", title: "Inativos / Perdidos", color: "text-rose-400", border: "border-rose-500/20", bg: "bg-rose-500/5" },
          ].map(col => (
            <div key={col.id} onDrop={e => handleDrop(e, col.id)} onDragOver={handleDragOver}
              className={`flex flex-col rounded-3xl border ${col.border} ${col.bg} p-4 min-h-[200px]`}>
              <h3 className={`text-[9px] font-black uppercase tracking-widest mb-4 flex items-center justify-between ${col.color}`}>
                {col.title}
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-white text-[9px]">
                  {sortedCustomers.filter(c => c.status === col.id).length}
                </span>
              </h3>
              <div className="space-y-3">
                {sortedCustomers.filter(c => c.status === col.id).map(c => (
                  <div key={c.id} draggable onDragStart={e => handleDragStart(e, c.id)} onClick={() => setProfileCustomerId(c.id)}
                    className="glass-panel p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:border-blue-500/20 border border-white/[0.02] transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-[11px] text-white group-hover:text-blue-400 transition-colors uppercase leading-tight">{c.name}</p>
                      <div className="flex items-center gap-1">
                        <SourceIcon source={c.source} />
                        <button onClick={e => { e.stopPropagation(); handleOpenEditModal(c); }} className="text-slate-700 hover:text-white p-1 ml-1" title="Editar">
                          <LucideEdit size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-600 truncate mb-3">{c.email}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <LicenseBadge licenses={c.licenses ?? []} webLicenses={c.webLicenses ?? []} />
                      <span className="text-[8px] text-slate-700">{fmtRelative(c.updatedAt)}</span>
                    </div>
                  </div>
                ))}
                {sortedCustomers.filter(c => c.status === col.id).length === 0 && (
                  <div className="h-20 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-[9px] font-bold text-slate-700 uppercase">Soltar aqui</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative glass-panel w-full max-w-xl rounded-[2rem] border border-white/10 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
              <LucidePlus className="text-blue-500" size={20} />
              {editingCustomerId ? "Editar Cliente" : "Novo Cliente"}
            </h3>
            {error && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Nome Completo", key: "name", type: "text", required: true },
                  { label: "E-mail", key: "email", type: "email", required: true },
                  { label: "Telefone / WhatsApp", key: "phone", type: "text", required: false },
                  { label: "CPF ou CNPJ", key: "cpfCnpj", type: "text", required: false },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.label}</label>
                    <input type={f.type} required={f.required} value={(formData as any)[f.key]}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-blue-500/40 transition-colors" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Endereço</label>
                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-blue-500/40 transition-colors" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {editingCustomerId && (
                  <button type="button" onClick={() => {
                    const currentCustomer = customers.find(c => c.id === editingCustomerId);
                    if (currentCustomer) {
                      handleDeleteCustomer(currentCustomer.id, currentCustomer.name);
                    }
                  }}
                    className="sm:w-1/3 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border border-rose-500/20">
                    <LucideTrash2 size={12} /> Excluir
                  </button>
                )}
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50">
                  {submitting ? "Salvando..." : editingCustomerId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {profileCustomerId && (
        <CustomerProfile customerId={profileCustomerId} onClose={() => setProfileCustomerId(null)} />
      )}
    </section>
  );
}
