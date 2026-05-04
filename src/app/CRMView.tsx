import { useState, useEffect, useCallback } from "react";
import { 
  LucideUser, 
  LucidePlus, 
  LucideActivity, 
  LucidePhone, 
  LucideMail, 
  LucideFileText, 
  LucideSearch,
  LucideUsers,
  LucideTag,
  LucideMapPin,
  LucideCalendar,
  LucideEdit,
  LucideList,
  LucideLayoutGrid,
  LucideMessageSquare
} from "lucide-react";
import CustomerProfile from "./CustomerProfile";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpfCnpj: string | null;
  status: string;
  affiliate?: {
    referralCode: string;
  };
  _count: {
    licenses: number;
  };
  createdAt: string;
}

export default function CRMView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpfCnpj: "",
    address: "",
    notes: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [profileCustomerId, setProfileCustomerId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("customerId", id);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const customerId = e.dataTransfer.getData("customerId");
    if (!customerId) return;
    
    // Otimista
    setCustomers(customers.map(c => c.id === customerId ? { ...c, status } : c));
    
    try {
      await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch(err) {
      fetchCustomers(); // reverte
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleOpenCreateModal = () => {
    setEditingCustomerId(null);
    setFormData({ name: "", email: "", phone: "", cpfCnpj: "", address: "", notes: "" });
    setShowModal(true);
  };

  const handleOpenEditModal = async (customer: Customer) => {
    setEditingCustomerId(customer.id);
    
    // We need to fetch full customer details if some are missing in the list view (like address, notes)
    // But we can pre-fill what we have. Let's pre-fill and maybe fetch more later if needed.
    // For now, we will fetch the full customer to populate the form correctly.
    try {
      const res = await fetch(`/api/customers`);
      if (res.ok) {
         const all = await res.json();
         const fullCust = all.find((c: any) => c.id === customer.id);
         if (fullCust) {
            setFormData({
              name: fullCust.name || "",
              email: fullCust.email || "",
              phone: fullCust.phone || "",
              cpfCnpj: fullCust.cpfCnpj || "",
              address: fullCust.address || "",
              notes: fullCust.notes || ""
            });
         }
      }
    } catch(e){}
    
    setShowModal(true);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const url = editingCustomerId ? `/api/customers/${editingCustomerId}` : "/api/customers";
      const method = editingCustomerId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingCustomerId(null);
        setFormData({ name: "", email: "", phone: "", cpfCnpj: "", address: "", notes: "" });
        fetchCustomers();
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao criar cliente");
      }
    } catch (err) {
      setError("Erro de rede ao conectar ao servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpfCnpj?.includes(searchTerm)
  );

  return (
    <section className="animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <LucideUsers size={24} className="text-blue-500" /> Gestão de Clientes (CRM)
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-bold">Base centralizada de licenças, faturamento e leads</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              title="Visão em Lista"
            >
              <LucideList size={16} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              title="Visão Kanban (Funil)"
            >
              <LucideLayoutGrid size={16} />
            </button>
          </div>

          <div className="relative flex-1 md:w-64">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <LucidePlus size={16} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <LucideUsers size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total de Clientes</span>
          </div>
          <h3 className="text-2xl font-black text-white">{customers.length}</h3>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <LucideActivity size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clientes Ativos</span>
          </div>
          <h3 className="text-2xl font-black text-white">{customers.filter(c => c.status === 'ACTIVE').length}</h3>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <LucideFileText size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Licenças Emitidas</span>
          </div>
          <h3 className="text-2xl font-black text-white">{customers.reduce((acc, c) => acc + c._count.licenses, 0)}</h3>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'list' ? (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                <th className="px-8 py-5">Status</th>
                <th className="px-6 py-5">Cliente / CPF-CNPJ</th>
                <th className="px-6 py-5">Contato</th>
                <th className="px-6 py-5">Origem (Afiliado)</th>
                <th className="px-6 py-5 text-center">Licenças</th>
                <th className="px-8 py-5 text-right">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <LucideActivity size={48} className="mx-auto text-blue-900/30 mb-4 animate-spin" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Consultando Base SaaS...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Nenhum cliente localizado.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="group hover:bg-white/[0.01] transition-all duration-300">
                    <td className="px-8 py-4">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest inline-block ${
                        customer.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {customer.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                          <LucideUser size={16} />
                        </div>
                        <div>
                          <p className="font-black text-[12px] text-white group-hover:text-blue-400 transition-colors uppercase leading-none">{customer.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">{customer.cpfCnpj || 'CPF NÃO INFORMADO'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
                          <LucideMail size={12} className="text-blue-500/50" />
                          <span className="text-[10px] font-bold">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
                          <LucidePhone size={12} className="text-emerald-500/50" />
                          <span className="text-[10px] font-bold">{customer.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.affiliate ? (
                        <div className="flex items-center gap-2">
                          <LucideTag size={12} className="text-amber-500/50" />
                          <span className="text-[10px] font-black text-amber-500/80 uppercase">{customer.affiliate.referralCode}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">Venda Direta</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-black text-blue-400">
                        {customer._count.licenses}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <LucideCalendar size={10} />
                          <span className="text-[10px] font-bold">{new Date(customer.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <button
                          onClick={() => handleOpenEditModal(customer)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded-md transition-colors text-[9px] font-bold uppercase"
                        >
                          <LucideEdit size={10} /> Editar
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start h-[600px] overflow-hidden">
          {[
            { id: 'LEAD', title: 'Leads / Negociação', color: 'text-slate-400', bg: 'bg-white/[0.02]', border: 'border-white/5' },
            { id: 'ACTIVE', title: 'Ativos / Vendido', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
            { id: 'INACTIVE', title: 'Inativos / Perdidos', color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/20' }
          ].map(col => (
            <div 
              key={col.id} 
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
              className={`flex flex-col h-full rounded-3xl border ${col.border} ${col.bg} p-4 transition-all duration-300 overflow-hidden`}
            >
              <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center justify-between ${col.color}`}>
                {col.title}
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-white">{filteredCustomers.filter(c => c.status === col.id).length}</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pb-4 scroll-smooth">
                {filteredCustomers.filter(c => c.status === col.id).map(customer => (
                  <div 
                    key={customer.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, customer.id)}
                    onClick={() => setProfileCustomerId(customer.id)}
                    className="glass-panel p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all border border-white/[0.02] hover:border-blue-500/30 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-xs text-white uppercase group-hover:text-blue-400 transition-colors leading-tight">{customer.name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(customer); }}
                        className="text-slate-600 hover:text-white p-1"
                      >
                        <LucideEdit size={12} />
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold mb-3">{customer.email}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <LucideActivity size={10} className="text-blue-500/50" />
                        <span className="text-[9px] font-bold uppercase">{customer._count.licenses} Licenças</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-600 tracking-widest uppercase">
                        {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredCustomers.filter(c => c.status === col.id).length === 0 && (
                  <div className="h-24 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Soltar Aqui
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative glass-panel w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white mb-8 flex items-center gap-3">
              <LucidePlus className="text-blue-500" /> {editingCustomerId ? "Editar Cliente" : "Cadastrar Novo Cliente"}
            </h3>
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">E-mail Principal</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="joao@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="5511999999999"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Endereço Completo</label>
                <div className="relative">
                  <LucideMapPin className="absolute left-4 top-4 text-slate-600" size={18} />
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomerId(null);
                  }}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                >
                  {submitting ? 'PROCESSANDO...' : (editingCustomerId ? 'SALVAR ALTERAÇÕES' : 'SALVAR NO CRM')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Customer 360 Profile Drawer */}
      {profileCustomerId && (
        <CustomerProfile 
          customerId={profileCustomerId} 
          onClose={() => setProfileCustomerId(null)} 
        />
      )}
    </section>
  );
}
