"use client";

import { useState, useEffect } from "react";
import {
   LucideCheck, LucideArrowDown, LucideActivity, LucideShieldCheck,
   LucideZap, LucideArrowRight, LucideRocket, LucideQuote, LucidePlay,
   LucideCrown, LucideMonitor, LucideLayers, LucideImage, LucideSmartphone,
   LucideSettings, LucideHistory, LucideLock, LucideCpu, LucideGlobe, LucideHeadphones,
   LucidePlus, LucideMinus, LucideFingerprint, LucideScanFace, LucideShieldAlert,
   LucideBriefcase, LucideTrendingUp, LucideMessageSquare, LucideBarChart3, LucideServer,
   LucideBrainCircuit, LucideSparkles, LucideMessagesSquare, LucideNetwork, LucideHelpCircle
} from "lucide-react";
import Link from "next/link";

const PLANS = [
   {
      id: "mensal",
      name: "Nexus360 Mensal",
      price: "67,99",
      oldPrice: "168,90",
      period: "/mês",
      description: "Automação completa para até 5 chips com alta performance.",
      features: [
         "Instalação Desktop Nativa",
         "Inteligence CHAT",
         "Antiban Stealth Core",
         "Aquecimentos de Chips",
         "Envio de Imagens & Smart Vídeos",
         "Monitoramento via Terminal",
         "Extração de Contatos",
      ],
      buttonText: "Assinar Agora",
      popular: true
   }
];

const FAQS = [
   { q: "Qual é o requisito mínimo de hardware?", a: "Sistema Operacional: Windows 10 ou 11 (64 bits), Processador: Intel Core i3, equivalente ou superior, 4 GB de Memória RAM, 500 MB livres em Disco, Internet: Recomendado 10mbps ou superior." },
   { q: "Como faço a instalação inicial?", a: "É só fazer download via painel após o pagamento. Basta executar o instalador, ativar com sua chave e configurar em menos de 5 minutos." },
   { q: "Quantas mensagens posso enviar por dia?", a: "O limite é definido pela saúde do seu chip, mas nossa tecnologia Stealth Core permite que você escale muito além das ferramentas web comuns." },
   { q: "Preciso deixar o PC ligado?", a: "Sim, como é uma solução desktop nativa focada em segurança, o processamento ocorre na sua máquina para evitar detecção externa." },
   { q: "Posso usar em mais de um computador?", a: "A licença é vinculada a um hardware por vez, mas você pode solicitar a transferência de máquina através do nosso suporte." },
   { q: "As atualizações são pagas?", a: "Não. Todas as atualizações de segurança e novas funcionalidades estão inclusas no seu plano mensal sem custo adicional." },
   { q: "Quanto tempo dura a licença após o pagamento?", a: "A ativação é imediata e o plano mensal cobre 30 dias corridos, com renovação flexível e sem interrupções." },
   { q: "Existe garantia de não banimento?", a: "Não! Nenhum sistema é imune, desconfie de quem vende como 100% seguro, mas o Nexus 360 possui a tecnologia mais avançada do mercado para reduzir os riscos ao nível mínimo possível." },
   { q: "O pagamento via PIX libera na hora?", a: "Sim. Nosso sistema é integrado; assim que o pagamento é confirmado pelo Mercado Pago, sua licença é ativada instantaneamente." },
   { q: "Posso cancelar quando quiser?", a: "Sim, não existe contrato de fidelidade. Você pode cancelar sua assinatura a qualquer momento diretamente pelo seu painel." }
];

