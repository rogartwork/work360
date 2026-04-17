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
  LucideShieldCheck,
  LucideLogOut,
  LucideActivity,
  LucideCpu,
  LucideAlertCircle,
  LucideLayoutGrid,
  LucideList
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  isSimulated?: boolean;
}

const REFRESH_OPTIONS = [
  { label: "30S", value: 30000 },
  { label: "1M", value: 60000 },
  { label: "5M", value: 300000 },
  { label: "10M", value: 600000 },
];

function formatExpiry(iso: string | null) {
  if (!iso) return { text: "ILIMITADO", color: "text-emerald-400", urgent: false };
  const d = new Date(iso);
  const now = new Date();
  const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { text: `EXPIRADO`, color: "text-rose-500", urgent: true };
  if (daysLeft <= 7) return { text: `${daysLeft}D RESTANTES`, color: "text-amber-400", urgent: true };
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
  const [intervalMs, setIntervalMs] = useState(60000);
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const router = useRouter();

  const isSimulated = licenses.some(l => l.isSimulated);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Erro no Logout:", err);
    }
  };

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
    <main className="min-h-screen bg-[#131416] text-slate-100 relative overflow-x-hidden selection:bg-blue-500/30">
      {/* HUD OVERLAYS */}
      <div className="noise-overlay" />
      <div className="hud-grid absolute inset-0 opacity-20" />
      <div className="scanner-line" />

      <div className="relative z-10 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">

        {/* HEADER / HUD TOP */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <img
                src="/logo.svg"
                alt="Nexus Hub Logo"
                className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#131416] animate-pulse" />
            </div>
            <div className="h-10 w-[1px] bg-white/10 mx-2 hidden lg:block" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold rounded">V3.0.1</span>
                {isSimulated && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-bold rounded animate-pulse">
                    <LucideAlertCircle size={12} /> MODO DE SIMULAÇÃO
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[8px] font-bold tracking-[0.3em] uppercase opacity-70">Inteligência Central & Monitoramento de Licenças</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* INTERVALO  */}
            <div className="relative">
              <button
                onClick={() => setShowIntervalPicker(!showIntervalPicker)}
                className="px-4 py-2.5 glass-panel rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-all"
              >
                <LucideClock size={16} className="text-blue-400" />
                {selectedOption.label}
                <LucideChevronDown size={14} className={`transition-transform duration-300 ${showIntervalPicker ? "rotate-180" : ""}`} />
              </button>
              {showIntervalPicker && (
                <div className="absolute right-0 top-full mt-2 w-40 glass-panel z-50 p-1.5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {REFRESH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setIntervalMs(opt.value); setShowIntervalPicker(false); }}
                      className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-lg transition-colors ${opt.value === intervalMs ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      ATUALIZAR {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* VIEW TOGGLE */}
            <div className="flex glass-panel p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                title="Visão em Lista"
              >
                <LucideList size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                title="Visão em Grade"
              >
                <LucideLayoutGrid size={18} />
              </button>
            </div>

            <button
              onClick={fetchLicenses}
              disabled={refreshing}
              className="px-4 py-2.5 glass-panel rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-all text-blue-400"
            >
              <LucideRefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "LENDO..." : "SINC"}
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 glass-panel rounded-xl text-rose-400 hover:bg-rose-500/10 border-rose-500/20 transition-all"
              title="Sair"
            >
              <LucideLogOut size={18} />
            </button>
          </div>
        </header>

        {/* METRICS HUD */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "LICENÇAS", val: licenses.length, icon: LucideShieldCheck, color: "text-blue-400" },
            { label: "CHIPS ATIVOS", val: licenses.reduce((acc, l) => acc + l.chipsOnline, 0), icon: LucideSmartphone, color: "text-emerald-400" },
            { label: "CONEXÕES DE BANCO", val: new Set(licenses.map(l => l.sourceDbId)).size, icon: LucideDatabase, color: "text-purple-400" },
            { label: "ÚLTIMA ATUALIZAÇÃO", val: lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: LucideActivity, color: "text-blue-400" }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl flex items-center justify-between group overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <stat.icon size={100} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className={`text-3xl font-black tracking-tight ${stat.color} glow-text`}>{stat.val}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          ))}
        </section>

        {/* NODES MONITOR CONTENT */}
        <section>
          {viewMode === 'list' ? (
            <div className="glass-panel rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      <th className="px-8 py-2">STATUS</th>
                      <th className="px-6 py-2">TITULAR | ID LICENÇA</th>
                      <th className="px-6 py-2">PLANO</th>
                      <th className="px-6 py-2">CHIPS ATIVOS</th>
                      <th className="px-6 py-2">VENCIMENTO</th>
                      <th className="px-8 py-2 text-right">ORIGEM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {licenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-24 text-center">
                          <LucideActivity size={48} className="mx-auto text-slate-800 mb-4 animate-pulse" />
                          <p className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Analisando Fluxos de Dados...</p>
                        </td>
                      </tr>
                    ) : (
                      licenses.map((license) => {
                        const expiry = formatExpiry(license.expiresAt);
                        return (
                          <tr
                            key={license.id}
                            className={`group hover:bg-white/[0.02] transition-all duration-300 ${!license.isActive ? "opacity-40 grayscale" : ""}`}
                          >
                            <td className="px-8 py-1">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center status-ring border ${license.isActive ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-rose-500 border-rose-500/20 bg-rose-500/5"}`}>
                                <LucideActivity size={12} />
                              </div>
                            </td>
                            <td className="px-6 py-1">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                  <LucideUser size={10} />
                                </div>
                                <div>
                                  <p className="font-bold text-[11px] text-white group-hover:text-blue-400 transition-colors uppercase leading-none">{license.name}</p>
                                  <p className="text-[8px] text-slate-600 font-mono mt-0.5">ID: {truncateId(license.id)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-1">
                              <span className={`px-1.5 py-0 rounded-[2px] text-[8px] font-black uppercase tracking-wider ${license.plan === 'GOLD' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                license.plan === 'SILVER' ? 'bg-slate-500/10 text-slate-300 border border-slate-500/20' :
                                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                {license.plan}
                              </span>
                            </td>
                            <td className="px-6 py-1">
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-none">{license.chipsOnline}</span>
                                <span className="text-[8px] text-slate-600 font-bold">/ {license.maxSessions}</span>
                              </div>
                              <div className="w-16 h-0.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ${license.isActive ? "bg-emerald-500" : "bg-slate-700"}`}
                                  style={{ width: `${(license.chipsOnline / license.maxSessions) * 100}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-1">
                              <p className={`text-[10px] font-bold leading-none ${expiry.color}`}>{expiry.text}</p>
                              <p className="text-[7px] text-slate-700 font-bold uppercase mt-0.5 tracking-tighter">Ciclo</p>
                            </td>
                            <td className="px-8 py-1 text-right">
                              <div className="inline-flex items-center gap-1.5 px-1.5 py-0 rounded-md bg-white/5 border border-white/5">
                                <span className="text-[8px] font-bold text-slate-500 tracking-tighter">{license.sourceName}</span>
                                <LucideServer size={9} className="text-slate-700" />
                              </div>
                              <p className="text-[8px] font-mono text-slate-700 mt-0.5">{license.serverIp}</p>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {licenses.length === 0 ? (
                <div className="col-span-full py-24 glass-panel rounded-3xl flex flex-col items-center justify-center">
                  <LucideActivity size={48} className="text-slate-800 mb-4 animate-pulse" />
                  <p className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Analisando Fluxos de Dados...</p>
                </div>
              ) : (
                licenses.map((license) => {
                  const percentage = (license.chipsOnline / license.maxSessions) * 100;
                  return (
                    <div
                      key={license.id}
                      className={`glass-panel p-3 rounded-2xl flex flex-col gap-2 relative group overflow-hidden transition-all duration-300 hover:scale-[1.02] ${!license.isActive ? "opacity-30 grayscale" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2 overflow-hidden">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 relative ${license.isActive ? "bg-emerald-500" : "bg-rose-500"}`}>
                          {license.isActive && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />}
                        </div>
                        <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter w-full">
                          {license.name}
                        </span>
                      </div>

                      <div className="flex items-end justify-between leading-none mt-1">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs font-black text-blue-400">{license.chipsOnline}</span>
                          <span className="text-[8px] text-slate-600 font-bold">/</span>
                          <span className="text-[9px] text-slate-500 font-bold">{license.maxSessions}</span>
                        </div>
                        <span className={`text-[8px] font-black px-1 rounded-sm ${license.plan === 'GOLD' ? 'bg-amber-500/10 text-amber-500' :
                          license.plan === 'SILVER' ? 'bg-slate-500/10 text-slate-300' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                          {license.plan[0]}
                        </span>
                      </div>

                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${license.isActive ? "bg-emerald-500/50" : "bg-slate-700"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* FOOTER BAR */}
        <footer className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-white/[0.05]">
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} NexusHUB / Arquitetura Multi-Licenças - por WorkManos
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-slate-100 tracking-widest uppercase">Licenças On-line</span>
            </div>
            <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest border-l border-white/[0.1] pl-8">
              Prot. de Segurança 8.4-B
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
