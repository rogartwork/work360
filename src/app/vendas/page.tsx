"use client";

import { useState } from "react";
import {
  LucideShieldCheck,
  LucideZap,
  LucideGlobe,
  LucideCheck,
  LucideArrowRight,
  LucideSmartphone,
  LucideRocket,
  LucideActivity
} from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "mensal",
    name: "Nexus 360 Mensal",
    price: "147",
    period: "/mês",
    description: "Automação completa para até 3 chip.",
    features: [
      "Instalação Desktop",
      "Antiban Avançado",
      "Envio de Arquivos & Áudios",
      "Monitoramento via Hub",
      "Atualizações Inclusas"
    ],
    buttonText: "Assinar Agora",
    popular: false
  },
  {
    id: "trimestral",
    name: "Nexus 360 Trimestral",
    price: "387",
    period: "/trimestre",
    description: "Ideal para operações em crescimento com até 6 chip.",
    features: [
      "Instalação Desktop",
      "Suporte Prioritário",
      "Multiatendimento",
      "Gestão de Campanhas",
      "Economize 12% no período"
    ],
    buttonText: "Começar Agora",
    popular: true
  },
  {
    id: "anual",
    name: "Nexus 360 Anual",
    price: "1.199",
    period: "/ano",
    description: "A solução definitiva em negócio com até 12 chip.",
    features: [
      "Instalação Desktop",
      "Mentoria de Escala",
      "Todos os Módulos VIP",
      "Suporte Individualizado",
      "Melhor Custo-Benefício"
    ],
    buttonText: "Garantir Vaga",
    popular: false
  }
];

export default function VendasPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  const [userData, setUserData] = useState({ name: "", email: "" });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEmailModal) return;

    setLoading(showEmailModal);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: showEmailModal,
          name: userData.name,
          email: userData.email
        })
      });

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao gerar link de pagamento. Verifique seu Token do Mercado Pago no .env");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setLoading(null);
    }
  };

  const handleSubscribeClick = (planId: string) => {
    setShowEmailModal(planId);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">

      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* NAV FLOATING EXPANDED */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl mx-auto">
        <div className="glass-panel px-8 py-3 rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-between">
          {/* Logo à esquerda */}
          <div className="flex items-center gap-2">
            <img src="/xnexus.png" alt="Logo" className="h-8 w-auto object-contain" />
          </div>

          {/* Links centrais */}
          <div className="hidden md:flex items-center gap-10 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#planos" className="hover:text-white transition-colors text-blue-400">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Botão à direita */}
          <Link href="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap">
            Área do Cliente
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 pb-32 px-8 max-w-5xl mx-auto text-center">
        <div className="flex justify-center mb-10 animate-in fade-in zoom-in duration-1000">
          <img src="/xnexus.png" alt="Nexus 360" className="h-26 md:h-42 w-auto object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
        </div>
        <div className="inline-flex items-center gap-2 px-8 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <LucideZap size={12} /> Lançamento Oficial V1.0
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          A PRÓXIMA GERAÇÃO DA <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">AUTOMAÇÃO WHATSAPP</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Domine o mercado com o Nexus 360. Envie áudios como se fossem gravados na hora, gerencie múltiplos chips e escale sua operação.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <a href="#planos" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20">
            Ver Planos Disponíveis <LucideArrowRight size={18} />
          </a>
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all">
            Falar com Consultor
          </button>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="planos" className="relative z-10 py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Escolha sua Escala</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Liberação imediata via PIX após o pagamento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative glass-panel p-10 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] flex flex-col ${plan.popular ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30">
                  Mais Escolhido
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black uppercase tracking-wider mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">{plan.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-sm font-black text-slate-500">R$</span>
                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{plan.period}</span>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <LucideCheck size={12} />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribeClick(plan.id)}
                disabled={loading !== null}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${plan.popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
              >
                {loading === plan.id ? <LucideActivity size={18} className="animate-spin" /> : plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-20 border-t border-white/5 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/xnexus.png" alt="Nexus 360 Logo" className="h-10 w-auto object-contain opacity-80" />
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            © 2026 Nexus CRM Solutions. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-white">Termos</a>
            <a href="#" className="hover:text-white">Privacidade</a>
          </div>
        </div>
      </footer>

      {/* MODAL DE DADOS DO CLIENTE */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowEmailModal(null)} />
          <div className="relative glass-panel w-full max-w-md rounded-[2rem] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-6">Finalizar Inscrição</h3>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="Nome Completo"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">E-mail para receber acesso</label>
                <input
                  type="email"
                  required
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading !== null}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <LucideActivity size={18} className="animate-spin" /> : 'Ir para Pagamento'}
                <LucideArrowRight size={18} />
              </button>
              <p className="text-[9px] text-slate-600 font-bold text-center uppercase tracking-tighter">
                Pagamento seguro processado pelo Mercado Pago
              </p>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