export default function VendasPage() {
   const [loading, setLoading] = useState<string | null>(null);
   const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
   const [userData, setUserData] = useState({ name: "", email: "" });
   const [openFaq, setOpenFaq] = useState<number | null>(0);
   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

   useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
         setMousePos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
   }, []);

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!showEmailModal) return;

      const caktoLinks: Record<string, string> = {
         "mensal": "https://pay.cakto.com.br/LINK_MENSAL",
         "trimestral": "https://pay.cakto.com.br/LINK_TRIMESTRAL",
         "anual": "https://pay.cakto.com.br/LINK_ANUAL"
      };

      const link = caktoLinks[showEmailModal];
      if (link) {
         window.location.href = link;
      } else {
         alert("Plano em manutenção.");
      }
   };

   return (
      <main className="min-h-screen bg-[#1e2128] text-[#eaeff5] font-sans selection:bg-[#38bdf8]/30 overflow-x-hidden relative">
         <title>NEXUS360 - Automação e Menssageria</title>

         {/* ISOLATED DARK NEUMORPHISM STYLE SHIELD */}
         <style dangerouslySetInnerHTML={{
            __html: `
            :root {
               --bg-nm: #1e2128;
               --fg-nm: #eaeff5;
               --nm-sec: #94a3b8;
               --nm-primary: #38bdf8;
               --nm-shadow-light: #2b303b;
               --nm-shadow-dark: #0f1115;
            }
            
            /* Classes Neumórficas no Modo Escuro Oficial do Nexus360D */
            .nm-flat {
               background: var(--bg-nm);
               box-shadow: 9px 9px 16px var(--nm-shadow-dark), -9px -9px 16px var(--nm-shadow-light);
               border-radius: 24px;
               border: 1px solid rgba(255, 255, 255, 0.02);
            }

            .nm-inset {
               background: var(--bg-nm);
               box-shadow: inset 9px 9px 16px var(--nm-shadow-dark), inset -9px -9px 16px var(--nm-shadow-light);
               border-radius: 24px;
               border: 1px solid rgba(255, 255, 255, 0.01);
            }

            .nm-flat-sm {
               background: var(--bg-nm);
               box-shadow: 4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light);
               border-radius: 12px;
               border: 1px solid rgba(255, 255, 255, 0.02);
            }

            .nm-inset-sm {
               background: var(--bg-nm);
               box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
               border-radius: 12px;
               border: 1px solid rgba(255, 255, 255, 0.01);
            }

            .nm-button {
               background: var(--bg-nm);
               box-shadow: 6px 6px 12px var(--nm-shadow-dark), -6px -6px 12px var(--nm-shadow-light);
               border-radius: 16px;
               transition: all 0.2s ease;
               cursor: pointer;
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

            .nm-button-primary {
               background: var(--bg-nm);
               box-shadow: 6px 6px 12px var(--nm-shadow-dark), -6px -6px 12px var(--nm-shadow-light);
               border-radius: 16px;
               color: var(--nm-primary);
               font-weight: bold;
               transition: all 0.2s ease;
               border: 1px solid rgba(255, 255, 255, 0.03);
               cursor: pointer;
               outline: none;
            }

            .nm-button-primary:hover {
               box-shadow: 3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light);
               color: #7dd3fc;
            }

            .nm-button-primary:active {
               box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
               transform: scale(0.98);
            }
         `}} />

         {/* SOFT BACKGROUND GLOWS (Modo Escuro Sutil) */}
         <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[12%] right-[8%] w-[50%] h-[50%] bg-[#38bdf8]/4 blur-[130px] rounded-full" />
            <div className="absolute bottom-[15%] left-[8%] w-[50%] h-[50%] bg-purple-600/3 blur-[130px] rounded-full" />
         </div>

         {/* FLOATING PILL MENU ACRYLIC (Modo Escuro Neumorphism) */}
         <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl">
            <nav className="nm-flat p-2.5 flex items-center justify-between pl-8 pr-3">
               <div className="flex items-center gap-10">
                  <div className="flex items-center gap-3">
                     <img src="/xnexus.png" alt="Nexus" className="h-10 w-auto object-contain" />
                  </div>
                  <div className="hidden md:flex items-center gap-5 text-[12px] font-mono font-black uppercase tracking-[0.2em] text-[#94a3b8]">
                     <a href="#tecnologia" className="hover:text-[#38bdf8] transition-colors">Tecnologia</a>
                     <a href="#solucoes" className="hover:text-[#38bdf8] transition-colors">Soluções</a>
                     <a href="#faq" className="hover:text-[#38bdf8] transition-colors">FAQ</a>
                     <a href="#precos" className="hover:text-[#38bdf8] transition-colors">Preços</a>
                  </div>
               </div>
               <Link href="/portalcliente" className="nm-button-primary px-6 py-2.5 text-[10px] uppercase tracking-wider transition-all">
                  Área do Cliente
               </Link>
            </nav>
         </div>

         {/* HERO WITH NEUMORPHIC PLATE PULSING LOGO */}
         <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 relative pt-32 pb-20 z-10">
            <div className="relative animate-in fade-in zoom-in duration-1000">


               {/* Logo Central (Sem a moldura neumórfica conforme pedido) */}
               <div className="mb-16 relative inline-block">
                  <img src="/xnexus.png" alt="Nexus" className="h-64 w-auto relative z-10" />
               </div>

               <h1 className="text-5xl md:text-[8vw] font-black tracking-tighter leading-[0.8] uppercase italic mb-16 text-[#eaeff5]">
                  A PRÓXIMA <br />
                  GERAÇÃO <br />
                  DA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-blue-400">AUTOMAÇÃO.</span>
               </h1>

               <p className="text-lg md:text-xl text-[#eaeff5] font-black max-w-4xl mx-auto mb-10 italic tracking-tight uppercase">
                  DOMINE O MERCADO COM O <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-blue-400">NEXUS360.</span>
               </p>

               <p className="text-base md:text-lg text-[#94a3b8] font-medium max-w-3xl mx-auto mb-24 italic tracking-normal leading-relaxed">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-blue-400 block mb-2 font-bold font-mono text-xs tracking-widest uppercase">A Revolução é Invisível...</span>
                  O Nexus 360 foi criado para empresários que exigem performance sem comprometer a segurança. Simulação humana perfeita em cada disparo.
               </p>

               <div className="flex justify-center">
                  <div className="w-10 h-16 nm-inset rounded-full flex justify-center p-2.5">
                     <div className="w-1.5 h-3 bg-[#38bdf8] rounded-full animate-bounce" />
                  </div>
               </div>
            </div>
         </section>

         {/* MÓDULO 1: DEMONSTRAÇÃO EM VÍDEO (Estilo Neumorphism Window) */}
         <section id="solucoes" className="py-1 px-8 max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 nm-inset-sm mb-6 font-mono text-[9px] uppercase tracking-wider text-[#38bdf8] font-bold">
                     <LucideMonitor size={10} /> MODULE_VIEW::DESKTOP_ENGINE
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-8 leading-none text-[#eaeff5]">
                     O Poder da <br /> <span className="text-[#38bdf8]">Escala Real.</span>
                  </h2>
                  <p className="text-lg text-[#94a3b8] leading-relaxed font-medium mb-12 italic">
                     Não vendemos apenas uma ferramenta, entregamos liberdade operacional. Veja como o Nexus 360 transforma disparos manuais em uma máquina de vendas automática.
                  </p>
                  <ul className="space-y-6">
                     {[
                        "Interface Intuitiva & Veloz",
                        "Controle total de instâncias",
                        "Relatórios em tempo real"
                     ].map((t, i) => (
                        <li key={i} className="flex items-center gap-4 text-xs font-mono font-black uppercase tracking-widest text-[#eaeff5]">
                           <div className="w-8 h-8 nm-flat-sm flex items-center justify-center text-[#38bdf8] shrink-0">
                              <LucidePlay className="text-[#38bdf8] fill-[#38bdf8]/10" size={12} />
                           </div>
                           {t}
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Video Frame Neumorphic Card */}
               <div className="order-1 lg:order-2 relative group">
                  <div className="nm-flat p-5">
                     <div className="rounded-[16px] overflow-hidden aspect-video border border-[#0f1115]/30 shadow-inner bg-black">
                        <iframe
                           className="w-full h-full"
                           src="https://www.youtube.com/embed/OOW62bzvNec?autoplay=0&controls=1&rel=0"
                           title="NEXUS 360 Demonstração"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                        ></iframe>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* MÓDULO 2: SEGURANÇA STEALTH (Neumorphism Info Plates) */}
         <section id="tecnologia" className="py-24 relative z-10 overflow-hidden border-y border-[#0f1115]/50">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                  <div>
                     <div className="relative inline-block mb-8">
                        <div className="w-16 h-16 rounded-2xl nm-flat flex items-center justify-center text-emerald-400 relative z-10">
                           <LucideLock size={32} />
                        </div>
                     </div>
                     <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-8 leading-none text-[#eaeff5]">
                        Blindagem <br /> <span className="text-emerald-400">Anti-Ban.</span>
                     </h2>
                     <p className="text-lg text-[#94a3b8] leading-relaxed font-medium italic max-w-xl mb-12">
                        A engenharia mais avançada do mercado para manter sua operação 100% invisível aos algoritmos de detecção.
                     </p>

                     <div className="flex items-center gap-4 p-4 nm-inset-sm inline-flex font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                        <LucideShieldCheck className="text-emerald-400 animate-pulse" size={20} />
                        <span>Proteção Ativa 24/7 Atualizada</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     {[
                        { icon: LucideFingerprint, title: "Fingerprint Digital", desc: "Emulação completa de hardware e SO para cada chip.", color: "text-[#38bdf8]" },
                        { icon: LucideZap, title: "Escrita Humana 2.0", desc: "Intervalos randômicos que simulam o pensamento real.", color: "text-amber-400" },
                        { icon: LucideCpu, title: "Zero Footprint", desc: "Sem extensões detectáveis. Motor local nativo.", color: "text-purple-400" },
                        { icon: LucideScanFace, title: "Smart Heat-up", desc: "Aquecimento inteligente para novos chips.", color: "text-orange-400" }
                     ].map((item, idx) => (
                        <div key={idx} className="p-8 nm-flat hover:scale-[1.01] transition-transform duration-300 relative group flex flex-col justify-between">
                           <div className="absolute top-4 right-4 font-mono text-[8px] text-[#94a3b8] font-bold">N360D::SYS_{idx + 1}</div>
                           <item.icon size={28} className={`${item.color} mb-6 group-hover:scale-105 transition-transform`} />
                           <div>
                              <h4 className="text-base font-black uppercase italic mb-2 tracking-tighter text-[#eaeff5]">{item.title}</h4>
                              <p className="text-xs font-semibold italic text-[#94a3b8] leading-snug">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* MÓDULO: INTELLIGENCE CHAT (Estilo Neumorphism Neural Cards) */}
         <section id="intelligence" className="py-10 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                  {/* LADO 1: GRID DE CARDS (3 QUADRADOS) */}
                  <div className="order-2 lg:order-1 relative group">
                     <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="p-8 nm-flat hover:scale-[1.01] transition-transform duration-300 group">
                           <LucideBrainCircuit size={28} className="text-purple-400 mb-6 group-hover:scale-105 transition-transform" />
                           <h4 className="text-base font-black uppercase italic mb-2 tracking-tighter text-[#eaeff5]">Rede Neural</h4>
                           <p className="text-xs text-[#94a3b8] italic leading-snug">Respostas inteligentes baseadas no contexto real e intenção do lead.</p>
                        </div>
                        <div className="p-8 nm-flat hover:scale-[1.01] transition-transform duration-300 md:mt-10 group">
                           <LucideSparkles size={28} className="text-violet-400 mb-6 group-hover:scale-105 transition-transform" />
                           <h4 className="text-base font-black uppercase italic mb-2 tracking-tighter text-[#eaeff5]">Toque Humano</h4>
                           <p className="text-xs text-[#94a3b8] italic leading-snug">Simulação de micro-erros e pausas para reflexão orgânica.</p>
                        </div>
                        <div className="p-8 nm-flat hover:scale-[1.01] transition-transform duration-300 md:col-span-2 group">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 nm-inset-sm flex items-center justify-center text-indigo-400 shrink-0">
                                 <LucideNetwork size={22} className="group-hover:scale-105 transition-transform" />
                              </div>
                              <div>
                                 <h4 className="text-base font-black uppercase italic mb-1 tracking-tighter text-[#eaeff5]">Interação Inter-Chips</h4>
                                 <p className="text-xs text-[#94a3b8] italic leading-snug">Aquecimento natural com conversas reais entre seus próprios chips.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* LADO 2: TEXTO E CONTEÚDO */}
                  <div className="order-1 lg:order-2">
                     <div className="relative inline-block mb-8">
                        <div className="w-16 h-16 rounded-2xl nm-flat flex items-center justify-center text-purple-400 relative z-10">
                           <LucideMessagesSquare size={32} />
                        </div>
                     </div>
                     <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-8 leading-none text-[#eaeff5]">
                        Intelligence <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">Chat IA.</span>
                     </h2>
                     <p className="text-lg text-[#94a3b8] leading-relaxed font-medium italic max-w-xl mb-12">
                        A automação que não parece robô. Nossa IA processa o sentimento da conversa e responde com a naturalidade de um atendente de elite.
                     </p>
                     <div className="space-y-4 font-mono text-[11px] uppercase tracking-widest text-[#94a3b8] font-black">
                        {[
                           "Análise em Tempo Real",
                           "Memória de 3000 mensagens",
                           "Simulação humana de Chat"
                        ].map((text, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="w-6 h-6 nm-flat-sm flex items-center justify-center text-purple-400 shrink-0">
                                 <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                              </div>
                              <span className="italic">{text}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* MÓDULO 3: WORKFLOW & ESCALA (Estilo Multi-Instance Flat Panels) */}
         <section id="solucoes" className="py-20 px-8 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
               <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none text-[#eaeff5]">
                  Engenharia de <br /> <span className="text-[#38bdf8]">Alta Densidade.</span>
               </h2>
               <p className="text-[#94a3b8] font-mono font-black uppercase tracking-[0.4em] text-[9px]">INFRAESTRUTURA COMPLETA PARA OPERAÇÕES DE ESCALA PROFISSIONAL</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  {
                     icon: LucideServer,
                     title: "Gestão Multi-Instância",
                     desc: "Controle absoluto de até 5 chips simultâneos rodando em processos isolados para evitar cross-tracking. Sincronização em tempo real com o Hub central.",
                     tag: "SYS_CORE::MULTI_EXEC",
                     color: "text-blue-400"
                  },
                  {
                     icon: LucideLayers,
                     title: "Motor de Sequenciamento",
                     desc: "Algoritmo de envio inteligente com delays orgânicos entre blocos, simulação de comportamento humano e higienização automática de listas.",
                     tag: "SYS_IA::STEALTH_ENGINE",
                     color: "text-indigo-400"
                  },
                  {
                     icon: LucideBarChart3,
                     title: "Estratégia Secure Engine",
                     desc: "Painel administrativo completo para monitorar o status de cada envio, saúde dos chips e taxa de entrega em tempo real.",
                     tag: "SYS_DIAG::PERFORMANCE_HUB",
                     color: "text-purple-400"
                  }
               ].map((card, i) => (
                  <div key={i} className="nm-flat p-8 hover:scale-[1.01] transition-transform duration-500 flex flex-col justify-between h-full">
                     <div>
                        <div className="w-14 h-14 rounded-2xl nm-inset flex items-center justify-center mb-8 shrink-0">
                           <card.icon size={26} className={card.color} />
                        </div>
                        <div className="px-3 py-1 nm-inset-sm inline-block mb-6 font-mono text-[8px] font-bold text-slate-400 tracking-wider">
                           {card.tag}
                        </div>
                        <h3 className="text-xl font-black uppercase italic mb-6 leading-tight text-[#eaeff5]">{card.title}</h3>
                        <p className="text-sm font-semibold italic text-[#94a3b8] leading-relaxed">
                           {card.desc}
                        </p>
                     </div>
                     <div className="mt-8 pt-6 border-t border-[#0f1115]/50 w-full flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                        <span>NEXUS360D_CHIP_v1.0</span>
                        <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse"></span>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* FAQ SECTION (Estilo Neumorphism Toggle Accordion) */}
         <section id="faq" className="py-24 bg-black/15 border-y border-[#0f1115]/50 px-8 relative z-10">
            <div className="max-w-5xl mx-auto">
               <div className="text-center mb-20">
                  <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-[#eaeff5]">Dúvidas Frequentes.</h2>
                  <p className="text-[#38bdf8] font-mono font-black uppercase tracking-widest text-[9px]">SISTEMA DE CONSULTA & FAQ NATIVO</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className={`group transition-all duration-500 rounded-2xl overflow-hidden ${openFaq === i ? 'nm-inset' : 'nm-flat hover:scale-[1.005]'}`}>
                        <button
                           onClick={() => setOpenFaq(openFaq === i ? null : i)}
                           className="w-full p-5 flex items-center justify-between text-left outline-none"
                        >
                           <span className={`text-sm font-black uppercase italic tracking-tight transition-colors ${openFaq === i ? 'text-[#38bdf8]' : 'text-slate-300 group-hover:text-white'}`}>
                              {faq.q}
                           </span>
                           <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center nm-flat transition-all ${openFaq === i ? 'rotate-45 text-[#38bdf8]' : 'text-slate-400'}`}>
                              <LucidePlus size={10} />
                           </div>
                        </button>

                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <div className="p-5 pt-0 text-xs font-semibold italic text-[#94a3b8] leading-relaxed border-t border-[#0f1115]/50 mt-1 font-mono">
                              {faq.a}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* PLANOS SECTION (Estilo Licença Neumórfica de Software) */}
         <section id="precos" className="py-10 relative z-10 px-8">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-32">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6 text-[#eaeff5]">INVESTIMENTO EM <span className="text-[#38bdf8]">RETORNO.</span></h2>
                  <p className="text-slate-500 font-mono font-black uppercase tracking-[0.4em] text-[9px]">OFERTA ESPECIAL DE LANÇAMENTO</p>
               </div>

               <div className="flex justify-center items-center">
                  {PLANS.map((plan) => (
                     <div key={plan.id} className="relative group max-w-lg w-full">
                        <div className="nm-flat p-12 lg:p-14 flex flex-col w-full relative overflow-hidden">

                           {/* Tarja superior do plano */}
                           <div className="absolute top-0 right-0 left-0 bg-[#38bdf8]/10 border-b border-[#38bdf8]/15 py-3 px-8 flex items-center justify-between font-mono text-[8px] font-black text-[#38bdf8] uppercase tracking-widest">
                              <span>TIPO: DESKTOP_LICENSE</span>
                              <span>OFFER: 60% OFF</span>
                           </div>

                           <div className="mt-6 mb-8">
                              <h4 className="text-2xl font-black uppercase tracking-tighter italic text-[#eaeff5] mb-2">{plan.name}</h4>
                              <p className="text-[11px] font-bold text-[#94a3b8] italic leading-relaxed">{plan.description}</p>
                           </div>

                           <div className="mb-10 p-6 nm-inset font-mono relative">
                              <div className="absolute top-2 right-4 text-[7px] text-slate-500 tracking-widest uppercase font-bold">NEXUS360D::PRICING</div>
                              <span className="text-xs font-black text-slate-500 line-through mr-4 italic">R${plan.oldPrice}</span>
                              <div className="text-6xl font-black italic text-[#eaeff5] mt-1">R${plan.price}</div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#38bdf8]">{plan.period}</span>
                           </div>

                           <div className="space-y-4 mb-12 flex-1 font-semibold text-slate-400">
                              {plan.features.map((f, i) => (
                                 <div key={i} className="flex items-center gap-3">
                                    <LucideCheck size={16} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-slate-400 tracking-tight">{f}</span>
                                 </div>
                              ))}
                           </div>

                           <button onClick={() => setShowEmailModal(plan.id)} className="w-full py-5 nm-button font-mono font-black uppercase tracking-widest text-xs text-[#38bdf8] hover:text-[#7dd3fc]">
                              {plan.buttonText}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* FOOTER ENHANCED (Estilo Neumorphic Diagnostic Footer) */}
         <footer className="py-20 border-t border-[#0f1115]/50 bg-[#1e2128] px-8 relative z-10">
            <div className="max-w-7xl mx-auto font-mono">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
                  <div className="md:col-span-2">
                     <img src="/xnexus.png" alt="Nexus" className="h-8 w-auto mb-10" />
                     <p className="text-[#94a3b8] text-sm font-semibold italic leading-relaxed max-w-md">
                        NEXUS360 Impulsionado por Inteligência Artificial avançada, o aplicativo definitivo da próxima geração de automação para WhatsApp. Projetado para empresários, empreendedores, vendedores e visionários que demandam escala ilimitada, segurança inabalável e performance absoluta.
                     </p>
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 italic">Plataforma</h4>
                     <ul className="space-y-4 text-xs font-black uppercase italic text-[#94a3b8]">
                        <li><Link href="/testevendas/modulos" className="hover:text-[#38bdf8] transition-colors">Módulos</Link></li>
                        <li><Link href="/testevendas/tecnologia" className="hover:text-[#38bdf8] transition-colors">Tecnologia</Link></li>
                        <li><Link href="/testevendas/atualizacoes" className="hover:text-[#38bdf8] transition-colors">Atualizações</Link></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 italic">Legal</h4>
                     <ul className="space-y-4 text-xs font-black uppercase italic text-[#94a3b8]">
                        <li><Link href="/testevendas/termos" className="hover:text-[#38bdf8] transition-colors">Termos de Uso</Link></li>
                        <li><Link href="/testevendas/privacidade" className="hover:text-[#38bdf8] transition-colors">Privacidade</Link></li>
                        <li><Link href="/testevendas/cookies" className="hover:text-[#38bdf8] transition-colors">Cookies</Link></li>
                     </ul>
                  </div>
               </div>
               <div className="pt-10 border-t border-[#0f1115]/50 flex flex-col md:flex-row justify-center items-center gap-8 text-[9px] text-[#94a3b8] font-black">
                  <p className="uppercase tracking-[0.3em]">NEXUS 360 - WORKMANOS 2026 / ALL RIGHTS RESERVED</p>

               </div>
            </div>
         </footer>

         {/* MODAL DE ATIVAÇÃO DE LICENÇA (Neumorphism Modal Interface) */}
         {showEmailModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
               <div className="absolute inset-0 bg-[#1e2128]/85 backdrop-blur-md" onClick={() => setShowEmailModal(null)} />

               {/* Terminal Activation Panel */}
               <div className="relative nm-flat w-full max-w-lg p-12 shadow-2xl animate-in zoom-in-95 duration-300 text-center">

                  {/* Header do Terminal */}
                  <div className="absolute top-0 right-0 left-0 bg-[#1e2128] py-3.5 px-8 border-b border-[#0f1115]/50 rounded-t-[24px] flex items-center justify-between font-mono text-[8px] text-[#94a3b8] font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-2">
                        <LucideShieldAlert size={10} className="text-[#38bdf8]" />
                        <span>NEXUS360D::SECURE_TUNNEL_ACTIVATION</span>
                     </div>
                     <button onClick={() => setShowEmailModal(null)} className="text-[#94a3b8] hover:text-white font-bold transition-colors font-mono">FECHAR[X]</button>
                  </div>

                  <h3 className="text-2xl font-black italic uppercase text-white mt-6 mb-10 border-l-4 border-[#38bdf8] pl-4 text-left">RESERVAR LICENÇA</h3>

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                     <div className="space-y-2 text-left">
                        <label className="text-[8px] font-mono font-bold text-[#94a3b8] uppercase tracking-widest ml-1">NOME DO OPERADOR</label>
                        <input
                           type="text"
                           required
                           value={userData.name}
                           onChange={e => setUserData({ ...userData, name: e.target.value })}
                           className="w-full nm-inset p-4 text-sm font-mono uppercase text-white outline-none transition-all placeholder:text-slate-500 text-center font-bold"
                           placeholder="INSIRA SEU NOME"
                        />
                     </div>

                     <div className="space-y-2 text-left">
                        <label className="text-[8px] font-mono font-bold text-[#94a3b8] uppercase tracking-widest ml-1">EMAIL DE CONTATO DO SOFTWARE</label>
                        <input
                           type="email"
                           required
                           value={userData.email}
                           onChange={e => setUserData({ ...userData, email: e.target.value })}
                           className="w-full nm-inset p-4 text-sm font-mono uppercase text-white outline-none transition-all placeholder:text-slate-500 text-center font-bold"
                           placeholder="SEU MELHOR EMAIL"
                        />
                     </div>

                     <button type="submit" className="w-full py-5 nm-button font-mono font-black uppercase tracking-widest text-[10px] text-[#38bdf8] hover:text-[#7dd3fc] transition-all">
                        {loading ? 'SINCRONIZANDO...' : 'INICIAR ATIVAÇÃO DE CHAVE'}
                     </button>
                  </form>
               </div>
            </div>
         )}
      </main>
   );
}
