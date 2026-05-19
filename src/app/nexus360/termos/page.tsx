import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function TermosPage() {
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
            <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[#38bdf8]/3 blur-[120px] rounded-full" />
         </div>

         <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
            <Link href="/testevendas" className="nm-button px-5 py-2.5 inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#38bdf8] transition-colors mb-16 group font-mono text-xs font-black uppercase">
               <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#38bdf8]" />
               Voltar para o Início
            </Link>

            <div className="mb-16 border-b border-[#0f1115]/50 pb-10">
               <div className="inline-block px-4 py-1.5 nm-inset-sm text-[#38bdf8] text-[9px] font-mono font-bold uppercase tracking-widest mb-6">Documentação Legal</div>
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-[#eaeff5] leading-tight">
                  Termos de Uso e Condições de Serviço
               </h1>
            </div>
            
            <div className="space-y-12 text-[#94a3b8] leading-relaxed text-base font-semibold">
               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">1. Aceitação</h2>
                  <p>Ao acessar e utilizar a plataforma Nexus360, você concorda expressamente com os termos e condições aqui estabelecidos. O uso de nossos serviços é estritamente destinado a fins corporativos, visando a automação e otimização de processos de atendimento.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">2. Licenciamento e Acesso</h2>
                  <p>A plataforma é fornecida sob o modelo de serviço. A licença concedida ao usuário é de caráter revogável, não exclusivo, intransferível e limitada ao plano contratado. Reservamo-nos o direito de suspender o acesso em caso de inadimplência ou violação destes termos.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">3. Uso Aceitável e Conformidade</h2>
                  <p className="mb-4">O usuário compromete-se a utilizar a plataforma em conformidade com a legislação vigente e as políticas dos canais integrados. É terminantemente proibido o uso do Nexus360 para:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 font-mono text-sm text-slate-500 font-bold">
                     <li>Envio massivo de mensagens não solicitadas (Spam).</li>
                     <li>Disseminação de conteúdo ilícito, difamatório, ameaçador ou que viole direitos autorais.</li>
                     <li>Atividades que possam comprometer a segurança ou integridade da nossa infraestrutura ou de redes terceiras.</li>
                  </ul>
                  <div className="mt-6 p-5 nm-inset text-emerald-400 font-bold uppercase tracking-wide text-xs">
                     O usuário é o único e exclusivo responsável por todo o conteúdo trafegado e pelas consequências de suas interações através da plataforma.
                  </div>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">4. Nível de Serviço (SLA) e Disponibilidade</h2>
                  <p>A nossa equipe emprega os melhores esforços técnicos para manter a máxima disponibilidade da plataforma. No entanto, não nos responsabilizamos por indisponibilidades decorrentes de manutenções programadas, falhas na infraestrutura de internet do usuário, ou instabilidades nos servidores de canais de comunicação integrados, cujas operações estão fora de nosso controle direto.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">5. Propriedade Intelectual</h2>
                  <p>Todo o código-fonte, design de interface, logomarca "Nexus360", documentação e tecnologias embarcadas são de nossa propriedade exclusiva. Qualquer tentativa de engenharia reversa, cópia não autorizada, ou reprodução do sistema resultará nas sanções legais cabíveis.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">6. Cancelamento e Reembolso</h2>
                  <p>O cancelamento da assinatura pode ser solicitado a qualquer momento pelo painel de controle. Políticas de reembolso operam em estrita conformidade com as regras de nossas plataformas de processamento de pagamentos parceiras e respeitam os prazos legais de arrependimento vigentes.</p>
               </section>
            </div>
         </div>
      </div>
   );
}
