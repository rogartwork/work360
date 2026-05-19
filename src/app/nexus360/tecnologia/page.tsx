import Link from "next/link";
import { LucideArrowLeft, LucideMonitor } from "lucide-react";

export default function TecnologiaPage() {
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
            <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[#38bdf8]/3 blur-[120px] rounded-full" />
         </div>

         <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
            <Link href="/testevendas" className="nm-button px-5 py-2.5 inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#38bdf8] transition-colors mb-16 group font-mono text-xs font-black uppercase">
               <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#38bdf8]" />
               Voltar para o Início
            </Link>

            <div className="mb-16">
               <div className="inline-block px-4 py-1.5 nm-inset-sm text-[#38bdf8] text-[9px] font-mono font-bold uppercase tracking-widest mb-6">Arquitetura de Ponta</div>
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-[#eaeff5] leading-tight">
                  Construído para não falhar.
               </h1>
            </div>
            
            <div className="space-y-12">
               <p className="text-lg text-[#94a3b8] leading-relaxed font-semibold italic">
                  A infraestrutura do Nexus360 foi desenhada por engenheiros focados em estabilidade, velocidade e segurança absoluta. Desenvolvemos uma plataforma robusta para garantir que sua operação nunca pare:
               </p>

               <div className="space-y-8">
                  <div className="p-8 nm-flat hover:scale-[1.005] transition-transform duration-300 relative group">
                     <div className="absolute top-4 right-4 font-mono text-[8px] text-slate-600 font-bold">N360D::TECH_01</div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-4">Conexão de Alta Performance</h2>
                     <p className="text-[#94a3b8] leading-relaxed font-medium text-sm">Nossa tecnologia exclusiva garante comunicação estável e imediata. Projetada para minimizar atrasos, otimizar consumo de recursos e oferecer estabilidade incomparável no envio e recepção de mensagens.</p>
                  </div>

                  <div className="p-8 nm-flat hover:scale-[1.005] transition-transform duration-300 relative group">
                     <div className="absolute top-4 right-4 font-mono text-[8px] text-slate-600 font-bold">N360D::TECH_02</div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-4">Interface Fluída e Responsiva</h2>
                     <p className="text-[#94a3b8] leading-relaxed font-medium text-sm">Ambiente visual desenvolvido com os mais rigorosos padrões de performance. Carregamentos em milissegundos e micro-animações garantem uma experiência de uso imersiva, focada totalmente na sua produtividade.</p>
                  </div>

                  <div className="p-8 nm-flat hover:scale-[1.005] transition-transform duration-300 relative group">
                     <div className="absolute top-4 right-4 font-mono text-[8px] text-slate-600 font-bold">N360D::TECH_03</div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-4">Segurança de Dados Avançada</h2>
                     <p className="text-[#94a3b8] leading-relaxed font-medium text-sm">Arquitetura estruturada para garantir a total integridade de suas informações, assegurando processamento rápido e seguro mesmo sob altíssimo volume de requisições simultâneas.</p>
                  </div>

                  <div className="p-8 nm-flat hover:scale-[1.005] transition-transform duration-300 relative group">
                     <div className="absolute top-4 right-4 font-mono text-[8px] text-slate-600 font-bold">N360D::TECH_04</div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-4">Infraestrutura em Nuvem Escalonável</h2>
                     <p className="text-[#94a3b8] leading-relaxed font-medium text-sm">Sistema isolado e distribuído que balanceia carga automaticamente, adaptando-se sem falhas ao crescimento da sua operação, mantendo todos os processos criptografados e protegidos.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
