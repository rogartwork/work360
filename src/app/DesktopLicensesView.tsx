import { useState, useEffect, useCallback } from "react";
import { LucideKey, LucidePlus, LucideTrash2, LucideRefreshCcw, LucideActivity, LucideMonitorSmartphone, LucideShieldCheck } from "lucide-react";

interface DesktopLicense {
  id: string;
  key: string;
  clientName: string;
  plan: string;
  isActive: boolean;
  machineId: string | null;
  expiresAt: string | null;
  lastSeenAt: string | null;
}

export default function DesktopLicensesView() {
  const [licenses, setLicenses] = useState<DesktopLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newPlan, setNewPlan] = useState("STANDARD");

  const fetchLicenses = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/desktop-licenses");
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      const res = await fetch("/api/desktop-licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: newClientName, plan: newPlan }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewClientName("");
        fetchLicenses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/desktop-licenses/${id}`, {
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
    if (!confirm("Tem certeza que deseja excluir esta licença permanentemente?")) return;
    try {
      await fetch(`/api/desktop-licenses/${id}`, { method: "DELETE" });
      fetchLicenses();
    } catch (e) {
      console.error(e);
    }
  };

  const resetMachine = async (id: string) => {
    if (!confirm("Deseja desvincular o computador desta licença? O usuário precisará logar novamente em um PC.")) return;
    try {
      await fetch(`/api/desktop-licenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetMachine: true }),
      });
      fetchLicenses();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LucideActivity size={48} className="mx-auto text-slate-800 mb-4 animate-pulse" />
        <p className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Carregando Licenças Desktop...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
          <LucideMonitorSmartphone className="text-blue-400" /> Licenças Desktop
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
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-widest uppercase rounded-xl flex items-center gap-2 transition-colors"
          >
            <LucidePlus size={16} /> Nova Licença
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">CLIENTE / CHAVE</th>
                <th className="px-6 py-4">PLANO</th>
                <th className="px-6 py-4">MÁQUINA VINCULADA</th>
                <th className="px-6 py-4">ÚLTIMA VEZ ONLINE</th>
                <th className="px-6 py-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Nenhuma licença Desktop criada ainda.
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
                      <p className="font-bold text-sm text-white">{lic.clientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <LucideKey size={10} className="text-slate-500" />
                        <span className="text-xs font-mono text-slate-400 select-all">{lic.key}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-300">
                        {lic.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lic.machineId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400" title={lic.machineId}>
                            {lic.machineId.substring(0, 12)}...
                          </span>
                          <button
                            onClick={() => resetMachine(lic.id)}
                            className="text-[9px] px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500/20"
                          >
                            RESET
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-bold">Aguardando Vinculação</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">
                        {lic.lastSeenAt ? new Date(lic.lastSeenAt).toLocaleString("pt-BR") : "Nunca"}
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
          <div className="bg-[#111111] border border-white/10 p-6 rounded-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <LucideShieldCheck className="text-blue-500" />
              Gerar Licença Desktop
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nome do Cliente/Empresa</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                  placeholder="Ex: Agência X"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Plano</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="PRO">PRO</option>
                  <option value="UNLIMITED">UNLIMITED</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Gerar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
