import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function AtualizacoesPage() {
   return (
      <div className="min-h-screen bg-[#1e2128] text-[#eaeff5] selection:bg-[#38bdf8]/30 font-sans overflow-x-hidden relative">
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
               box-shadow: 4px 4px 8px var(--nm-shadow-dark), -4px -4px 8px var(--nm-shadow-light);
               border-radius: 16px;
               transition: all 0.2s ease;
               border: 1px solid rgba(255, 255, 255, 0.02);
               outline: none;
            }
            .nm-button:hover {
               box-shadow: 2px 2px 4px var(--nm-shadow-dark), -2px -2px 4px var(--nm-shadow-light);
               transform: translateY(-1px);
            }
            .nm-button:active {
               box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
               transform: scale(0.98) translateY(0);
            }
         `}} />

         {/* SOFT GLOWS */}
         <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[10%] right-[10%] w-[45%] h-[45%] bg-[#38bdf8]/3 blur-[125px] rounded-full" />
         </div>

         <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
            <Link href="/testevendas" className="nm-button px-5 py-2.5 inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#38bdf8] transition-colors mb-16 group font-mono text-xs font-black uppercase">
               <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#38bdf8]" />
               Voltar para o Início
            </Link>

            <div className="mb-16">
               <div className="inline-block px-4 py-1.5 nm-inset-sm text-[#38bdf8] text-[9px] font-mono font-bold uppercase tracking-widest mb-6">Updates e Melhorias</div>
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-[#eaeff5] leading-tight">
                  Evolução Contínua. Sempre à frente do mercado.
               </h1>
            </div>
            
            <div className="space-y-12">
               <p className="text-lg text-[#94a3b8] leading-relaxed font-semibold italic">
                  No Nexus360, a inovação é constante. Nossa equipe realiza atualizações ininterruptas para garantir que sua operação tenha sempre acesso às ferramentas e automatizações mais refinadas e seguras.
               </p>

               <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#0f1115]">
                  
                  {/* Item 1: Versão Atual */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/5 nm-flat shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl text-[#38bdf8] z-10">
                        <div className="w-2.5 h-2.5 bg-[#38bdf8] rounded-full animate-pulse"></div>
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 nm-flat relative group">
                        <div className="absolute top-4 right-4 font-mono text-[8px] text-[#38bdf8] font-bold">N360D::v1.2.1</div>
                        <div className="flex flex-col mb-4">
                           <span className="text-[#38bdf8] font-mono font-bold uppercase tracking-widest text-[10px] italic mb-2">Versão Atual</span>
                           <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5]">Nexus360 Ecosystem</h2>
                        </div>
                        <ul className="text-[#94a3b8] space-y-3 leading-relaxed text-sm list-disc list-inside font-semibold">
                           <li>Lançamento do ecossistema avançado de atendimento</li>
                           <li>Reestruturação de interface para máxima velocidade de resposta</li>
                           <li>Novo sistema de automação e integração de licenças</li>
                           <li>Estabilização de conexões simultâneas de alta densidade</li>
                        </ul>
                     </div>
                  </div>

                  {/* Item 2: Roadmap Futuro */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/5 nm-inset shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-slate-600 z-10">
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 nm-inset">
                        <div className="flex flex-col mb-4">
                           <span className="text-slate-500 font-mono font-bold uppercase tracking-widest text-[10px] italic mb-2">Roadmap Futuro</span>
                           <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#94a3b8]">Próximos Passos</h2>
                        </div>
                        <ul className="text-slate-500 space-y-3 leading-relaxed text-sm list-disc list-inside font-semibold font-mono">
                           <li>Integração inteligente para respostas otimizadas na caixa de entrada</li>
                           <li>Análise avançada e previsão de fechamentos no processo comercial</li>
                           <li>Automações em escala com segmentação e filtros detalhados</li>
                        </ul>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </div>
   );
}
