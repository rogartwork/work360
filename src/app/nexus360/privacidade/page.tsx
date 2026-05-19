import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
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
                  Política de Privacidade e Proteção de Dados
               </h1>
            </div>
            
            <div className="space-y-12 text-[#94a3b8] leading-relaxed text-base font-semibold">
               <p className="text-[#eaeff5] font-black text-xl italic uppercase">O Nexus360 leva a segurança e a privacidade dos seus dados empresariais a sério. Estamos totalmente comprometidos com as melhores práticas e diretrizes legais de Proteção de Dados.</p>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">1. Coleta de Dados</h2>
                  <p>Coletamos exclusivamente as informações estritamente necessárias para o provimento, funcionamento e melhoria contínua da nossa plataforma. Isso inclui:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-4 font-mono text-sm text-slate-500 font-bold">
                     <li>Dados de Cadastro: Nome, e-mail comercial, telefone e informações de faturamento.</li>
                     <li>Dados Operacionais: Logs de atividade no sistema e métricas de acesso para estabilidade.</li>
                  </ul>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">2. Comunicações e Integridade</h2>
                  <p>As mensagens trafegadas pela nossa infraestrutura utilizam conexões e rotas seguras. Ressaltamos que <strong>não utilizamos o conteúdo das suas conversas para treinar modelos abertos de inteligência artificial</strong> e nem analisamos o teor delas para fins publicitários externos. Os dados transitam visando exclusivamente a garantia da sua operação.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">3. Armazenamento e Responsabilidade de Dados</h2>
                  <p>A sua base de contatos e informações é mantida em infraestrutura de nuvem com alto rigor de segurança, <strong>sendo a gestão, uso e o conteúdo desta base de inteira e exclusiva responsabilidade do contratante</strong>. Realizamos backups estratégicos e implementamos barreiras de acesso rigorosas; nossa equipe técnica tem alcance estritamente limitado, intervindo apenas quando solicitado para manutenções ou suporte.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">4. Compartilhamento de Dados</h2>
                  <p>O Nexus360 <strong>não vende e não comercializa</strong> a sua base de dados sob nenhuma hipótese. O trânsito de dados externo ocorre apenas de forma técnica para a manutenção da sua própria conta com:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-4 font-mono text-sm text-slate-500 font-bold">
                     <li>Gateways de Pagamento parceiros, para processamento de sua licença.</li>
                     <li>Provedores de Infraestrutura de Nuvem, que mantêm a aplicação no ar.</li>
                     <li>Autoridades competentes, apenas quando mediante obrigação ou ordem judicial.</li>
                  </ul>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">5. Seus Direitos</h2>
                  <p>Como titular da conta Nexus360, você detém o controle sobre os seus dados. Através de nossos canais oficiais de suporte, você pode solicitar:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-4 font-mono text-sm text-slate-500 font-bold">
                     <li>Confirmação e verificação dos dados armazenados.</li>
                     <li>Correção de dados incompletos.</li>
                     <li>Exportação de informações quando viável tecnicamente.</li>
                     <li>Exclusão completa do seu banco de dados e histórico, respeitadas as limitações de guarda obrigatória por lei.</li>
                  </ul>
               </section>
            </div>
         </div>
      </div>
   );
}
