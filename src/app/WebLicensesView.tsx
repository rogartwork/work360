import { useState, useEffect, useCallback } from "react";
import { 
  LucideGlobe, LucidePlus, LucideTrash2, LucideRefreshCcw, 
  LucideActivity, LucideShieldCheck, LucideUser, LucideX, 
  LucideCalendar 
} from "lucide-react";

interface WebLicense {
  id: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
  };
  name: string;
  username: string;
  role: string;
  plan: string;
  maxSessions: number;
  isActive: boolean;
  expiresAt: string | null;
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

export default function WebLicensesView() {
  const [licenses, setLicenses] = useState<WebLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    plan: "STANDARD",
    maxSessions: 1,
    expiresAt: ""
  });

  const fetchLicenses = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/web-licenses");
      if (res.ok) setLicenses(await res.json());
    } catch (e) {
      console.error(e);
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
    setFormData({
      name: "",
      username: "",
      password: "",
      plan: "STANDARD",
      maxSessions: 1,
      expiresAt: ""
    });
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    try {
      const res = await fetch("/api/web-licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customerId: selectedCustomerId,
          ...formData
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setSelectedCustomerId("");
        fetchLicenses();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao criar licença web");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/web-licenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchLicenses();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLicense = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta licença web permanentemente?")) return;
    try {
      await fetch(`/api/web-licenses/${id}`, { method: "DELETE" });
      fetchLicenses();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LucideActivity size={48} className="mx-auto text-blue-500/50 mb-4 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">Carregando Licenças Web...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <LucideGlobe size={20} className="text-blue-400" /> Licenças Web
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-bold">Gestão de Licenças e Contas Web de Clientes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLicenses}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-blue-400 transition-all"
            title="Atualizar"
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
              <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                <th className="px-8 py-4">STATUS</th>
                <th className="px-6 py-4">TITULAR | ID LICENÇA</th>
                <th className="px-6 py-4">APP</th>
                <th className="px-6 py-4">TIPO</th>
                <th className="px-6 py-4">PLANO</th>
                <th className="px-6 py-4">CHIPS ATIVOS</th>
                <th className="px-6 py-4">VENCIMENTO</th>
                <th className="px-8 py-4 text-right">ORIGEM</th>
                <th className="px-8 py-4 text-center">OPÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <LucideActivity size={40} className="mx-auto text-slate-800 mb-3 animate-pulse" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhuma licença Web criada ainda.</p>
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => {
                  const expiry = formatExpiry(lic.expiresAt);
                  return (
                    <tr key={lic.id} className={`group hover:bg-white/[0.02] transition-all duration-300 ${!lic.isActive ? "opacity-40 grayscale" : ""}`}>
                      
                      {/* STATUS TOGGLE */}
                      <td className="px-8 py-4">
                        <button
                          onClick={() => toggleActive(lic.id, lic.isActive)}
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
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                            <LucideUser size={12} />
                          </div>
                          <div>
                            <p className="font-black text-[12px] text-white uppercase leading-none group-hover:text-blue-400 transition-colors">
                              {lic.customer?.name || "Cliente Removido"}
                            </p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 leading-none">
                              PAINEL: {lic.name}
                            </p>
                            <p className="text-[8px] text-slate-600 font-mono mt-1 leading-none">
                              ID: {truncateId(lic.id)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* APP */}
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-[4px]">
                          WORK360 WEB
                        </span>
                      </td>

                      {/* TIPO */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          WEB
                        </span>
                      </td>

                      {/* PLANO */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider ${
                          lic.plan === 'GOLD' || lic.plan === 'UNLIMITED' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          lic.plan === 'SILVER' || lic.plan === 'PRO' ? 'bg-slate-500/10 text-slate-300 border-slate-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {lic.plan}
                        </span>
                      </td>

                      {/* CHIPS ATIVOS */}
                      <td className="px-6 py-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-white leading-none">{lic.maxSessions}</span>
                          <span className="text-[8px] text-slate-600 font-bold">/ {lic.maxSessions} CHIPS</span>
                        </div>
                        <div className="w-16 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 bg-emerald-500`}
                            style={{ width: "100%" }}
                          />
                        </div>
                      </td>

                      {/* VENCIMENTO */}
                      <td className="px-6 py-4">
                        <p className={`text-[10px] font-bold leading-none ${expiry.color}`}>{expiry.text}</p>
                        <p className="text-[7px] text-slate-700 font-bold uppercase mt-1 tracking-tighter">Ciclo</p>
                      </td>

                      {/* ORIGEM */}
                      <td className="px-8 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                          <span className="text-[8px] font-bold text-slate-500 tracking-tighter font-mono">
                            USER: {lic.username}
                          </span>
                          <LucideUser size={9} className="text-slate-700" />
                        </div>
                        <p className="text-[8px] text-slate-700 font-mono mt-1">ROLE: {lic.role || 'USER'}</p>
                      </td>

                      {/* OPÇÕES */}
                      <td className="px-8 py-4 text-center">
                        <button
                          onClick={() => deleteLicense(lic.id)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
                          title="Remover Conta Web"
                        >
                          <LucideTrash2 size={16} />
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
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-colors"
            >
              <LucideX size={20} />
            </button>

            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <LucideGlobe className="text-blue-500" />
              Gerar Conta / Licença Web
            </h3>

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="col-span-1 md:col-span-2">
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

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nome de Exibição (Painel)</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Empresa João"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Username (Login)</label>
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    placeholder="usuario123"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Senha</label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Plano de Licença</label>
                  <select
                    value={formData.plan}
                    onChange={e => setFormData({...formData, plan: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="STANDARD" className="bg-[#1a1c23]">STANDARD</option>
                    <option value="PRO" className="bg-[#1a1c23]">PRO</option>
                    <option value="UNLIMITED" className="bg-[#1a1c23]">UNLIMITED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Máximo de Conexões</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.maxSessions}
                    onChange={e => setFormData({...formData, maxSessions: parseInt(e.target.value)})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Vencimento (Opcional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:border-blue-500 outline-none transition-all"
                  />
                </div>

              </div>

              <div className="flex gap-3 pt-6">
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
                  Criar Conta Web
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
