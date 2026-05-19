"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LucideShieldCheck, LucideUser, LucideLock, LucideRocket, LucideArrowRight, LucideCheckCircle, LucideAlertCircle } from "lucide-react";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // O e-mail pode vir preenchido da CAKTO via URL
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/portalcliente"), 3000);
      } else {
        setError(data.error || "Erro ao criar conta.");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <img src="/xnexus.png" alt="Nexus" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Quase lá!</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest italic">Crie sua senha para acessar o painel Nexus360</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          
          {success ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideCheckCircle size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black uppercase italic mb-2">Conta Criada!</h2>
              <p className="text-slate-400 text-sm italic mb-8">Redirecionando para a sua área...</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[progress_3s_linear]" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleCadastro} className="space-y-6">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold animate-shake">
                  <LucideAlertCircle size={18} /> {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">E-mail da Compra</label>
                <div className="relative">
                  <LucideUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="email" 
                    required
                    readOnly={!!searchParams.get("email")}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Defina sua Senha</label>
                <div className="relative">
                  <LucideLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Confirme a Senha</label>
                <div className="relative">
                  <LucideLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-700 font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 group"
              >
                {loading ? (
                  <LucideRocket className="animate-bounce" size={18} />
                ) : (
                  <>Finalizar Cadastro <LucideArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-600 uppercase font-bold tracking-widest mt-4">
                <LucideShieldCheck size={12} className="inline mr-1" /> Ambiente Seguro e Criptografado
              </p>
            </form>
          )}

        </div>
      </div>
  );
}

export default function CadastroClientePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500 flex items-center justify-center p-6 overflow-hidden relative">
      
      {/* Background Decorativo */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full" />

      <Suspense fallback={<div className="text-white font-black italic uppercase animate-pulse">Carregando ambiente seguro...</div>}>
        <CadastroForm />
      </Suspense>

      <style jsx>{`
        @keyframes progress { from { width: 0; } to { width: 100%; } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
