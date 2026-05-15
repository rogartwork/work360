"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LucideBarChart3, LucideDownload, LucideCheckCircle,
  LucideMessageSquare, LucideAlertCircle, LucideClock,
  LucideUsers, LucideTrendingUp, LucideRefreshCcw
} from "lucide-react";

export default function SupportReportsView() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "clientes" | "historico">("overview");

  useEffect(() => {
    fetch("/api/admin/tickets")
      .then(r => r.ok ? r.json() : [])
      .then(d => { setTickets(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "OPEN").length;
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length;
    const closed = tickets.filter(t => t.status === "CLOSED").length;
    const urgent = tickets.filter(t => t.priority === "URGENT" && t.status !== "CLOSED").length;
    const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    // Avg resolution time (hours) from createdAt to updatedAt for closed tickets
    const closedTickets = tickets.filter(t => t.status === "CLOSED");
    const avgHours = closedTickets.length > 0
      ? Math.round(closedTickets.reduce((acc, t) => {
          const diff = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
          return acc + diff / 3600000;
        }, 0) / closedTickets.length)
      : 0;

    // By priority
    const byPriority = { URGENT: 0, HIGH: 0, NORMAL: 0, LOW: 0 } as Record<string, number>;
    tickets.forEach(t => { byPriority[t.priority] = (byPriority[t.priority] || 0) + 1; });

    // By customer
    const byCustomer: Record<string, { name: string; total: number; open: number; closed: number }> = {};
    tickets.forEach(t => {
      const key = t.customer?.email || "unknown";
      if (!byCustomer[key]) byCustomer[key] = { name: t.customer?.name || "—", total: 0, open: 0, closed: 0 };
      byCustomer[key].total++;
      if (t.status === "CLOSED") byCustomer[key].closed++;
      else byCustomer[key].open++;
    });

    return { total, open, inProgress, closed, urgent, resolutionRate, avgHours, byPriority, byCustomer };
  }, [tickets]);

  const exportCSV = (type: "all" | "open" | "closed") => {
    const filtered = type === "all" ? tickets : tickets.filter(t =>
      type === "open" ? t.status !== "CLOSED" : t.status === "CLOSED"
    );
    const headers = ["ID", "Assunto", "Cliente", "Email", "Status", "Prioridade", "Criado em", "Atualizado em"];
    const rows = filtered.map(t => [
      t.id.slice(0, 8).toUpperCase(),
      `"${t.subject}"`,
      t.customer?.name || "—",
      t.customer?.email || "—",
      t.status,
      t.priority || "—",
      new Date(t.createdAt).toLocaleString("pt-BR"),
      new Date(t.updatedAt).toLocaleString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_suporte_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center text-indigo-500">
      <LucideRefreshCcw size={28} className="animate-spin" />
    </div>
  );

  const kpis = [
    { label: "Total de Chamados", value: stats.total, icon: LucideMessageSquare, color: "text-slate-300", bg: "bg-white/5" },
    { label: "Abertos",           value: stats.open,   icon: LucideAlertCircle,  color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Pendentes",         value: stats.inProgress, icon: LucideClock,   color: "text-amber-400",  bg: "bg-amber-500/10" },
    { label: "Resolvidos",        value: stats.closed, icon: LucideCheckCircle,  color: "text-emerald-400",bg: "bg-emerald-500/10" },
    { label: "Urgentes Ativos",   value: stats.urgent, icon: LucideAlertCircle,  color: "text-rose-400",   bg: "bg-rose-500/10" },
    { label: "Taxa de Resolução", value: `${stats.resolutionRate}%`, icon: LucideTrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  ];

  const priorityConfig: Record<string, { label: string; color: string }> = {
    URGENT: { label: "Urgente", color: "bg-rose-500" },
    HIGH:   { label: "Alta",    color: "bg-amber-500" },
    NORMAL: { label: "Normal",  color: "bg-blue-500" },
    LOW:    { label: "Baixa",   color: "bg-slate-600" },
  };

  const topCustomers = Object.values(stats.byCustomer)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const recentClosed = [...tickets]
    .filter(t => t.status === "CLOSED")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <LucideBarChart3 size={18} className="text-indigo-400" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Relatórios</h2>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest">Central de Suporte · {stats.total} chamados no total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV("all")}    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"><LucideDownload size={11} /> Todos</button>
          <button onClick={() => exportCSV("open")}   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"><LucideDownload size={11} /> Abertos</button>
          <button onClick={() => exportCSV("closed")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/8 hover:bg-emerald-500/15 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 transition-all"><LucideDownload size={11} /> Resolvidos</button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-6 gap-3 mb-5 shrink-0">
        {kpis.map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl border border-white/5 p-4 flex flex-col gap-2`}>
            <k.icon size={14} className={k.color} />
            <p className="text-xl font-black text-white">{k.value}</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 mb-4 shrink-0">
        {(["overview","clientes","historico"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "text-slate-600 hover:text-slate-400 hover:bg-white/5"
            }`}
          >
            {tab === "overview" ? "Visão Geral" : tab === "clientes" ? "Por Cliente" : "Histórico"}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-4">

          {/* Distribuição por Status */}
          <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4">Distribuição por Status</p>
            <div className="space-y-3">
              {[
                { label: "Abertos",   value: stats.open,       color: "bg-blue-500",    pct: stats.total > 0 ? (stats.open / stats.total) * 100 : 0 },
                { label: "Pendentes", value: stats.inProgress, color: "bg-amber-500",   pct: stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0 },
                { label: "Resolvidos",value: stats.closed,     color: "bg-emerald-500", pct: stats.total > 0 ? (stats.closed / stats.total) * 100 : 0 },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                    <span className="text-[9px] font-black text-slate-300">{s.value} <span className="text-slate-600">({s.pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Prioridade */}
          <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4">Distribuição por Prioridade</p>
            <div className="space-y-3">
              {Object.entries(priorityConfig).map(([key, cfg]) => {
                const count = stats.byPriority[key] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</span>
                      <span className="text-[9px] font-black text-slate-300">{count} <span className="text-slate-600">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${cfg.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Métricas de Desempenho */}
          <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-5 col-span-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4">Métricas de Desempenho</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Tempo Médio de Resolução", value: stats.avgHours > 0 ? `${stats.avgHours}h` : "—" },
                { label: "Taxa de Resolução",        value: `${stats.resolutionRate}%` },
                { label: "Chamados por Resolver",    value: stats.open + stats.inProgress },
                { label: "Urgentes Sem Resposta",    value: stats.urgent },
              ].map(m => (
                <div key={m.label} className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  <p className="text-2xl font-black text-white mb-1">{m.value}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Por Cliente ── */}
      {activeTab === "clientes" && (
        <div className="bg-[#0a0a0c] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <LucideUsers size={13} className="text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Volume de Chamados por Cliente</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-600">Cliente</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-slate-600">Total</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-slate-600">Abertos</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-slate-600">Resolvidos</th>
                <th className="px-5 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-600 w-40">Volume</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-700 text-[9px] uppercase tracking-widest">Sem dados</td></tr>
              ) : topCustomers.map((c, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-xs font-bold text-white">{c.name}</td>
                  <td className="px-5 py-3 text-right text-xs font-black text-slate-300">{c.total}</td>
                  <td className="px-5 py-3 text-right text-[10px] font-black text-blue-400">{c.open}</td>
                  <td className="px-5 py-3 text-right text-[10px] font-black text-emerald-400">{c.closed}</td>
                  <td className="px-5 py-3">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.total / (topCustomers[0]?.total || 1)) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Histórico ── */}
      {activeTab === "historico" && (
        <div className="bg-[#0a0a0c] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Chamados Recentemente Resolvidos</span>
            <button onClick={() => exportCSV("closed")} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
              <LucideDownload size={10} /> Exportar CSV
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-600">ID</th>
                <th className="px-5 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-600">Assunto</th>
                <th className="px-5 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-600">Cliente</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-slate-600">Tempo Resolução</th>
                <th className="px-5 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-slate-600">Fechado em</th>
              </tr>
            </thead>
            <tbody>
              {recentClosed.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-700 text-[9px] uppercase tracking-widest">Nenhum chamado resolvido ainda</td></tr>
              ) : recentClosed.map(t => {
                const hrs = Math.round((new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / 3600000);
                return (
                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-[9px] font-black text-slate-600 font-mono">#{t.id.slice(0,6).toUpperCase()}</td>
                    <td className="px-5 py-3 text-xs font-bold text-white max-w-xs truncate">{t.subject}</td>
                    <td className="px-5 py-3 text-[10px] text-slate-400">{t.customer?.name || "—"}</td>
                    <td className="px-5 py-3 text-right text-[10px] font-black text-emerald-400">{hrs > 0 ? `${hrs}h` : "<1h"}</td>
                    <td className="px-5 py-3 text-right text-[9px] text-slate-600">{new Date(t.updatedAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
