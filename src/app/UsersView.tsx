import { useState, useEffect, useCallback } from "react";
import { LucideUser, LucideTrash2, LucidePlus, LucideActivity, LucideShieldAlert, LucideKeyRound, LucideEdit } from "lucide-react";

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: "", username: "", password: "", role: "USER" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir usuário");
      }
    } catch (err) {
      alert("Erro na comunicação com o servidor.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const url = isEditing ? `/api/users/${formData.id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ id: "", username: "", password: "", role: "USER" });
        setIsEditing(false);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || `Erro ao ${isEditing ? "atualizar" : "criar"} usuário`);
      }
    } catch (err) {
      setError("Erro de rede ao conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ id: "", username: "", password: "", role: "USER" });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setIsEditing(true);
    setFormData({ id: user.id, username: user.username, password: "", role: user.role });
    setShowModal(true);
  };

  return (
    <section>
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest glow-text flex items-center gap-2">
            <LucideKeyRound size={20} className="text-blue-500" /> Controle de Acessos
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-bold">Gestão de administradores e usuários do HUB</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        >
          <LucidePlus size={16} /> Novo Acesso
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                <th className="px-8 py-4">Status</th>
                <th className="px-6 py-4">Usuário / ID</th>
                <th className="px-6 py-4">Permissão</th>
                <th className="px-6 py-4">Criação</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <LucideActivity size={48} className="mx-auto text-slate-800 mb-4 animate-pulse" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Carregando acessos...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-500 font-bold uppercase tracking-widest">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                    <td className="px-8 py-3">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center status-ring border text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                        <LucideActivity size={12} />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white'}`}>
                          {user.role === 'ADMIN' ? <LucideShieldAlert size={14} /> : <LucideUser size={14} />}
                        </div>
                        <div>
                          <p className={`font-black text-[12px] uppercase leading-none transition-colors ${user.role === 'ADMIN' ? 'text-amber-400' : 'text-white group-hover:text-blue-400'}`}>
                            {user.username}
                          </p>
                          <p className="text-[9px] text-slate-600 font-mono mt-1">ID: {user.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-[4px] text-[9px] font-black uppercase tracking-widest ${
                        user.role === 'ADMIN' 
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-[11px] font-bold text-slate-300">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-8 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/30"
                          title="Editar Acesso"
                        >
                          <LucideEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
                          title="Remover Acesso"
                        >
                          <LucideTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Usuário */}
      {/* Modal Criar/Editar Usuário */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-panel w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <LucideShieldAlert size={20} className="text-blue-500" /> 
              {isEditing ? "Editar Acesso" : "Adicionar Novo Acesso"}
            </h3>
            
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none transition-all disabled:opacity-50"
                  placeholder="admin.geral"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Senha</label>
                <input
                  type="password"
                  required={!isEditing}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none transition-all"
                  placeholder={isEditing ? "(Deixe em branco para não alterar)" : "********"}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nível de Permissão</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`py-3 rounded-xl border text-xs font-black tracking-widest uppercase transition-all ${
                      formData.role === 'USER' 
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                    }`}
                  >
                    Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`py-3 rounded-xl border text-xs font-black tracking-widest uppercase transition-all ${
                      formData.role === 'ADMIN' 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/10 hover:border-white/20"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
                >
                  {submitting ? (
                    <LucideActivity size={16} className="animate-spin" />
                  ) : (
                    isEditing ? "Salvar" : "Criar Acesso"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
