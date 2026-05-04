import { useState, useEffect, useCallback } from "react";
import { LucideGlobe, LucidePlus, LucideTrash2, LucideRefreshCcw, LucideActivity, LucideShieldCheck, LucideUser } from "lucide-react";

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
        <LucideActivity size={48} className="mx-auto text-slate-800 mb-4 animate-pulse" />
        <p className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Carregando Licenças Web...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
          <LucideGlobe className="text-blue-400" /> Licenças Web (Painel)
        </h2>
        <div className="flex gap-3">
          <button
            onClick={fetchLicenses}
            className="p-2.5 glass-panel rounded-xl text-blue-400 hover:bg-white/5 transition-all"
            title="Atualizar"
          >
            <LucideRefreshCcw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-widest uppercase rounded-xl flex items-center gap-2 transition-colors"
          >
            <LucidePlus size={16} /> Nova Licença Web
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">CLIENTE / NOME</th>
                <th className="px-6 py-4">USERNAME</th>
                <th className="px-6 py-4">PLANO & SESSÕES</th>
                <th className="px-6 py-4">VENCIMENTO</th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Nenhuma licença Web criada ainda.
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(lic.id, lic.isActive)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${lic.isActive ? "bg-emerald-500/20" : "bg-rose-500/20"}`}
                        title={lic.isActive ? "Desativar" : "Ativar"}
                      >
                        <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${lic.isActive ? "right-0.5 bg-emerald-500" : "left-0.5 bg-rose-500"}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-white">{lic.customer?.name || "Cliente Removido"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{lic.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <LucideUser size={10} className="text-slate-500" />
                        <span className="text-xs font-mono text-slate-300">{lic.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 w-max bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-300">
                          {lic.plan}
                        </span>
                        <span className="text-[10px] font-bold text-blue-400">
                          Máx: {lic.maxSessions} Conexões
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400">
                        {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString("pt-BR") : "Ilimitado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteLicense(lic.id)}
                        className="p-1.5 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                        title="Excluir"
                      >
                        <LucideTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <LucideGlobe className="text-blue-500" />
              Gerar Conta / Licença Web
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Selecionar Cliente (CRM)</label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value="">Selecione um cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nome de Exibição (Painel)</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Empresa João"
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Username (Login)</label>
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    placeholder="usuario123"
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Senha</label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Plano</label>
                  <select
                    value={formData.plan}
                    onChange={e => setFormData({...formData, plan: e.target.value})}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="PRO">PRO</option>
                    <option value="UNLIMITED">UNLIMITED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Máx. Conexões</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.maxSessions}
                    onChange={e => setFormData({...formData, maxSessions: parseInt(e.target.value)})}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vencimento (Opcional)</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]"
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
