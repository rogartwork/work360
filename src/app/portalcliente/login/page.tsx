"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LucideLock, LucideUser, LucideShieldCheck, LucideLoader2, LucideMonitor } from "lucide-react";

export default function PortalClienteLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redireciona o cliente para o novo portal de clientes
        if (data.role === 'CUSTOMER') {
          router.push("/portalcliente");
        } else {
          router.push("/portalcliente"); // Força redirecionamento para o portal do cliente
        }
        router.refresh();
      } else {
        setError(data.error || "Falha na autenticação");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1e2128] text-[#eaeff5] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#38bdf8]/30 font-sans">
      {/* ISOLATED NEUMORPHISM STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
           --bg-nm: #1e2128;
           --fg-nm: #eaeff5;
           --nm-sec: #94a3b8;
           --nm-primary: #38bdf8;
           --nm-shadow-light: #2b303b;
           --nm-shadow-dark: #0f1115;
        }
        .nm-flat {
           background: var(--bg-nm);
           box-shadow: 9px 9px 16px var(--nm-shadow-dark), -9px -9px 16px var(--nm-shadow-light);
           border-radius: 32px;
           border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .nm-inset {
           background: var(--bg-nm);
           box-shadow: inset 5px 5px 10px var(--nm-shadow-dark), inset -5px -5px 10px var(--nm-shadow-light);
           border-radius: 16px;
           border: 1px solid rgba(255, 255, 255, 0.01);
        }
        .nm-button {
           background: var(--bg-nm);
           box-shadow: 6px 6px 12px var(--nm-shadow-dark), -6px -6px 12px var(--nm-shadow-light);
           border-radius: 16px;
           transition: all 0.2s ease;
           border: 1px solid rgba(255, 255, 255, 0.02);
           outline: none;
        }
        .nm-button:hover {
           box-shadow: 3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light);
           transform: translateY(-1px);
        }
        .nm-button:active {
           box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
           transform: scale(0.98) translateY(0);
        }
        .animate-pulse-subtle {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }
      `}} />

      {/* SOFT GLOWS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[35%] h-[35%] bg-[#38bdf8]/3 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[20%] w-[35%] h-[35%] bg-[#38bdf8]/2 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* LOGO */}
        <div className="text-center mb-10">
          <div className="relative inline-block group">
            <img
              src="/xnexus.png"
              alt="NEXUS360"
              className="h-16 w-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
          <p className="text-[#38bdf8] text-[9px] font-mono font-bold tracking-[0.4em] uppercase mt-6">PORTAL DO CLIENTE</p>
        </div>

        {/* LOGIN CARD */}
        <div className="nm-flat p-8 md:p-10 relative overflow-hidden">
          {error && (
            <div className="mb-6 p-4 nm-inset border-rose-500/10 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-[#94a3b8] uppercase tracking-widest ml-1">E-mail ou Usuário</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-[#38bdf8] transition-colors">
                  <LucideUser size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full nm-inset py-4 pl-12 pr-4 text-sm font-medium outline-none text-[#eaeff5] placeholder:text-[#94a3b8]/30 transition-all focus:border-[#38bdf8]/30"
                  placeholder="INSIRA SEU CREDENCIAL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-[#94a3b8] uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94a3b8] group-focus-within:text-[#38bdf8] transition-colors">
                  <LucideLock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full nm-inset py-4 pl-12 pr-4 text-sm font-medium outline-none text-[#eaeff5] placeholder:text-[#94a3b8]/30 transition-all focus:border-[#38bdf8]/30"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full nm-button text-[#eaeff5] hover:text-[#38bdf8] font-mono font-black uppercase tracking-[0.2em] text-xs py-5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LucideLoader2 size={18} className="animate-spin text-[#38bdf8]" />
                  Acessando...
                </>
              ) : (
                <>
                  <LucideShieldCheck size={18} className="text-[#38bdf8]" />
                  Entrar no Portal
                </>
              )}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex items-center justify-between px-2 opacity-40 font-mono text-[8px] uppercase tracking-widest text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-pulse-subtle" />
            <span>Segurança Ativa</span>
          </div>
          <span>Nexus360 Portal v1.0</span>
        </div>
      </div>
    </main>
  );
}
