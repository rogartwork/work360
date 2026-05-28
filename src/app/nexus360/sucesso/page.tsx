"use client";

import { LucideCheckCircle, LucideMail, LucideArrowRight, LucideRocket } from "lucide-react";
import Link from "next/link";

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-[#1e2128] text-[#eaeff5] flex items-center justify-center p-8 relative selection:bg-[#38bdf8]/30">
      
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
            box-shadow: inset 9px 9px 16px var(--nm-shadow-dark), inset -9px -9px 16px var(--nm-shadow-light);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.01);
         }
         .nm-button {
            background: var(--bg-nm);
            box-shadow: 6px 6px 12px var(--nm-shadow-dark), -6px -6px 12px var(--nm-shadow-light);
            border-radius: 20px;
            color: #38bdf8;
            font-weight: bold;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.03);
            cursor: pointer;
            outline: none;
         }
         .nm-button:hover {
            box-shadow: 3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light);
            color: #7dd3fc;
         }
         .nm-button:active {
            box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
            transform: scale(0.98);
         }
      `}} />

      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#38bdf8]/4 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg w-full nm-flat p-12 text-center shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 nm-inset flex items-center justify-center mx-auto mb-8 text-emerald-400">
          <LucideCheckCircle size={44} className="animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-4 text-[#eaeff5]">Pagamento Confirmado!</h1>
        <p className="text-[#94a3b8] font-semibold mb-10 leading-relaxed italic text-sm">
          Seja bem-vindo ao ecossistema <span className="text-[#eaeff5] font-bold">Nexus 360</span>. Sua licença foi gerada e ativada em milissegundos por nossa inteligência.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 p-5 nm-inset text-left">
            <div className="w-10 h-10 nm-flat flex items-center justify-center text-[#38bdf8] shrink-0">
              <LucideMail size={20} />
            </div>
            <div>
              <p className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Acesso enviado para</p>
              <p className="text-sm font-bold text-[#eaeff5] tracking-tight">Verifique sua caixa de entrada</p>
            </div>
          </div>
        </div>

        <Link 
          href="/portalcliente" 
          className="w-full py-5 nm-button font-mono font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
        >
          Acessar Meu Painel <LucideArrowRight size={18} className="text-[#38bdf8]" />
        </Link>

        <div className="mt-10 flex items-center justify-center gap-2 font-mono text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          <img src="/xnexus.png" alt="Nexus 360 Logo" className="h-6 w-auto object-contain opacity-40" />
          <span>SYS_VAL::v1.2.1</span>
        </div>
      </div>
    </div>
  );
}
