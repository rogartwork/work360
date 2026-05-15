"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LucideLock, LucideUser, LucideShieldCheck, LucideLoader2, LucideCpu } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
        if (data.role === 'CUSTOMER') {
          router.push("/painel");
        } else {
          router.push("/");
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
    <main className="min-h-screen bg-[#131416] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
      {/*HUD ELEMENTS */}
      <div className="noise-overlay" />
      <div className="hud-grid absolute inset-0 opacity-20" />

      {/* SPOTLIGHT CINÉTICO */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.1), transparent)`
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* ÁREA DO LOGO */}
        <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
          <div className="relative inline-block group">
            <img
              src="/logo.png"
              alt="WORK360"
              className="h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-x-0 -bottom-2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm" />
          </div>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.5em] uppercase mt-6 opacity-60">PAINEL ADMINSTRATIVO</p>
        </div>

        {/* CARD DE LOGIN */}
        <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-4 rounded-xl flex items-center gap-3 animate-shake">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Usuário de Identidade</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <LucideUser size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-blue-500/50 focus:bg-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-700"
                  placeholder="INSIRA SEU ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Protocolo de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <LucideLock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-blue-500/50 focus:bg-white/[0.05] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-700"
                  placeholder="********"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <LucideLoader2 size={18} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LucideShieldCheck size={18} />
                  Iniciar Conexão
                </>
              )}
            </button>
          </form>
        </div>

        {/* RODAPÉ */}
        <div className="mt-8 flex items-center justify-between px-2 opacity-30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-[9px] font-bold tracking-widest uppercase">Criptografia Ativa</span>
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase">Portal WORK360 v1.1.01</span>
        </div>
      </div>
    </main>
  );
}
