"use client";

import { useEffect, useState, useCallback } from "react";
import { applyZoom, STORAGE_KEY as ZOOM_KEY } from "./ZoomControl";
import {
  LucideServer,
  LucideSmartphone,
  LucideClock,
  LucideRefreshCcw,
  LucideCalendar,
  LucideUser,
  LucideChevronDown,
  LucideChevronRight,
  LucideDatabase,
  LucideShieldCheck,
  LucideLogOut,
  LucideActivity,
  LucideAlertCircle,
  LucideLayoutGrid,
  LucideList,
  LucideGlobe,
  LucideMonitorSmartphone,
  LucideMessageSquare,
  LucideInbox,
  LucideAlertOctagon,
  LucideCheckSquare,
  LucideSearch,
  LucideBarChart3
} from "lucide-react";
import { useRouter } from "next/navigation";
import LicensesView from "./LicensesView";
import UsersView from "./UsersView";
import CRMView from "./CRMView";
import SupportView from "./SupportView";
import SupportReportsView from "./SupportReportsView";
import InboxView from "./InboxView";

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
  type?: string;
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
  const [activeTab, setActiveTab] = useState<'hub' | 'web' | 'desktop' | 'licenses' | 'users' | 'crm' | 'suporte' | 'inbox'>('hub');
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [userRole, setUserRole] = useState<string>('CUSTOMER');
  const [sessionReady, setSessionReady] = useState(false);
  const [supportFilter, setSupportFilter] = useState<'UNSOLVED' | 'OPEN' | 'URGENT' | 'CLOSED' | 'ALL'>('UNSOLVED');
  const [supportSearch, setSupportSearch] = useState('');
  const [supportSubView, setSupportSubView] = useState<'tickets' | 'reports'>('tickets');
  const [supportResetKey, setSupportResetKey] = useState(0);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showZoomPanel, setShowZoomPanel] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(ZOOM_KEY);
    setZoom(saved ? parseInt(saved, 10) : 100);
  }, []);

  const handleZoom = (delta: number) => {
    setZoom(prev => {
      const levels = [70, 75, 80, 85, 90, 95, 100];
      const currentIdx = levels.indexOf(prev);
      const nextIdx = Math.max(0, Math.min(levels.length - 1, currentIdx + delta));
      const next = levels[nextIdx];
      applyZoom(next);
      localStorage.setItem(ZOOM_KEY, String(next));
      return next;
    });
  };

  // Auto-fecha o painel 2s após qualquer interação
  useEffect(() => {
    if (!showZoomPanel) return;
    const timer = setTimeout(() => setShowZoomPanel(false), 2000);
    return () => clearTimeout(timer);
  }, [showZoomPanel, zoom]);


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

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (!data.isLoggedIn) {
          router.push("/login");
          return;
        }
        setUserRole(data.role ?? 'CUSTOMER');
        setSessionReady(true);
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  }, [router]);

  const fetchTicketsCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tickets");
      if (res.ok) {
        const data = await res.json();
        const openCount = data.filter((t: any) => t.status === "OPEN").length;
        setOpenTicketsCount(openCount);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (!sessionReady) return;
    fetchLicenses();
    fetchTicketsCount();
    const timer = setInterval(() => {
      fetchLicenses();
      fetchTicketsCount();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [fetchLicenses, fetchTicketsCount, intervalMs, sessionReady]);

  useEffect(() => {
    if (activeTab !== 'hub' && activeTab !== 'suporte') {
      setIsSidebarHidden(false);
    }
  }, [activeTab]);

  const selectedOption = REFRESH_OPTIONS.find((o) => o.value === intervalMs) ?? REFRESH_OPTIONS[0];

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#131416] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Autenticando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#131416] text-slate-100 flex relative overflow-hidden selection:bg-blue-500/30">
      {/* HUD OVERLAYS */}
      <div className="noise-overlay" />
      <div className="hud-grid absolute inset-0 opacity-20" />
      {/* Linha de scanner: SÓ aparece no Hub + Modo Display */}
      {(activeTab === 'hub' && isSidebarHidden) && <div className="scanner-line" />}

      {/* SIDEBAR LATERAL */}
      <aside 
        className={`flex flex-col h-screen bg-[#0a0a0c]/95 backdrop-blur-2xl border-r border-white/5 shadow-2xl shadow-black/50 transition-all duration-300 z-50 ${isSidebarHidden ? 'fixed top-0 left-0 w-56 -translate-x-[96%] hover:translate-x-0' : 'relative w-56 shrink-0 translate-x-0'}`}
      >
        <div className="p-6 border-b border-white/[0.02] flex flex-col items-center">
          <div className="relative inline-block group mb-3">
            <img
              src="/logo.png"
              alt="WORK360"
              className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#131416] animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-[8px] text-slate-500 font-bold tracking-[0.2em] uppercase">v1.4.0</span>
            {isSimulated && (
              <span className="text-[8px] text-amber-500/80 font-bold tracking-[0.2em] uppercase animate-pulse">
                SIMULAÇÃO
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5">
          <p className="px-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3">Módulos</p>
          
          <button
            onClick={() => setActiveTab('hub')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-[10px] font-bold tracking-wider uppercase ${activeTab === 'hub' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}`}
          >
            <LucideServer size={15} /> WORK360 HUB
          </button>

          {(userRole === 'SUPER_ADMIN' || userRole === 'SUPPORT' || userRole === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-[10px] font-bold tracking-wider uppercase ${activeTab === 'inbox' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}`}
            >
              <LucideInbox size={15} /> Caixa de Entrada
            </button>
          )}

          {(userRole === 'SUPER_ADMIN' || userRole === 'SUPPORT' || userRole === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-[10px] font-bold tracking-wider uppercase ${activeTab === 'crm' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}`}
            >
              <LucideUser size={15} /> CRM / Clientes
            </button>
          )}

          <button
            onClick={() => setActiveTab('licenses')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-[10px] font-bold tracking-wider uppercase ${activeTab === 'licenses' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}`}
          >
            <LucideShieldCheck size={15} /> Gestão de Licenças
          </button>
          
          {(userRole === 'SUPER_ADMIN' || userRole === 'SUPPORT' || userRole === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-[10px] font-bold tracking-wider uppercase ${activeTab === 'users' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}`}
            >
              <LucideShieldCheck size={15} /> Gestão de Acessos
            </button>
          )}

          {(userRole === 'SUPER_ADMIN' || userRole === 'SUPPORT' || userRole === 'ADMIN') && (
            <div className="flex flex-col">
              <button
                onClick={() => setActiveTab('suporte')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-[10px] font-bold tracking-wider uppercase ${activeTab === 'suporte' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'}`}
              >
                <LucideMessageSquare size={15} className="shrink-0" /> 
                <span className="flex-1 text-left">Suporte / Tickets</span>
                {openTicketsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[8px] font-black mr-1 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse">
                    {openTicketsCount}
                  </span>
                )}
                {activeTab === 'suporte' && <LucideChevronDown size={12} className="shrink-0" />}
                {activeTab !== 'suporte' && <LucideChevronRight size={12} className="opacity-30 shrink-0" />}
              </button>

              {/* Sub-filtros — visíveis apenas quando o módulo Suporte está ativo */}
              {activeTab === 'suporte' && (
                <div className="mt-1 ml-3 pl-3 border-l border-indigo-500/20 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => { setSupportSubView('tickets'); setSupportFilter('UNSOLVED'); setSupportResetKey(k => k+1); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all ${
                      supportSubView === 'tickets' && supportFilter === 'UNSOLVED' ? 'text-indigo-300 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <LucideInbox size={12} /> Não Resolvidos
                  </button>
                  <button
                    onClick={() => { setSupportSubView('tickets'); setSupportFilter('OPEN'); setSupportResetKey(k => k+1); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all ${
                      supportSubView === 'tickets' && supportFilter === 'OPEN' ? 'text-blue-300 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <LucideActivity size={12} /> Novos / Abertos
                  </button>
                  <button
                    onClick={() => { setSupportSubView('tickets'); setSupportFilter('URGENT'); setSupportResetKey(k => k+1); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all ${
                      supportSubView === 'tickets' && supportFilter === 'URGENT' ? 'text-rose-300 bg-rose-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <LucideAlertOctagon size={12} /> Urgentes
                  </button>
                  <button
                    onClick={() => { setSupportSubView('tickets'); setSupportFilter('CLOSED'); setSupportResetKey(k => k+1); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all ${
                      supportSubView === 'tickets' && supportFilter === 'CLOSED' ? 'text-slate-300 bg-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <LucideCheckSquare size={12} /> Fechados
                  </button>
                  <button
                    onClick={() => { setSupportSubView('tickets'); setSupportFilter('ALL'); setSupportResetKey(k => k+1); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all ${
                      supportSubView === 'tickets' && supportFilter === 'ALL' ? 'text-slate-300 bg-white/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <LucideMessageSquare size={12} /> Todos
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={() => { setSupportSubView('reports'); setSupportResetKey(k => k+1); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all ${
                      supportSubView === 'reports' ? 'text-indigo-300 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <LucideBarChart3 size={12} /> Relatórios
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="px-4 pb-3 border-t border-white/[0.02] pt-4">

          {/* ZOOM — botão discreto, painel abre ao clicar */}
          {showZoomPanel && (
            <div className="flex items-center justify-between px-1 mb-2 animate-in fade-in slide-in-from-bottom-1 duration-150">
              <button
                onClick={() => handleZoom(-1)}
                disabled={zoom <= 70}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all text-sm"
              >−</button>
              <button
                onClick={() => { applyZoom(100); localStorage.setItem(ZOOM_KEY, '100'); setZoom(100); }}
                title="Restaurar 100%"
                className={`text-[9px] font-black tracking-widest transition-colors px-2 ${zoom < 100 ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-500 cursor-default'}`}
              >{zoom}%</button>
              <button
                onClick={() => handleZoom(1)}
                disabled={zoom >= 100}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all text-sm"
              >+</button>
            </div>
          )}

          {/* Botão gatilho — discreto, apenas um ícone + percentual */}
          <button
            onClick={() => setShowZoomPanel(v => !v)}
            title={`Escala da Interface: ${zoom}%`}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-1 transition-all ${
              showZoomPanel
                ? 'bg-white/5 text-slate-400 text-[9px] font-bold uppercase tracking-widest'
                : 'text-slate-600 hover:text-slate-400 hover:bg-white/[0.03]'
            }`}
          >
            <LucideMonitorSmartphone size={12} className={zoom < 100 ? 'text-indigo-400' : ''} />
            {showZoomPanel && (
              <span>Escala {zoom}%</span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <LucideLogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative z-10 h-screen overflow-y-auto scroll-smooth">
        <div className={`max-w-[1400px] mx-auto ${activeTab === 'suporte' ? 'p-4 md:p-6' : 'p-6 md:p-8 lg:p-12'}`}>

          {/* HEADER ACTION BAR */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-white mb-2">
                {activeTab === 'hub' ? 'WORK360 — Operações' :
                 activeTab === 'licenses' ? 'Gestão de Licenças' :
                    activeTab === 'crm' ? 'Gestão de Clientes' :
                  activeTab === 'suporte' ? 'Central de Suporte' :
                  activeTab === 'inbox' ? 'Caixa de Entrada' :
                      'Segurança e Acessos'}
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {activeTab === 'suporte' ? 'Fila de atendimento em tempo real' : 'Plataforma WORK360 · v1.4.0'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* BUSCA DE CHAMADOS — só aparece no módulo de Suporte */}
              {activeTab === 'suporte' && (
                <div className="relative">
                  <LucideSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    placeholder="Buscar chamado..."
                    className="w-52 bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-medium outline-none focus:border-indigo-500/50 focus:w-72 transition-all duration-300 text-slate-300"
                  />
                </div>
              )}

              {/* INTERVALO */}
              <div className="relative">
                <button
                  onClick={() => setShowIntervalPicker(!showIntervalPicker)}
                  className="px-4 py-2.5 glass-panel rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all text-slate-300"
                >
                  <LucideClock size={14} className="text-blue-400" />
                  {selectedOption.label}
                  <LucideChevronDown size={14} className={`transition-transform duration-300 ${showIntervalPicker ? "rotate-180" : ""}`} />
                </button>
                {showIntervalPicker && (
                  <div className="absolute right-0 top-full mt-2 w-40 glass-panel z-50 p-1.5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {REFRESH_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setIntervalMs(opt.value); setShowIntervalPicker(false); }}
                        className={`w-full text-left px-3 py-2 text-[10px] font-black tracking-widest uppercase rounded-lg transition-colors ${opt.value === intervalMs ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                      >
                        Sincronizar {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* MODO DISPLAY — só no hub */}
              {activeTab === 'hub' && (
                <button
                  onClick={() => setIsSidebarHidden(!isSidebarHidden)}
                  className={`px-4 py-2.5 glass-panel rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isSidebarHidden ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'text-slate-300 hover:bg-white/5'}`}
                  title="Modo Display"
                >
                  <LucideLayoutGrid size={14} />
                  {isSidebarHidden ? 'Sair do Display' : 'Modo Display'}
                </button>
              )}

              {/* VIEW TOGGLE */}
              {activeTab === 'hub' && (
                <div className="flex glass-panel p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Visão em Lista"
                  >
                    <LucideList size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Visão em Grade"
                  >
                    <LucideLayoutGrid size={16} />
                  </button>
                </div>
              )}

              <button
                onClick={fetchLicenses}
                disabled={refreshing}
                className="px-5 py-2.5 glass-panel rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all text-blue-400"
              >
                <LucideRefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Sincronizando..." : "Atualizar"}
              </button>
            </div>
          </header>

          {/* DYNAMIC CONTENT */}
          {activeTab === 'hub' ? (
            <>
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
                      <h3 className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.val}</h3>
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
                            <th className="px-8 py-3">STATUS</th>
                            <th className="px-6 py-3">TITULAR | ID LICENÇA</th>
                            <th className="px-6 py-3">APP</th>
                            <th className="px-6 py-3">TIPO</th>
                            <th className="px-6 py-3">PLANO</th>
                            <th className="px-6 py-3">CHIPS ATIVOS</th>
                            <th className="px-6 py-3">VENCIMENTO</th>
                            <th className="px-8 py-3 text-right">ORIGEM</th>
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
                                  <td className="px-8 py-2">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center status-ring border ${license.isActive ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-rose-500 border-rose-500/20 bg-rose-500/5"}`}>
                                      <LucideActivity size={12} />
                                    </div>
                                  </td>
                                  <td className="px-6 py-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                        <LucideUser size={12} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-[11px] text-white group-hover:text-blue-400 transition-colors uppercase leading-none">{license.name}</p>
                                        <p className="text-[8px] text-slate-600 font-mono mt-1">ID: {truncateId(license.id)}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-2">
                                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-[4px]">
                                      {license.sourceName?.includes('NEXUS') ? 'NEXUS360' : license.sourceName?.includes('X360') ? 'WORK360' : 'WORK360'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-2">
                                    <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider ${
                                      license.type?.includes('DESKTOP') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                      {license.type || 'WEB'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-2">
                                    <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider ${license.plan === 'GOLD' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                      license.plan === 'SILVER' ? 'bg-slate-500/10 text-slate-300 border border-slate-500/20' :
                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                      }`}>
                                      {license.plan}
                                    </span>
                                  </td>
                                  <td className="px-6 py-2">
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-none">{license.chipsOnline}</span>
                                      <span className="text-[8px] text-slate-600 font-bold">/ {license.maxSessions}</span>
                                    </div>
                                    <div className="w-16 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-1000 ${license.isActive ? "bg-emerald-500" : "bg-slate-700"}`}
                                        style={{ width: `${(license.chipsOnline / license.maxSessions) * 100}%` }}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-6 py-2">
                                    <p className={`text-[10px] font-bold leading-none ${expiry.color}`}>{expiry.text}</p>
                                    <p className="text-[7px] text-slate-700 font-bold uppercase mt-1 tracking-tighter">Ciclo</p>
                                  </td>
                                  <td className="px-8 py-2 text-right">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                      <span className="text-[8px] font-bold text-slate-500 tracking-tighter">{license.sourceName}</span>
                                      <LucideServer size={9} className="text-slate-700" />
                                    </div>
                                    <p className="text-[8px] font-mono text-slate-700 mt-1">{license.serverIp}</p>
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
                            className={`glass-panel p-4 rounded-2xl flex flex-col gap-2 relative group overflow-hidden transition-all duration-300 hover:scale-[1.02] ${!license.isActive ? "opacity-30 grayscale" : ""}`}
                          >
                            <div className="flex items-center justify-between gap-2 overflow-hidden">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 relative ${license.isActive ? "bg-emerald-500" : "bg-rose-500"}`}>
                                {license.isActive && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />}
                              </div>
                              <div className="flex flex-col overflow-hidden w-full">
                                <span className="text-[10px] font-black text-white truncate uppercase tracking-tighter w-full">
                                  {license.name}
                                </span>
                                <span className={`text-[7px] font-bold tracking-widest uppercase mt-0.5 ${
                                  license.type?.includes('DESKTOP') ? 'text-purple-400' : 'text-emerald-400'
                                }`}>
                                  {license.type || 'WEB'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-end justify-between leading-none mt-2">
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-xs font-black text-blue-400">{license.chipsOnline}</span>
                                <span className="text-[8px] text-slate-600 font-bold">/</span>
                                <span className="text-[9px] text-slate-500 font-bold">{license.maxSessions}</span>
                              </div>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm ${license.plan === 'GOLD' ? 'bg-amber-500/10 text-amber-500' :
                                license.plan === 'SILVER' ? 'bg-slate-500/10 text-slate-300' :
                                  'bg-blue-500/10 text-blue-400'
                                }`}>
                                {license.plan[0]}
                              </span>
                            </div>

                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
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
            </>
          ) : activeTab === 'licenses' ? (
            <LicensesView />
          ) : activeTab === 'crm' ? (
            <CRMView />
          ) : activeTab === 'inbox' ? (
            <InboxView />
          ) : activeTab === 'suporte' ? (
            supportSubView === 'reports'
              ? <SupportReportsView />
              : <SupportView currentViewFilter={supportFilter} onFilterChange={setSupportFilter} searchTerm={supportSearch} onSearchChange={setSupportSearch} resetKey={supportResetKey} />
          ) : (
            <UsersView />
          )}

          {/* FOOTER BAR */}
          <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-white/[0.05]">
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} WORK360 · Plataforma 360°
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-slate-100 tracking-widest uppercase">Licenças On-line</span>
              </div>
              <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest border-l border-white/[0.1] pl-8">
                Prot. de Segurança SaaS-8.5
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
