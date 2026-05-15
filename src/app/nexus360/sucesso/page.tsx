"use client";

import { LucideCheckCircle, LucideMail, LucideArrowRight, LucideRocket } from "lucide-react";
import Link from "next/link";

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8">
      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg w-full glass-panel p-12 rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 text-center shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
          <LucideCheckCircle size={40} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4">Pagamento Confirmado!</h1>
        <p className="text-slate-400 font-medium mb-10 leading-relaxed">
          Seja bem-vindo ao ecossistema <span className="text-white font-bold">Nexus 360</span>. Sua licença foi gerada e ativada em milissegundos por nossa inteligência.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <LucideMail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acesso enviado para</p>
              <p className="text-sm font-bold text-white">Verifique sua caixa de entrada</p>
            </div>
          </div>
        </div>

        <Link 
          href="/login" 
          className="w-full py-5 bg-white text-black hover:bg-slate-200 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10"
        >
          Acessar Meu Painel <LucideArrowRight size={20} />
        </Link>

        <div className="mt-8 flex items-center justify-center gap-2">
          <img src="/xnexus.png" alt="Nexus 360 Logo" className="h-8 w-auto object-contain opacity-50" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">v1.0</span>
        </div>
      </div>

      <style jsx global>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
