import { useState, useEffect, useCallback } from "react";
import { 
  LucideX, 
  LucideUser, 
  LucideMail, 
  LucidePhone, 
  LucideMapPin, 
  LucideActivity,
  LucideMessageSquare,
  LucideShield,
  LucideServer,
  LucideSend
} from "lucide-react";

interface CustomerProfileProps {
  customerId: string;
  onClose: () => void;
}

export default function CustomerProfile({ customerId, onClose }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLog, setNewLog] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'timeline'>('geral');

  const fetchDetails = useCallback(async () => {
    try {
      const [custRes, intRes] = await Promise.all([
        fetch(`/api/customers`), // We could make a specific GET /id, but for now we filter
        fetch(`/api/customers/${customerId}/interactions`)
      ]);
      
      if (custRes.ok) {
        const all = await custRes.json();
        setCustomer(all.find((c: any) => c.id === customerId));
      }
      if (intRes.ok) {
        setInteractions(await intRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setSubmittingLog(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newLog, type: "NOTE" })
      });
      if (res.ok) {
        setNewLog("");
        fetchDetails();
      }
    } catch (e) {}
    setSubmittingLog(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full md:w-[600px] h-full bg-[#0a0a0a] border-l border-white/10 p-10 flex items-center justify-center animate-in slide-in-from-right duration-500 shadow-2xl">
           <LucideActivity size={32} className="text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:w-[600px] h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <LucideUser size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">{customer.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider ${
                    customer.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 
                    customer.status === 'LEAD' ? 'bg-slate-500/10 text-slate-400' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {customer.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {customer.id.split('-')[0]}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
              <LucideX size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('geral')}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'geral' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'timeline' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Histórico (Timeline)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {activeTab === 'geral' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Contato */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Informações de Contato</h3>
                <div className="flex items-center gap-3 text-slate-300">
                  <LucideMail size={16} className="text-slate-500" />
                  <span className="text-xs font-bold">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <LucidePhone size={16} className="text-slate-500" />
                  <span className="text-xs font-bold">{customer.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <LucideUser size={16} className="text-slate-500" />
                  <span className="text-xs font-bold">CPF/CNPJ: {customer.cpfCnpj || 'Não informado'}</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300">
                  <LucideMapPin size={16} className="text-slate-500 mt-1" />
                  <span className="text-xs font-bold">{customer.address || 'Nenhum endereço cadastrado'}</span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2 text-blue-500">
                    <LucideShield size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Licenças</span>
                  </div>
                  <p className="text-2xl font-black text-white">{customer._count?.licenses || 0}</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2 text-purple-500">
                    <LucideServer size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Assinaturas</span>
                  </div>
                  <p className="text-2xl font-black text-white">{customer._count?.subscriptions || 0}</p>
                </div>
              </div>

              {/* Notas do Cadastro */}
              {customer.notes && (
                <div className="glass-panel p-6 rounded-2xl border-amber-500/20 bg-amber-500/5">
                  <h3 className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-3">Notas Cadastrais</h3>
                  <p className="text-xs text-amber-100/70 italic">{customer.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {/* Form de Nova Nota */}
              <form onSubmit={handleAddLog} className="mb-8 relative">
                <textarea
                  value={newLog}
                  onChange={(e) => setNewLog(e.target.value)}
                  placeholder="Adicionar nota sobre reunião, ligação..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-none"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={submittingLog}
                  className="absolute bottom-4 right-4 p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <LucideSend size={14} />
                </button>
              </form>

              {/* Feed da Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {interactions.map((log: any) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-[#0a0a0a] bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <LucideMessageSquare size={8} />
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] glass-panel p-4 rounded-2xl border-white/5 group-hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{log.type}</span>
                        <time className="text-[9px] font-bold text-slate-600">{new Date(log.createdAt).toLocaleDateString('pt-BR')} {new Date(log.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</time>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">{log.content}</p>
                    </div>
                  </div>
                ))}
                
                {interactions.length === 0 && (
                  <div className="text-center py-12 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Nenhum histórico registrado
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
