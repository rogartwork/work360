import { useState, useEffect, useCallback } from "react";
import { 
  LucidePlus, LucideDatabase, LucideBrain, LucideMessageSquare, 
  LucideMonitorPlay, LucideEdit, LucideTrash2, LucideX, LucideUsers, 
  LucideShieldCheck, LucideActivity, LucideSettings
} from "lucide-react";

export default function AdminView({ user }: { user: any }) {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    phone: "",
    city: "",
    plan: "BRONZE",
    maxSessions: 1,
    expiresAt: "",
    allowWarmup: true,
    allowInclusion: true,
    allowMessager: true,
    allowDisplay: true,
  });

  const fetchAdminUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin-users");
      if (res.ok) setAdminUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + "!";
  };

  const handlePlanChange = (planKey: string, isEditing: boolean) => {
    // Default plan templates
    const templates: any = {
      BRONZE: { maxSessions: 1, allowWarmup: true, allowInclusion: false, allowMessager: false, allowDisplay: false },
      SILVER: { maxSessions: 3, allowWarmup: true, allowInclusion: true, allowMessager: true, allowDisplay: false },
      GOLD: { maxSessions: 10, allowWarmup: true, allowInclusion: true, allowMessager: true, allowDisplay: true }
    };
    
    const tpl = templates[planKey] || templates.BRONZE;
    
    if (isEditing && editingUser) {
      setEditingUser({
        ...editingUser,
        plan: planKey,
        maxSessions: tpl.maxSessions,
        allowWarmup: tpl.allowWarmup,
        allowInclusion: tpl.allowInclusion,
        allowMessager: tpl.allowMessager,
        allowDisplay: tpl.allowDisplay
      });
    } else {
      setNewUser({
        ...newUser,
        plan: planKey,
        maxSessions: tpl.maxSessions,
        allowWarmup: tpl.allowWarmup,
        allowInclusion: tpl.allowInclusion,
        allowMessager: tpl.allowMessager,
        allowDisplay: tpl.allowDisplay
      });
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Nome, E-mail e Senha são obrigatórios.");
      return;
    }
    
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowAddUserModal(false);
        setNewUser({
          name: "", email: "", password: "", role: "USER", phone: "", city: "",
          plan: "BRONZE", maxSessions: 1, expiresAt: "",
          allowWarmup: true, allowInclusion: true, allowMessager: true, allowDisplay: true,
        });
        fetchAdminUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao criar usuário.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin-users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        setShowEditUserModal(false);
        setEditingUser(null);
        fetchAdminUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao atualizar usuário.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Atenção! Esta ação excluirá permanentemente o usuário. Deseja continuar?")) return;
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setShowEditUserModal(false);
        fetchAdminUsers();
      } else {
        alert("Erro ao excluir usuário. Apenas Super Admins podem realizar esta ação.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };

  const downloadCRMReport = () => {
    const header = "ID,Nome,Email,Telefone,Plano,Chips,Status,Vencimento\n";
    const csv = adminUsers.map(u => {
      const isExpired = u.expiresAt && new Date(u.expiresAt) < new Date();
      const status = !u.isActive ? "INATIVO" : isExpired ? "EXPIRADO" : "ATIVO";
      return `${u.id},${u.name || ''},${u.email},${u.phone || ''},${u.plan},${u.maxSessions},${status},${u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : 'VITALICIO'}`;
    }).join("\n");
    
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `nexus_crm_export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <LucideBrain size={48} className="mx-auto text-purple-500/50 mb-4 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">Carregando Administração...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <LucideSettings size={20} className="text-purple-400" /> Painel Administrativo SaaS
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-bold">Gestão de Licenças, Módulos e Acessos</p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
        >
          <LucidePlus size={16} /> Nova Licença
        </button>
      </div>

      {/* SaaS Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-3xl flex flex-col items-center border border-white/5 hover:border-purple-500/20 transition-all">
          <LucideUsers size={20} className="text-slate-600 mb-2" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Usuários</span>
          <span className="text-3xl font-black text-white">{adminUsers.length}</span>
        </div>
        <div className="glass-panel p-5 rounded-3xl flex flex-col items-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.05)] hover:shadow-[0_0_25px_rgba(34,197,94,0.1)] transition-all">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mb-2" />
          <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em] mb-1">Assinaturas Ativas</span>
          <span className="text-3xl font-black text-green-400">{adminUsers.filter(u => u.isActive && (!u.expiresAt || new Date(u.expiresAt) > new Date())).length}</span>
        </div>
        <div className="glass-panel p-5 rounded-3xl flex flex-col items-center border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)] hover:shadow-[0_0_25px_rgba(244,63,94,0.1)] transition-all">
          <div className="w-2 h-2 rounded-full bg-rose-500 mb-2" />
          <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Expirados/Inativos</span>
          <span className="text-3xl font-black text-rose-400">{adminUsers.filter(u => !u.isActive || (u.expiresAt && new Date(u.expiresAt) < new Date())).length}</span>
        </div>
        <div className="glass-panel p-5 rounded-3xl flex flex-col items-center justify-center gap-3 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all">
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Relatório Geral</span>
          <button
            onClick={downloadCRMReport}
            className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <LucideDatabase size={12} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                <th className="px-8 py-4">Cliente</th>
                <th className="px-6 py-4">Plano / Chips</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiração</th>
                <th className="px-6 py-4">Módulos</th>
                <th className="px-8 py-4 text-right">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {adminUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LucideActivity size={40} className="mx-auto text-slate-800 mb-3 animate-pulse" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhum usuário SaaS cadastrado.</p>
                  </td>
                </tr>
              )}
              {adminUsers.map((u) => {
                const isExpired = u.expiresAt && new Date(u.expiresAt) < new Date();
                const status = !u.isActive ? "INATIVO" : isExpired ? "EXPIRADO" : "ATIVO";

                return (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white'
                        }`}>
                          <LucideUsers size={14} />
                        </div>
                        <div>
                          <p className="font-black text-[12px] text-white uppercase leading-none group-hover:text-blue-400 transition-colors">{u.name || u.username}</p>
                          <p className="text-[9px] text-slate-600 font-mono mt-1">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-[4px] border ${
                          u.plan === 'GOLD' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          u.plan === 'SILVER' ? 'bg-slate-500/10 text-slate-300 border-slate-500/20' :
                          'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>{u.plan}</span>
                        <span className="text-[10px] text-slate-600 font-bold">{u.maxSessions} chips</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black flex items-center gap-1.5 ${
                        status === 'ATIVO' ? 'text-green-400' : 'text-rose-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'ATIVO' ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`} />
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold ${isExpired ? 'text-rose-400' : 'text-slate-300'}`}>
                        {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString('pt-BR') : 'VITALÍCIO'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span title="iA Chat" className={u.allowWarmup ? "text-purple-400" : "opacity-10 grayscale"}><LucideBrain size={13} /></span>
                        <span title="Inclusão" className={u.allowInclusion ? "text-green-400" : "opacity-10 grayscale"}><LucidePlus size={13} /></span>
                        <span title="Messager" className={u.allowMessager ? "text-blue-400" : "opacity-10 grayscale"}><LucideMessageSquare size={13} /></span>
                        <span title="Display" className={u.allowDisplay ? "text-rose-400" : "opacity-10 grayscale"}><LucideMonitorPlay size={13} /></span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingUser({
                            ...u,
                            password: '',
                            phone: u.phone || '',
                            city: u.city || '',
                            expiresAt: u.expiresAt ? new Date(u.expiresAt).toISOString().split('T')[0] : "",
                            isActive: u.isActive !== undefined ? u.isActive : true,
                            plan: u.plan || "BRONZE",
                            allowWarmup: u.allowWarmup !== undefined ? u.allowWarmup : true,
                            allowInclusion: u.allowInclusion !== undefined ? u.allowInclusion : true,
                            allowMessager: u.allowMessager !== undefined ? u.allowMessager : true,
                            allowDisplay: u.allowDisplay !== undefined ? u.allowDisplay : true
                          });
                          setShowEditUserModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-500 hover:text-purple-400 transition-all border border-transparent hover:border-purple-500/30"
                        title="Editar Licença"
                      >
                        <LucideEdit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal: Novo Usuário */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="glass-panel p-8 w-full max-w-2xl space-y-6 relative rounded-3xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowAddUserModal(false)} className="absolute top-4 right-4 text-slate-400 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full"><LucideX size={20} /></button>

            <div className="border-b border-white/5 pb-4">
              <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">Nova Licença</h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold opacity-60">Cadastrar novo cliente SaaS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna 1: Dados Básicos */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40 mb-4 flex items-center gap-2"><LucideUsers size={14} /> Dados de Acesso</h4>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Nome Completo</label>
                  <input type="text" placeholder="Ex: João Silva" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">E-mail</label>
                  <input type="email" placeholder="login@acesso.com" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Senha Inicial</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Senha" className="bg-black/40 border border-white/10 rounded-xl flex-1 p-4 outline-none text-sm font-mono bg-transparent" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                    <button onClick={() => setNewUser({ ...newUser, password: generatePassword() })} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-2 text-[8px] font-black uppercase text-white whitespace-nowrap">Gerar</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Telefone</label>
                    <input type="text" placeholder="(11) 99999-9999" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Cidade/UF</label>
                    <input type="text" placeholder="Ex: São Paulo, SP" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={newUser.city} onChange={(e) => setNewUser({ ...newUser, city: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Coluna 2: Licenciamento */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40 mb-4 flex items-center gap-2"><LucideShieldCheck size={14} /> Controle de Licença</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Plano</label>
                    <select
                      className="bg-black/40 border border-white/10 rounded-xl w-full p-4 bg-transparent text-white outline-none text-sm cursor-pointer"
                      value={newUser.plan}
                      onChange={(e) => handlePlanChange(e.target.value, false)}
                    >
                      <option value="BRONZE" className="bg-[#1a1a1f] text-white">BRONZE</option>
                      <option value="SILVER" className="bg-[#1a1a1f] text-white">SILVER</option>
                      <option value="GOLD" className="bg-[#1a1a1f] text-white">GOLD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Chips (Lmt)</label>
                    <input type="number" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm text-center bg-transparent" value={newUser.maxSessions} onChange={(e) => setNewUser({ ...newUser, maxSessions: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Data de Expiração</label>
                  <input type="date" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent text-white" value={newUser.expiresAt} onChange={(e) => setNewUser({ ...newUser, expiresAt: e.target.value })} />
                </div>

                {/* Modular Access Matrix */}
                <div className="mt-6 space-y-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl rounded-2xl">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase border-b border-white/5 pb-2">Módulos Habilitados</h5>
                  <div className="grid grid-cols-2 gap-y-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={newUser.allowWarmup} onChange={(e) => setNewUser({ ...newUser, allowWarmup: e.target.checked })} className="hidden" />
                      <div className={`w-4 h-4 rounded-md border border-white/10 flex items-center justify-center transition-all ${newUser.allowWarmup ? 'bg-purple-500 border-purple-400' : 'bg-white/[0.03] border border-white/5 rounded-xl'}`}>
                        {newUser.allowWarmup && <LucideShieldCheck size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase transition-colors ${newUser.allowWarmup ? 'text-white' : 'text-slate-400 opacity-30'}`}>iA Chat</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={newUser.allowInclusion} onChange={(e) => setNewUser({ ...newUser, allowInclusion: e.target.checked })} className="hidden" />
                      <div className={`w-4 h-4 rounded-md border border-white/10 flex items-center justify-center transition-all ${newUser.allowInclusion ? 'bg-green-500 border-green-400' : 'bg-white/[0.03] border border-white/5 rounded-xl'}`}>
                        {newUser.allowInclusion && <LucideShieldCheck size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase transition-colors ${newUser.allowInclusion ? 'text-white' : 'text-slate-400 opacity-30'}`}>Inclusão</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={newUser.allowMessager} onChange={(e) => setNewUser({ ...newUser, allowMessager: e.target.checked })} className="hidden" />
                      <div className={`w-4 h-4 rounded-md border border-white/10 flex items-center justify-center transition-all ${newUser.allowMessager ? 'bg-blue-500 border-blue-400' : 'bg-white/[0.03] border border-white/5 rounded-xl'}`}>
                        {newUser.allowMessager && <LucideShieldCheck size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase transition-colors ${newUser.allowMessager ? 'text-white' : 'text-slate-400 opacity-30'}`}>Messager</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={newUser.allowDisplay} onChange={(e) => setNewUser({ ...newUser, allowDisplay: e.target.checked })} className="hidden" />
                      <div className={`w-4 h-4 rounded-md border border-white/10 flex items-center justify-center transition-all ${newUser.allowDisplay ? 'bg-rose-500 border-rose-400' : 'bg-white/[0.03] border border-white/5 rounded-xl'}`}>
                        {newUser.allowDisplay && <LucideShieldCheck size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase transition-colors ${newUser.allowDisplay ? 'text-white' : 'text-slate-400 opacity-30'}`}>Display</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={createUser} className="bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] w-full py-5 text-white font-black uppercase tracking-widest text-lg rounded-2xl mt-4">Ativar Nova Licença</button>
          </div>
        </div>
      )}

      {/* Modal: Editar Usuário */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="glass-panel p-8 w-full max-w-2xl space-y-6 relative rounded-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Gestão de Licença</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold opacity-60">ID: {editingUser.id}</p>
              </div>
              <button onClick={() => setShowEditUserModal(false)} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-3 text-slate-400 hover:text-red-400 rounded-full"><LucideX size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna 1: Dados e Status */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40 flex items-center gap-2"><LucideUsers size={14} /> Dados Gerais</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-[8px] font-black uppercase ${editingUser.isActive ? 'text-green-500' : 'text-red-500'}`}>
                      {editingUser.isActive ? 'Conta Ativa' : 'Conta Suspensa'}
                    </span>
                    <div onClick={() => setEditingUser({ ...editingUser, isActive: !editingUser.isActive })} className={`w-10 h-5 rounded-full p-1 transition-all ${editingUser.isActive ? 'bg-green-500' : 'bg-white/[0.03] border border-white/5 rounded-xl'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-all ${editingUser.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Nome</label>
                  <input type="text" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={editingUser.name || ''} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">E-mail</label>
                  <input type="email" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Alterar Senha</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Nova senha (opcional)" className="bg-black/40 border border-white/10 rounded-xl flex-1 p-4 outline-none text-sm font-mono bg-transparent" value={editingUser.password || ''} onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} />
                    <button onClick={() => setEditingUser({ ...editingUser, password: generatePassword() })} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-2 text-[8px] font-black uppercase text-white whitespace-nowrap">Nova</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Telefone</label>
                    <input type="text" placeholder="(11) 99999-9999" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={editingUser.phone || ''} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Cidade/UF</label>
                    <input type="text" placeholder="Ex: São Paulo, SP" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent" value={editingUser.city || ''} onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Coluna 2: Plano e Módulos */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40 mb-4 flex items-center gap-2"><LucideShieldCheck size={14} /> Permissões SaaS</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Plano</label>
                    <select
                      className="bg-black/40 border border-white/10 rounded-xl w-full p-4 bg-transparent text-white outline-none text-sm cursor-pointer"
                      value={editingUser.plan || 'BRONZE'}
                      onChange={(e) => handlePlanChange(e.target.value, true)}
                    >
                      <option value="BRONZE" className="bg-[#1a1a1f] text-white">BRONZE</option>
                      <option value="SILVER" className="bg-[#1a1a1f] text-white">SILVER</option>
                      <option value="GOLD" className="bg-[#1a1a1f] text-white">GOLD</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Chips</label>
                    <input type="number" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm text-center bg-transparent" value={editingUser.maxSessions || 1} onChange={(e) => setEditingUser({ ...editingUser, maxSessions: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Vencimento da Licença</label>
                  <input type="date" className="bg-black/40 border border-white/10 rounded-xl w-full p-4 outline-none text-sm bg-transparent text-white" value={editingUser.expiresAt} onChange={(e) => setEditingUser({ ...editingUser, expiresAt: e.target.value })} />
                </div>

                {/* Module Matrix */}
                <div className="mt-4 grid grid-cols-2 gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl rounded-2xl">
                  {[
                    { key: 'allowWarmup', label: 'iA Chat', icon: <LucideBrain size={12} /> },
                    { key: 'allowInclusion', label: 'Inclusão', icon: <LucidePlus size={12} /> },
                    { key: 'allowMessager', label: 'Messager', icon: <LucideMessageSquare size={12} /> },
                    { key: 'allowDisplay', label: 'Display', icon: <LucideMonitorPlay size={12} /> }
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={editingUser[f.key as keyof typeof editingUser]} onChange={(e) => setEditingUser({ ...editingUser, [f.key]: e.target.checked })} className="hidden" />
                      <div className={`w-4 h-4 rounded-md border border-white/10 flex items-center justify-center transition-all ${editingUser[f.key as keyof typeof editingUser] ? 'bg-blue-500 border-blue-400' : 'bg-white/[0.03] border border-white/5 rounded-xl'}`}>
                        {editingUser[f.key as keyof typeof editingUser] && <LucideShieldCheck size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${editingUser[f.key as keyof typeof editingUser] ? 'text-white' : 'text-slate-400 opacity-30'}`}>{f.icon} {f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Role Management Section */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 rounded-2xl space-y-3 mx-2">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] opacity-40">Cargo de Acesso HUB</span>
                  <span className="text-[10px] font-bold text-white mt-1">Status: <span className={editingUser.role === 'ADMIN' || editingUser.role === 'SUPER_ADMIN' ? 'text-purple-400' : 'text-slate-400'}>{editingUser.role || 'USER'}</span></span>
                </div>
                {editingUser.role === 'ADMIN' || editingUser.role === 'SUPER_ADMIN' ? (
                  <button
                    onClick={() => { if (confirm("Deseja rebaixar este usuário para cliente comum? Ele perderá acesso ao painel de administração.")) setEditingUser({ ...editingUser, role: 'CUSTOMER' }); }}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 text-orange-500 text-[9px] font-black uppercase rounded-xl"
                  >
                    Rebaixar para Usuário
                  </button>
                ) : (
                  <button
                    onClick={() => { if (confirm("ATENÇÃO: Deseja transformar este usuário em ADMINISTRADOR? Ele terá controle total sobre licenças e faturamento.")) setEditingUser({ ...editingUser, role: 'ADMIN' }); }}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 text-purple-500 text-[9px] font-black uppercase flex items-center gap-2 rounded-xl"
                  >
                    <LucideShieldCheck size={12} /> Tornar Administrador
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-6 border-t border-white/5">
              <button onClick={updateUser} className="bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] w-full py-5 text-white font-black uppercase text-lg rounded-2xl">Atualizar Licença do Cliente</button>

              {editingUser.id !== user?.id && (
                <button onClick={() => deleteUser(editingUser.id)} className="w-full py-2 text-red-500 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <LucideTrash2 size={12} /> Excluir permanentemente
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
