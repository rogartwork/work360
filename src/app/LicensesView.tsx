import { useState, useEffect, useCallback } from "react";
import { 
  LucideGlobe, LucidePlus, LucideTrash2, LucideRefreshCcw, 
  LucideActivity, LucideShieldCheck, LucideUser, LucideX, 
  LucideCalendar, LucideMonitorSmartphone, LucideSearch,
  LucideArrowUpDown, LucideChevronUp, LucideChevronDown,
  LucideSettings, LucideKey, LucideCopy, LucideAlertTriangle
} from "lucide-react";

interface LicenseUnion {
  id: string;
  key?: string; // Desktop only
  customerId: string;
  customer: {
    name: string;
    email: string;
  };
  name?: string; // Web only
  username?: string; // Web only
  role?: string; // Web only
  plan: string;
  maxSessions?: number; // Web only (represents active chips)
  isActive: boolean;
  machineId?: string | null; // Desktop only (active hardware PC connection)
  expiresAt: string | null;
  lastSeenAt?: string | null; // Desktop only
  type: "DESKTOP" | "WEB";
  app: string;
}

interface Customer {
  id: string;
  name: string;
}

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

export default function LicensesView() {
  const [licenses, setLicenses] = useState<LicenseUnion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "WEB" | "DESKTOP">("ALL");

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Manage / Edit Modal state
  const [editingLicense, setEditingLicense] = useState<LicenseUnion | null>(null);
  const [editForm, setEditForm] = useState({
    plan: "PREMIUM",
    expiresAt: "",
    maxSessions: 5,
    newPassword: ""
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Simplified unified creation form state
  const [newType, setNewType] = useState<"DESKTOP" | "WEB">("DESKTOP"); // Desktop is the primary default
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newMaxSessions, setNewMaxSessions] = useState(5); // Default is 5 chips

  const fetchLicenses = useCallback(async () => {
    setRefreshing(true);
    try {
      const [resDesktop, resWeb] = await Promise.all([
        fetch("/api/desktop-licenses"),
        fetch("/api/web-licenses")
      ]);

      let desktopData: any[] = [];
      let webData: any[] = [];

      if (resDesktop.ok) desktopData = await resDesktop.json();
      if (resWeb.ok) webData = await resWeb.json();

      // Unified APP name is always "NEXUS360"
      const unified: LicenseUnion[] = [
        ...desktopData.map(l => ({ ...l, type: "DESKTOP" as const, app: "NEXUS360" })),
        ...webData.map(l => ({ ...l, type: "WEB" as const, app: "NEXUS360" }))
      ];

      setLicenses(unified);
    } catch (e) {
      console.error("Erro ao carregar licenças unificadas:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) setCustomers(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleOpenModal = () => {
    fetchCustomers();
    setSelectedCustomerId("");
    
    // Calcula a data padrão de 30 dias a partir de hoje
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const yyyy = thirtyDaysLater.getFullYear();
    const mm = String(thirtyDaysLater.getMonth() + 1).padStart(2, '0');
    const dd = String(thirtyDaysLater.getDate()).padStart(2, '0');
    const defaultDateStr = `${yyyy}-${mm}-${dd}`;
    
    setNewExpiresAt(defaultDateStr);
    setNewType("DESKTOP"); // Default creation type is always DESKTOP (primary app)
    setNewMaxSessions(5); // Pre-filled with 5 chips
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    try {
      if (newType === "DESKTOP") {
        // Create Desktop License (Primary default - Premium plan, 5 chips supported)
        const res = await fetch("/api/desktop-licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            customerId: selectedCustomerId, 
            plan: "PREMIUM", // Default unified PREMIUM plan
            expiresAt: newExpiresAt || null
          }),
        });
        if (res.ok) {
          setShowCreateModal(false);
          fetchLicenses();
        } else {
          alert("Erro ao criar licença Desktop");
        }
      } else {
        // Create Web License (Always PREMIUM plan, defaults to 5 active chips/sessions)
        const cleanName = customer.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const rand = Math.floor(100 + Math.random() * 900);
        const autoUsername = `${cleanName}${rand}`;
        const autoPassword = `work_${autoUsername}`;

        const res = await fetch("/api/web-licenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            customerId: selectedCustomerId,
            name: customer.name,
            username: autoUsername,
            password: autoPassword,
            plan: "PREMIUM",
            maxSessions: newMaxSessions,
            expiresAt: newExpiresAt || null
          }),
        });
        if (res.ok) {
          setShowCreateModal(false);
          fetchLicenses();
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Erro ao criar licença Web");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão");
    }
  };

  const toggleActive = async (lic: LicenseUnion) => {
    const endpoint = lic.type === "DESKTOP" ? "desktop-licenses" : "web-licenses";
    try {
      await fetch(`/api/${endpoint}/${lic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !lic.isActive }),
      });
      fetchLicenses();
      // If we are actively editing, update the state too
      if (editingLicense && editingLicense.id === lic.id) {
        setEditingLicense({ ...editingLicense, isActive: !lic.isActive });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Edit/Manage modal
  const handleOpenEdit = (lic: LicenseUnion) => {
    setEditingLicense(lic);
    setEditForm({
      plan: lic.plan || "PREMIUM",
      expiresAt: lic.expiresAt ? lic.expiresAt.substring(0, 10) : "",
      maxSessions: lic.maxSessions || 5, // Default/current sessions
      newPassword: ""
    });
  };

  // Save changes from Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense) return;

    setSavingEdit(true);
    const endpoint = editingLicense.type === "DESKTOP" ? "desktop-licenses" : "web-licenses";
    
    try {
      const payload: any = {
        plan: "PREMIUM", // Keep standard unified plan
        expiresAt: editForm.expiresAt || null,
        ...(editingLicense.type === "WEB" && { 
          maxSessions: editForm.maxSessions,
          ...(editForm.newPassword.trim() && { password: editForm.newPassword })
        })
      };

      const res = await fetch(`/api/${endpoint}/${editingLicense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingLicense(null);
        fetchLicenses();
      } else {
        alert("Erro ao atualizar licença");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar alterações");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteLicense = async (lic: LicenseUnion) => {
    const name = lic.customer?.name || "esta licença";
    if (!confirm(`ATENÇÃO PERIGO!\n\nTem certeza absoluta que deseja EXCLUIR a licença ${lic.type} de ${name} permanentemente?\nEsta ação não poderá ser desfeita.`)) return;
    
    const endpoint = lic.type === "DESKTOP" ? "desktop-licenses" : "web-licenses";
    try {
      const res = await fetch(`/api/${endpoint}/${lic.id}`, { method: "DELETE" });
      if (res.ok) {
        setEditingLicense(null);
        fetchLicenses();
      } else {
        alert("Erro ao excluir licença");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetMachine = async (id: string) => {
    if (!confirm("Deseja desvincular o computador desta licença? O usuário precisará logar novamente em um PC.")) return;
    try {
      const res = await fetch(`/api/desktop-licenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetMachine: true }),
      });
      if (res.ok) {
        fetchLicenses();
        if (editingLicense && editingLicense.id === id) {
          setEditingLicense({ ...editingLicense, machineId: null });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado com sucesso!");
  };

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

  // Filter licenses based on search and type filter
  const filteredLicenses = licenses.filter(lic => {
    const matchesSearch = 
      (lic.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.key || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "ALL" || lic.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Sort licenses
  const sortedLicenses = [...filteredLicenses].sort((a, b) => {
    if (!sortConfig) {
      // Default: sort by ID desc
      return b.id.localeCompare(a.id);
    }

    let aValue: any = "";
    let bValue: any = "";

    switch (sortConfig.key) {
      case "status":
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
        break;
      case "titular":
        aValue = (a.customer?.name || "").toLowerCase();
        bValue = (b.customer?.name || "").toLowerCase();
        break;
      case "app":
        aValue = a.app.toLowerCase();
        bValue = b.app.toLowerCase();
        break;
      case "tipo":
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      case "plano":
        aValue = a.plan.toLowerCase();
        bValue = b.plan.toLowerCase();
        break;
      case "chips":
        aValue = a.type === "DESKTOP" ? (a.machineId ? 1 : 0) : (a.maxSessions || 5);
        bValue = b.type === "DESKTOP" ? (b.machineId ? 1 : 0) : (b.maxSessions || 5);
        break;
      case "vencimento":
        aValue = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        bValue = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        break;
      case "origem":
        aValue = a.type === "DESKTOP" ? (a.machineId || "").toLowerCase() : (a.username || "").toLowerCase();
        bValue = b.type === "DESKTOP" ? (b.machineId || "").toLowerCase() : (b.username || "").toLowerCase();
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

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LucideActivity size={48} className="mx-auto text-blue-500/50 mb-4 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">Carregando Gestão de Licenças...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <LucideShieldCheck size={20} className="text-blue-400" /> Gestão de Licenças SaaS
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-bold">Painel Único de Licenciamento (Web & Desktop)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          
          {/* SEARCH BAR */}
          <div className="relative">
            <LucideSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, ID, chave..."
              className="w-56 bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-blue-500/50 transition-all text-slate-300"
            />
          </div>

          {/* TYPE FILTER */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {(["ALL", "DESKTOP", "WEB"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTypeFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${
                  typeFilter === filter 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {filter === "ALL" ? "TODAS" : filter}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLicenses}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-blue-400 transition-all"
            title="Atualizar Dados"
          >
            <LucideRefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          >
            <LucidePlus size={16} /> Nova Licença
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 select-none">
                
                {/* SORTABLE HEADERS */}
                <th 
                  onClick={() => requestSort("status")}
                  className="px-8 py-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center">
                    STATUS
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort("titular")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center">
                    TITULAR | ID LICENÇA
                    {renderSortIcon("titular")}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort("app")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center">
                    APP
                    {renderSortIcon("app")}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort("tipo")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center">
                    TIPO
                    {renderSortIcon("tipo")}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort("plano")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center">
                    PLANO
                    {renderSortIcon("plano")}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort("chips")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center">
                    CHIPS ATIVOS
                    {renderSortIcon("chips")}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort("vencimento")}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center">
                    VENCIMENTO
                    {renderSortIcon("vencimento")}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort("origem")}
                  className="px-8 py-4 text-right cursor-pointer hover:text-white transition-colors group"
                >
                  <div className="flex items-center justify-end">
                    ORIGEM
                    {renderSortIcon("origem")}
                  </div>
                </th>
                <th className="px-8 py-4 text-center">OPÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {sortedLicenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <LucideActivity size={40} className="mx-auto text-slate-800 mb-3 animate-pulse" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhuma licença encontrada.</p>
                  </td>
                </tr>
              ) : (
                sortedLicenses.map((lic) => {
                  const expiry = formatExpiry(lic.expiresAt);
                  return (
                    <tr key={lic.id} className={`group hover:bg-white/[0.02] transition-all duration-300 ${!lic.isActive ? "opacity-40 grayscale" : ""}`}>
                      
                      {/* STATUS TOGGLE */}
                      <td className="px-8 py-4">
                        <button
                          onClick={() => toggleActive(lic)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center status-ring border transition-all ${
                            lic.isActive 
                              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" 
                              : "text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10"
                          }`}
                          title={lic.isActive ? "Desativar Licença" : "Ativar Licença"}
                        >
                          <LucideActivity size={12} className={lic.isActive ? "animate-pulse" : ""} />
                        </button>
                      </td>

                      {/* TITULAR | ID LICENÇA */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            lic.type === "DESKTOP" 
                              ? "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white" 
                              : "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white"
                          }`}>
                            {lic.type === "DESKTOP" ? <LucideMonitorSmartphone size={12} /> : <LucideGlobe size={12} />}
                          </div>
                          <div>
                            <p className="font-black text-[12px] text-white uppercase leading-none group-hover:text-blue-400 transition-colors">
                              {lic.customer?.name || "Cliente Removido"}
                            </p>
                            {lic.type === "WEB" && lic.name && (
                              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 leading-none">
                                PAINEL: {lic.name}
                              </p>
                            )}
                            <p className="text-[8px] text-slate-600 font-mono mt-1 leading-none">
                              ID: {truncateId(lic.id)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* APP (NEXUS360) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 select-none group/logo">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.3)] border border-white/10 shrink-0 group-hover/logo:scale-110 transition-all duration-300">
                            <span className="text-[11px] font-black text-white italic tracking-tighter">N</span>
                          </div>
                          <span className="text-[10px] font-black tracking-widest text-slate-200 group-hover/logo:text-white transition-colors uppercase">
                            NEXUS<span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">360</span>
                          </span>
                        </div>
                      </td>

                      {/* TIPO */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider border ${
                          lic.type === "DESKTOP" 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {lic.type}
                        </span>
                      </td>

                      {/* PLANO (UNIFIED PREMIUM PLAN) */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                          {lic.plan || "PREMIUM"}
                        </span>
                      </td>

                      {/* CHIPS ATIVOS (Both default to 5 Active Chips capacity) */}
                      <td className="px-6 py-4">
                        {lic.type === "DESKTOP" ? (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-white leading-none">{lic.machineId ? "1" : "0"}</span>
                              <span className="text-[8px] text-slate-600 font-bold">/ 5 CHIPS</span>
                            </div>
                            <div className="w-16 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${lic.machineId ? "bg-emerald-500" : "bg-slate-700"}`}
                                style={{ width: lic.machineId ? "20%" : "0%" }} // 1 out of 5 slots used when bound
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-white leading-none">{lic.maxSessions || 5}</span>
                              <span className="text-[8px] text-slate-600 font-bold">/ {lic.maxSessions || 5} CHIPS</span>
                            </div>
                            <div className="w-16 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 bg-emerald-500`}
                                style={{ width: "100%" }}
                              />
                            </div>
                          </>
                        )}
                      </td>

                      {/* VENCIMENTO */}
                      <td className="px-6 py-4">
                        <p className={`text-[10px] font-bold leading-none ${expiry.color}`}>{expiry.text}</p>
                        <p className="text-[7px] text-slate-700 font-bold uppercase mt-1 tracking-tighter">Ciclo</p>
                      </td>

                      {/* ORIGEM */}
                      <td className="px-8 py-4 text-right">
                        {lic.type === "DESKTOP" ? (
                          lic.machineId ? (
                            <div className="flex flex-col items-end gap-1">
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                <span className="text-[8px] font-bold text-slate-500 tracking-tighter font-mono" title={lic.machineId}>
                                  PC: {lic.machineId.substring(0, 10)}...
                                </span>
                                <button
                                  onClick={() => resetMachine(lic.id)}
                                  className="text-[8px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20 hover:bg-rose-500/20 font-black transition-colors"
                                  title="Desvincular Computador"
                                >
                                  RESET
                                </button>
                              </div>
                              {lic.lastSeenAt && (
                                <p className="text-[7px] text-slate-600 font-bold uppercase">
                                  Visto: {new Date(lic.lastSeenAt).toLocaleString("pt-BR")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                              <span className="text-[8px] font-bold text-slate-600 tracking-tighter uppercase">NENHUM PC VINCULADO</span>
                            </div>
                          )
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                              <span className="text-[8px] font-bold text-slate-500 tracking-tighter font-mono">
                                USER: {lic.username}
                              </span>
                              <LucideUser size={9} className="text-slate-700" />
                            </div>
                            <p className="text-[8px] text-slate-700 font-mono">ROLE: {lic.role || 'USER'}</p>
                          </div>
                        )}
                      </td>

                      {/* OPÇÕES (EDITAR/GERENCIAR) */}
                      <td className="px-8 py-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(lic)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/30"
                          title="Gerenciar Licença"
                        >
                          <LucideSettings size={16} />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-colors"
            >
              <LucideX size={20} />
            </button>

            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <LucideShieldCheck className="text-blue-500" />
              Gerar Nova Licença SaaS
            </h3>

            <form onSubmit={handleCreate} className="space-y-5">
              
              {/* TIPO SELETOR (Desktop is the default first option) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tipo de Licença</label>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setNewType("DESKTOP")}
                    className={`flex-1 py-3.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                      newType === "DESKTOP" 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <LucideMonitorSmartphone size={14} /> Desktop (Principal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("WEB")}
                    className={`flex-1 py-3.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                      newType === "WEB" 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <LucideGlobe size={14} /> Web (Painel)
                  </button>
                </div>
              </div>

              {/* SELECIONAR CLIENTE */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Selecionar Cliente (CRM)</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#1a1c23]">Selecione um cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#1a1c23]">{c.name}</option>
                  ))}
                </select>
              </div>

              {/* CHIP LIMIT (Configurable for both, defaulting to 5 active chips) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Limite de Chips (Conexões)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newMaxSessions}
                  onChange={e => setNewMaxSessions(parseInt(e.target.value) || 5)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1.5 leading-normal">
                  * Todos os módulos ativados por padrão (Premium). {newType === "DESKTOP" ? "Computador Principal Desktop com 5 Chips ativos." : "Acesso Web Painel com 5 Chips ativos."}
                </p>
              </div>

              {/* DATA EXPIRAÇÃO */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data de Expiração (Opcional)</label>
                <input
                  type="date"
                  value={newExpiresAt}
                  onChange={e => setNewExpiresAt(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/10 hover:border-white/20"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Gerar Licença
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / MANAGE MODAL */}
      {editingLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setEditingLicense(null)}
              className="absolute top-4 right-4 text-slate-400 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-colors"
            >
              <LucideX size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <LucideSettings size={22} className="animate-spin duration-1000" style={{ animationDuration: "6s" }} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest leading-none">
                  Gerenciar Licença
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5 tracking-wider">
                  Configuração de Acesso NEXUS360
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              
              {/* DETAILS SECTION */}
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Titular CRM</span>
                  <span className="font-black text-slate-200 uppercase">{editingLicense.customer?.name || "Cliente Removido"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo / App</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      editingLicense.type === "DESKTOP" ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {editingLicense.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">NEXUS360</span>
                  </div>
                </div>
                
                {/* Desktop Specific key display */}
                {editingLicense.type === "DESKTOP" && editingLicense.key && (
                  <div className="pt-2 border-t border-white/5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Chave de Ativação</label>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300">
                      <LucideKey size={12} className="text-slate-500 shrink-0" />
                      <span className="truncate flex-1 select-all">{editingLicense.key}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(editingLicense.key || "")}
                        className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Copiar Chave"
                      >
                        <LucideCopy size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Web Specific credentials */}
                {editingLicense.type === "WEB" && editingLicense.username && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome de Login</span>
                      <span className="font-mono text-slate-300">{editingLicense.username}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* EDITABLE FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* EXPIRY */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Data de Expiração</label>
                  <input
                    type="date"
                    value={editForm.expiresAt}
                    onChange={e => setEditForm({ ...editForm, expiresAt: e.target.value })}
                    style={{ colorScheme: "dark" }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Chips configuration (Unified visual limit control) */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Limite de Chips (Conexões)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLicense.type === "WEB" ? editForm.maxSessions : 5}
                    disabled={editingLicense.type === "DESKTOP"} // Fixed to 5 for Desktop (or editable if using Web config)
                    onChange={e => setEditForm({ ...editForm, maxSessions: parseInt(e.target.value) || 5 })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                  />
                  <p className="text-[8px] text-slate-500 font-bold uppercase mt-1.5 leading-normal">
                    {editingLicense.type === "DESKTOP" 
                      ? "* A versão Desktop do NEXUS360 vem configurada para rodar com limite de 5 chips ativos por padrão."
                      : "* Acesso Web configurável de sessões do WhatsApp."
                    }
                  </p>
                </div>

                {/* Web Specific Settings: Password Reset */}
                {editingLicense.type === "WEB" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Redefinir Senha (Opcional)</label>
                    <input
                      type="password"
                      placeholder="Deixe em branco para manter"
                      value={editForm.newPassword}
                      onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Desktop Specific hardware linkage */}
                {editingLicense.type === "DESKTOP" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Hardware / Computador Ativo</label>
                    {editingLicense.machineId ? (
                      <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-[220px]">
                            ID: {editingLicense.machineId}
                          </span>
                          <span className="text-[8px] font-bold text-emerald-600 uppercase">Computador Vinculado</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => resetMachine(editingLicense.id)}
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                        >
                          Liberar PC
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl text-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Aguardando ativação em algum PC</span>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* SAVE / UPDATE BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-50"
                >
                  {savingEdit ? "Salvando Alterações..." : "Salvar Configurações"}
                </button>
              </div>

              {/* SECURE DANGER ZONE */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-rose-500">
                  <LucideAlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Zona de Perigo</span>
                </div>
                
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-rose-400 uppercase">Excluir Licença</h4>
                    <p className="text-[9px] text-slate-500 mt-1 font-bold">
                      A exclusão é permanente e interromperá imediatamente o acesso do cliente no desktop ou painel web.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteLicense(editingLicense)}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-transparent rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0"
                  >
                    Excluir Licença
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
