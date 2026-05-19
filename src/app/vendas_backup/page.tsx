"use client";

import { useState } from "react";
import {
   LucideCheck, LucideArrowDown, LucideActivity, LucideShieldCheck,
   LucideZap, LucideArrowRight, LucideRocket, LucideQuote, LucidePlay,
   LucideCrown, LucideMonitor, LucideLayers, LucideImage, LucideSmartphone,
   LucideSettings, LucideHistory, LucideLock, LucideCpu, LucideGlobe, LucideHeadphones,
   LucidePlus, LucideMinus, LucideFingerprint, LucideScanFace, LucideShieldAlert,
   LucideBriefcase, LucideTrendingUp, LucideMessageSquare, LucideBarChart3, LucideServer,
   LucideBrainCircuit, LucideSparkles, LucideMessagesSquare, LucideNetwork
} from "lucide-react";
import Link from "next/link";

const PLANS = [
   {
      id: "mensal",
      name: "Nexus360 Mensal",
      price: "67,99",
      oldPrice: "168,90",
      period: "/mês",
      description: "Automação completa para até 5 chips com Auta performance.",
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

   const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!showEmailModal) return;

      // LINK DA CAKTO (Substituir pelos links reais de cada plano)
      const caktoLinks: Record<string, string> = {
         "mensal": "https://pay.cakto.com.br/LINK_MENSAL",
         "trimestral": "https://pay.cakto.com.br/LINK_TRIMESTRAL",
         "anual": "https://pay.cakto.com.br/LINK_ANUAL"
      };

      const link = caktoLinks[showEmailModal];
      if (link) {
         // Aqui você poderia salvar o e-mail no seu banco antes de redirecionar
         window.location.href = link;
      } else {
         alert("Plano em manutenção.");
      }
   };

   return (
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600 overflow-x-hidden">
         <title>NEXUS360 - Automação e Menssageria</title>

         {/* DYNAMIC MESH BACKGROUND */}
         <div className="fixed inset-0 z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
         </div>

         {/* FLOATING PILL MENU ACRYLIC */}
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl">
            <nav className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-2 rounded-full shadow-2xl flex items-center justify-between pl-8 pr-2">
               <div className="flex items-center gap-10">
                  <img src="/xnexus.png" alt="Nexus" className="h-8 w-auto" />
                  <div className="hidden md:flex items-center gap-10 text-[12px] font-black uppercase tracking-widest text-white/40">
                     <a href="#tecnologia" className="hover:text-white transition-colors">Tecnologia</a>
                     <a href="#solucoes" className="hover:text-white transition-colors">Soluções</a>
                     <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                     <a href="#precos" className="hover:text-white transition-colors">Preços</a>
                  </div>
               </div>
               <Link href="/portalcliente" className="px-6 py-2 bg-white text-black font-black uppercase tracking-widest text-[12px] rounded-full hover:bg-blue-500 hover:text-white transition-all">
                  Área do Cliente
               </Link>
            </nav>
         </div>

         {/* HERO WITH CENTRAL PULSING LOGO */}
         <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 relative pt-32 pb-20">
            <div className="relative z-10 animate-in fade-in zoom-in duration-1000">

               <div className="mb-20 relative group">
                  <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150 animate-pulse opacity-50 group-hover:opacity-100 transition-opacity" />
                  <img src="/xnexus.png" alt="Nexus" className="h-50 w-auto mx-auto relative z-10 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
               </div>

               <h1 className="text-5xl md:text-[9vw] font-black tracking-tighter leading-[0.8] uppercase italic mb-22">
                  A PRÓXIMA <br />
                  GERAÇÃO <br />
                  DA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-white">AUTOMAÇÃO.</span>
               </h1>

               <p className="text-xl md:text-2xl text-white/60 font-medium max-w-4xl mx-auto mb-22 italic tracking-tight">
                  DOMINE O MERCADO COM O <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-white">NEXUS360.</span>
               </p>
               <p className="text-xl md:text-2xl text-white/40 font-medium max-w-4xl mx-auto mb-32 italic tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-white">A Revolução é Invisível..</span>
                  O Nexus 360 foi criado para empresários que exigem performance sem comprometer a segurança. Simulação humana perfeita em cada disparo.
               </p>

               <div className="flex justify-center">
                  <div className="w-12 h-20 border-2 border-white/10 rounded-full flex justify-center p-3">
                     <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce" />
                  </div>
               </div>
            </div>
         </section>

         {/* MÓDULO 1: DEMONSTRAÇÃO EM VÍDEO */}
         <section id="video-demo" className="py-24 px-8 max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="order-2 lg:order-1">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-8 leading-none">
                     O Poder da <br /> <span className="text-blue-500">Escala Real.</span>
                  </h2>
                  <p className="text-2xl text-white/40 leading-relaxed font-medium mb-12 italic">
                     Não vendemos apenas uma ferramenta, entregamos liberdade operacional. Veja como o Nexus 360 transforma disparos manuais em uma máquina de vendas automática.
                  </p>
                  <ul className="space-y-6">
                     {[
                        "Interface Intuitiva & Veloz",
                        "Controle total de instâncias",
                        "Relatórios em tempo real"
                     ].map((t, i) => (
                        <li key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-white/80">
                           <LucidePlay className="text-blue-500 fill-blue-500" size={20} /> {t}
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="order-1 lg:order-2 relative group">
                  <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative bg-white/5 backdrop-blur-3xl aspect-video rounded-[1.5rem] border border-white/10 overflow-hidden shadow-xl">
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
         </section>

         {/* MÓDULO 2: SEGURANÇA STEALTH */}
         <section id="tecnologia" className="py-24 relative z-10 overflow-hidden bg-white/[0.02] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                  <div>
                     <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full animate-pulse" />
                        <LucideLock size={64} className="text-green-500 relative z-10" />
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-8 leading-[0.9]">
                        Blindagem <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Anti-Ban.</span>
                     </h2>
                     <p className="text-2xl text-white/40 leading-relaxed font-medium italic max-w-xl mb-12">
                        A engenharia mais avançada do mercado para manter sua operação 100% invisível aos algoritmos de detecção.
                     </p>

                     <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl inline-flex">
                        <LucideShieldCheck className="text-green-500" size={24} />
                        <span className="text-xs font-black uppercase tracking-widest text-green-400">Proteção Ativa 24/7 Atualizada</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                        { icon: LucideFingerprint, title: "Fingerprint Digital", desc: "Emulação completa de hardware e SO para cada chip.", color: "text-blue-400" },
                        { icon: LucideZap, title: "Escrita Humana 2.0", desc: "Intervalos randômicos que simulam o pensamento real.", color: "text-yellow-400" },
                        { icon: LucideCpu, title: "Zero Footprint", desc: "Sem extensões detectáveis. Motor local nativo.", color: "text-purple-400" },
                        { icon: LucideScanFace, title: "Smart Heat-up", desc: "Aquecimento inteligente para novos chips.", color: "text-orange-400" }
                     ].map((item, idx) => (
                        <div key={idx} className="p-8 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] hover:border-white/20 transition-all group">
                           <item.icon size={32} className={`${item.color} mb-6 group-hover:scale-110 transition-transform`} />
                           <h4 className="text-lg font-black uppercase italic mb-2 tracking-tighter">{item.title}</h4>
                           <p className="text-sm font-medium italic text-white/30 leading-snug">{item.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* MÓDULO: INTELLIGENCE CHAT (LILÁS - RESTAURANDO LAYOUT LADO A LADO) */}
         <section id="intelligence" className="py-30 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 relative z-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                  {/* LADO 1: GRID DE CARDS (3 QUADRADOS) */}
                  <div className="order-2 lg:order-1 relative group">
                     <div className="absolute -inset-10 bg-purple-600/10 blur-[100px] rounded-full animate-pulse" />
                     <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-8 bg-white/[0.03] border border-purple-500/20 rounded-[2.5rem] backdrop-blur-3xl hover:border-purple-500/40 transition-all group">
                           <LucideBrainCircuit size={32} className="text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                           <h4 className="text-lg font-black uppercase italic mb-2 tracking-tighter">Rede Neural</h4>
                           <p className="text-sm text-white/30 italic leading-snug">Respostas inteligentes baseadas no contexto real e intenção do lead.</p>
                        </div>
                        <div className="p-8 bg-white/[0.03] border border-purple-500/20 rounded-[2.5rem] backdrop-blur-3xl md:mt-10 hover:border-purple-500/40 transition-all group">
                           <LucideSparkles size={32} className="text-violet-400 mb-6 group-hover:scale-110 transition-transform" />
                           <h4 className="text-lg font-black uppercase italic mb-2 tracking-tighter">Toque Humano</h4>
                           <p className="text-sm text-white/30 italic leading-snug">Simulação de micro-erros e pausas para reflexão orgânica.</p>
                        </div>
                        <div className="p-8 bg-white/[0.03] border border-purple-500/20 rounded-[2.5rem] backdrop-blur-3xl md:col-span-2 hover:border-purple-500/40 transition-all group">
                           <div className="flex items-center gap-6">
                              <LucideNetwork size={34} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                              <div>
                                 <h4 className="text-lg font-black uppercase italic mb-1 tracking-tighter">Interação Inter-Chips</h4>
                                 <p className="text-sm text-white/30 italic leading-snug">Aquecimento natural com conversas reais entre seus próprios chips.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* LADO 2: TEXTO E CONTEÚDO */}
                  <div className="order-1 lg:order-2">
                     <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                        <LucideMessagesSquare size={64} className="text-purple-400 relative z-10" />
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-8 leading-[0.9]">
                        Intelligence <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-600">Chat IA.</span>
                     </h2>
                     <p className="text-2xl text-white/40 leading-relaxed font-medium italic max-w-xl mb-12">
                        A automação que não parece robô. Nossa IA processa o sentimento da conversa e responde com a naturalidade de um atendente de elite.
                     </p>
                     <div className="space-y-4">
                        {[
                           "Análise em Tempo Real",
                           "Memória de 3000 menssagem",
                           "Simulação humana de Chat"
                        ].map((text, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              <span className="text-sm font-black uppercase tracking-widest text-white/60 italic">{text}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* MÓDULO 3: WORKFLOW & ESCALA */}
         <section id="solucoes" className="py-20 px-8 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-32">
               <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 leading-none">
                  Engenharia de <br /> <span className="text-blue-500">Alta Densidade.</span>
               </h2>
               <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Infraestrutura completa para operações de escala profissional</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  {
                     icon: LucideServer,
                     title: "Gestão Multi-Instância",
                     desc: "Controle absoluto de até 5 chips simultâneos rodando em processos isolados para evitar cross-tracking. Sincronização em tempo real com o Hub central.",
                     tag: "NÚCLEO",
                     color: "from-blue-600 to-indigo-600"
                  },
                  {
                     icon: LucideLayers,
                     title: "Motor de Sequenciamento",
                     desc: "Algoritmo de envio inteligente com delays orgânicos entre blocos, simulação de comportamento humano e higienização automática de listas.",
                     tag: "INTELIGÊNCIA ",
                     color: "from-indigo-600 to-purple-600"
                  },
                  {
                     icon: LucideBarChart3,
                     title: "Estratégia Secure Engine",
                     desc: "Painel administrativo completo para monitorar o status de cada envio, saúde dos chips e taxa de entrega em tempo real.",
                     tag: "PERFORMANCE",
                     color: "from-purple-600 to-pink-600"
                  }
               ].map((card, i) => (
                  <div key={i} className="relative group p-1 rounded-[3.5rem] bg-white/5 hover:bg-gradient-to-br transition-all duration-700 overflow-hidden flex flex-col items-start h-full" style={{ backgroundImage: `linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0.01))` }}>
                     <div className="p-10 relative z-10 flex flex-col h-full w-full bg-[#050505] rounded-[3.4rem]">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform`}>
                           <card.icon size={32} className="text-white" />
                        </div>
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full inline-block mb-6">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{card.tag}</span>
                        </div>
                        <h3 className="text-3xl font-black uppercase italic mb-6 leading-tight group-hover:text-blue-400 transition-colors">{card.title}</h3>
                        <p className="text-lg font-medium italic text-white/30 leading-relaxed flex-1">
                           {card.desc}
                        </p>
                        <div className="mt-10 pt-10 border-t border-white/5 w-full">

                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* FAQ SECTION */}
         <section id="faq" className="py-20 bg-white/[0.02] border-y border-white/5 px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">Dúvidas Frequentes.</h2>
                  <p className="text-blue-500 font-black uppercase tracking-widest text-[10px]">Tudo o que você precisa saber</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  {FAQS.map((faq, i) => (
                     <div key={i} className={`group border transition-all duration-500 rounded-xl overflow-hidden ${openFaq === i ? 'bg-white/[0.05] border-blue-500/30' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}>
                        <button
                           onClick={() => setOpenFaq(openFaq === i ? null : i)}
                           className="w-full p-4 flex items-center justify-between text-left outline-none"
                        >
                           <span className={`text-[15px] md:text-base font-black uppercase italic tracking-tighter transition-colors ${openFaq === i ? 'text-blue-400' : 'text-white/60 group-hover:text-white'}`}>
                              {faq.q}
                           </span>
                           <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${openFaq === i ? 'bg-blue-600 border-blue-600 rotate-45' : 'bg-white/5 border-white/10'}`}>
                              <LucidePlus size={10} className="text-white" />
                           </div>
                        </button>

                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <div className="p-4 pt-0 text-sm font-medium italic text-white/40 leading-relaxed border-t border-white/5 mt-1">
                              {faq.a}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* PLANOS SECTION */}
         <section id="planos" className="py-40 relative z-10 px-8">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-32">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic mb-6">INVESTIMENTO EM <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">RETORNO.</span></h2>
                  <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">OFERTA ESPECIAL DE LANÇAMENTO</p>
               </div>

               <div className="flex justify-center items-center">
                  {PLANS.map((plan) => (
                     <div key={plan.id} className={`bg-white/[0.03] backdrop-blur-3xl p-12 lg:p-16 rounded-[4rem] border transition-all duration-1000 flex flex-col max-w-lg w-full ${plan.popular ? 'border-blue-500/40 shadow-2xl scale-105 z-10 bg-white/[0.05]' : 'border-white/5 hover:border-white/10'}`}>
                        {plan.popular && (
                           <div className="mb-10 px- py-2 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-center shadow-2xl">
                              OFERTA ESPECIAL DE LANÇAMENTO COM 60% DE DESCONTO
                           </div>

                        )}
                        <h4 className="text-2xl font-black uppercase tracking-tighter italic mb-4">{plan.name}</h4>
                        <p className="text-xs font-bold text-white/30 mb-10 italic leading-relaxed">{plan.description}</p>

                        <div className="mb-12">
                           <span className="text-2xl font-black text-white/20 line-through mr-4 italic">R${plan.oldPrice}</span>
                           <div className="text-7xl font-black italic">R${plan.price}</div>
                           <span className="text-xs font-black uppercase tracking-widest text-blue-500">{plan.period}</span>
                        </div>

                        <div className="space-y-4 mb-16 flex-1">
                           {plan.features.map((f, i) => (
                              <div key={i} className="flex items-center gap-3">
                                 <LucideCheck size={18} className="text-blue-500" />
                                 <span className="text-sm font-bold text-white/40 tracking-tight">{f}</span>
                              </div>
                           ))}
                        </div>

                        <button onClick={() => setShowEmailModal(plan.id)} className={`w-full py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all ${plan.popular ? 'bg-blue-600 text-white shadow-2xl hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
                           {plan.buttonText}
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* FOOTER ENHANCED */}
         <footer className="py-20 border-t border-white/5 bg-[#010206] px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
                  <div className="md:col-span-2">
                     <img src="/xnexus.png" alt="Nexus" className="h-10 w-auto mb-10" />
                     <p className="text-white/30 text-lg font-medium italic leading-relaxed max-w-md">
                        NEXUS360 Impulsionado por Inteligência Artificial avançada  aplicativo definitivo da próxima geração de automação para WhatsApp. Projetado para empresários, empreendedores,  vendedores e visionários que demandam escala ilimitada, segurança inabalável e performance absoluta.
                     </p>
                  </div>
                  <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-8 italic">Plataforma</h4>
                     <ul className="space-y-4 text-sm font-black uppercase italic text-white/60">
                        <li><Link href="/nexus360/modulos" className="hover:text-blue-500">Módulos</Link></li>
                        <li><Link href="/nexus360/tecnologia" className="hover:text-blue-500">Tecnologia</Link></li>
                        <li><Link href="/nexus360/atualizacoes" className="hover:text-blue-500">Atualizações</Link></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-8 italic">Legal</h4>
                     <ul className="space-y-4 text-sm font-black uppercase italic text-white/60">
                        <li><Link href="/nexus360/termos" className="hover:text-blue-500">Termos de Uso</Link></li>
                        <li><Link href="/nexus360/privacidade" className="hover:text-blue-500">Privacidade</Link></li>
                        <li><Link href="/nexus360/cookies" className="hover:text-blue-500">Cookies</Link></li>
                     </ul>
                  </div>
               </div>
               <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                  <p className="text-white/10 text-[9px] font-black uppercase tracking-[0.6em]">NEXUS 360 - WORKMANOS 2026 // ALL RIGHTS RESERVED</p>
                  <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">W</div>
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">I</div>
                  </div>
               </div>
            </div>
         </footer>

         {/* MODAL */}
         {showEmailModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
               <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setShowEmailModal(null)} />
               <div className="relative bg-[#02040a] border border-white/10 w-full max-w-lg rounded-[4.5rem] p-16 shadow-2xl animate-in zoom-in-95 duration-500 text-center">
                  <h3 className="text-4xl font-black italic uppercase text-white mb-12 border-l-8 border-blue-500 pl-10 tracking-tighter italic">RESERVAR LICENÇA</h3>
                  <form onSubmit={handleFormSubmit} className="space-y-10">
                     <input type="text" required value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-xl font-black uppercase italic tracking-tighter text-white outline-none focus:border-blue-500 transition-all placeholder:text-white/10 text-center" placeholder="SEU NOME" />
                     <input type="email" required value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-xl font-black uppercase italic tracking-tighter text-white outline-none focus:border-blue-500 transition-all placeholder:text-white/10 text-center" placeholder="SEU MELHOR EMAIL" />
                     <button type="submit" className="w-full py-8 bg-blue-600 text-white text-2xl font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-white hover:text-black transition-all">
                        {loading ? 'SINCRONIZANDO...' : 'ACESSAR AGORA'}
                     </button>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
