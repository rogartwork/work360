"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LucideServer,
  LucideSmartphone,
  LucideClock,
  LucideRefreshCcw,
  LucideCalendar,
  LucideUser,
  LucideChevronDown,
  LucideDatabase,
  LucideShieldCheck
} from "lucide-react";

interface License {
  sourceDbId: string;
  sourceName: string;
  id: string;
  name: string;
  role: string;
  maxSessions: number;
  expiresAt: string | null;
  isActive: boolean;
  plan: string;
  chipsConfigured: number;
  chipsOnline: number;
  serverIp: string;
}

const REFRESH_OPTIONS = [
  { label: "10 seg", value: 10000 },
  { label: "30 seg", value: 30000 },
  { label: "1 min", value: 60000 },
  { label: "3 min", value: 180000 },
];

function formatExpiry(iso: string | null) {
  if (!iso) return { text: "Sem Vencimento", color: "text-emerald-400", urgent: false };
  const d = new Date(iso);
  const now = new Date();
  const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { text: `Expirada`, color: "text-rose-500", urgent: true };
  if (daysLeft <= 7) return { text: `${daysLeft}d restantes`, color: "text-amber-400", urgent: true };
  return { text: d.toLocaleDateString("pt-BR"), color: "text-slate-400", urgent: false };
}

function truncateId(id: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

export default function HubDashboard() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [intervalMs, setIntervalMs] = useState(10000);
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);

  const fetchLicenses = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/licenses", { cache: "no-store" });
      if (res.ok) {
        setLicenses(await res.json());
        setLastRefresh(new Date());
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenses();
    const timer = setInterval(fetchLicenses, intervalMs);
    return () => clearInterval(timer);
  }, [fetchLicenses, intervalMs]);

  const selectedOption = REFRESH_OPTIONS.find((o) => o.value === intervalMs) ?? REFRESH_OPTIONS[0];

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
            NEXUS HUB
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">
            Central de Leitura e Monitoramento de Licenças Ativas
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <LucideUser size={14} className="text-indigo-400" />
            <span className="text-sm font-bold text-white">{licenses.length}</span>
            <span className="text-xs text-slate-500">Licenças</span>
          </div>

          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <LucideSmartphone size={14} className="text-emerald-400" />
            <span className="text-sm font-bold text-white">
              {licenses.reduce((acc, l) => acc + l.chipsOnline, 0)}
            </span>
            <span className="text-xs text-slate-500">Chips Online</span>
          </div>

          {/* Interval Picker */}
          <div className="relative">
            <button
              onClick={() => setShowIntervalPicker(!showIntervalPicker)}
              className="glass-card px-4 py-2 flex items-center gap-2 hover:border-indigo-500/40 transition-colors text-slate-300"
            >
              <LucideClock size={13} className="text-indigo-400" />
              <span className="text-xs font-bold">{selectedOption.label}</span>
              <LucideChevronDown size={12} className={`transition-transform ${showIntervalPicker ? "rotate-180" : ""}`} />
            </button>
            {showIntervalPicker && (
              <div className="absolute right-0 top-full mt-1 z-50 glass-card p-1 min-w-[130px] shadow-xl shadow-black/50">
                {REFRESH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setIntervalMs(opt.value); setShowIntervalPicker(false); }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                      opt.value === intervalMs
                        ? "bg-indigo-500/20 text-indigo-300 font-bold"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Now */}
          <button
            onClick={fetchLicenses}
            disabled={refreshing}
            className="glass-card px-4 py-2 flex items-center gap-2 text-slate-400 hover:text-indigo-300 transition-colors disabled:opacity-40"
          >
            <LucideRefreshCcw size={14} className={refreshing ? "animate-spin text-indigo-400" : ""} />
            <span className="text-xs font-mono" suppressHydrationWarning>{lastRefresh.toLocaleTimeString()}</span>
          </button>
        </div>
      </header>

      {/* Table Header */}
      {licenses.length > 0 && (
        <div className="grid grid-cols-[auto_1fr_80px_100px_140px_120px] gap-4 px-4 mb-2 text-[9px] text-slate-600 uppercase font-bold tracking-widest">
          <div>Status</div>
          <div>Titular | ID da Licença</div>
          <div>Plano</div>
          <div>Chips Ativos</div>
          <div>Vencimento</div>
          <div className="text-right">Locação (DB)</div>
        </div>
      )}

      {/* License Rows */}
      <div className="space-y-2">
        {licenses.length === 0 ? (
          <div className="py-24 text-center glass-card">
            <LucideDatabase size={44} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-slate-400 font-bold">Nenhuma licença encontrada</h3>
            <p className="text-slate-600 text-sm mt-1">Verifique as conexões configuradas com os bancos de dados X360C.</p>
          </div>
        ) : (
          licenses.map((license) => {
            const expiry = formatExpiry(license.expiresAt);
            return (
              <div
                key={license.id}
                className={`glass-card px-4 py-3 grid grid-cols-[auto_1fr_80px_100px_140px_120px] gap-4 items-center transition-all ${!license.isActive ? "opacity-50" : ""}`}
              >
                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    license.isActive ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500"
                  }`} />
                </div>

                {/* Name + ID (Requested by user) */}
                <div className="min-w-0 flex items-center gap-2">
                  <LucideUser size={12} className="text-indigo-400 shrink-0" />
                  <span className="text-sm font-black text-white truncate w-max">
                    {license.name}
                  </span>
                  <span className="text-slate-600 mx-1">|</span>
                  <LucideShieldCheck size={11} className="text-slate-500 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-400 truncate" title={license.id}>
                    ID: {truncateId(license.id)}
                  </span>
                </div>

                {/* Plano */}
                <div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    license.plan === 'GOLD' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' :
                    license.plan === 'SILVER' ? 'text-slate-300 border-slate-300/30 bg-slate-300/5' :
                    'text-orange-400 border-orange-400/30 bg-orange-400/5'
                  }`}>
                    {license.plan}
                  </span>
                </div>

                {/* Chips */}
                <div className="flex items-center gap-1.5">
                  <LucideSmartphone size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-sm font-mono font-bold text-white">
                    {license.chipsOnline}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    / {license.maxSessions}
                  </span>
                </div>

                {/* Vencimento */}
                <div className="flex items-center gap-1.5">
                  <LucideCalendar size={11} className="text-slate-600 shrink-0" />
                  <span className={`text-xs font-bold ${expiry.color}`}>
                    {expiry.text}
                  </span>
                </div>

                {/* Localização */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <LucideServer size={10} className="text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-400">{license.sourceName}</span>
                  </div>
                  <span className="text-[9px] text-slate-600 font-mono mt-0.5">{license.serverIp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="mt-8 text-center text-[10px] text-slate-700 font-bold uppercase tracking-widest">
        NEXUS HUB — Leitor Direto Multi-Database
      </footer>
    </main>
  );
}
