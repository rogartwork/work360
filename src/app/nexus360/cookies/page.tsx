import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function CookiesPage() {
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
                  Política de Cookies
               </h1>
            </div>
            
            <div className="space-y-12 text-[#94a3b8] leading-relaxed text-base font-semibold">
               <p className="text-[#eaeff5] font-black text-xl italic uppercase">Para proporcionar uma experiência fluída, garantir a segurança do seu acesso e manter a sua autenticação, o Nexus360 utiliza cookies e rastreadores essenciais em sua arquitetura web.</p>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">O que são Cookies?</h2>
                  <p>Cookies são pequenos arquivos armazenados no seu dispositivo quando você utiliza nossa plataforma. Eles desempenham funções técnicas fundamentais, desde validar o seu login de forma segura até nos ajudar a compreender a estabilidade do sistema em horários de pico.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">Como utilizamos os Cookies</h2>
                  <div className="space-y-8 mt-6">
                     <div className="nm-flat p-8">
                        <h3 className="text-xl font-bold text-[#eaeff5] mb-3 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-[#38bdf8]"></div>
                           1. Cookies Estritamente Necessários
                        </h3>
                        <p className="text-sm font-semibold">São a espinha dorsal da plataforma e não podem ser desativados. Eles permitem o acesso seguro à sua conta, a proteção contínua contra acessos não autorizados e o balanceamento eficiente das conexões de rede. Sem eles, as áreas internas do Nexus360 ficam inacessíveis.</p>
                     </div>

                     <div className="nm-flat p-8">
                        <h3 className="text-xl font-bold text-[#eaeff5] mb-3 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-[#38bdf8]"></div>
                           2. Cookies de Desempenho e Monitoramento
                        </h3>
                        <p className="text-sm font-semibold">Auxiliam a nossa engenharia a entender como a interface se comporta em diferentes cenários de uso. Eles monitoram silenciosamente métricas vitais como velocidade de carregamento e taxas de instabilidade. Esses dados são puramente técnicos, anônimos, e focados em aprimorar a confiabilidade do sistema.</p>
                     </div>

                     <div className="nm-flat p-8">
                        <h3 className="text-xl font-bold text-[#eaeff5] mb-3 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-[#38bdf8]"></div>
                           3. Cookies Funcionais
                        </h3>
                        <p className="text-sm font-semibold">Memorizam ajustes da sua interface para poupar tempo. Eles lembram detalhes como filtros ativos nos seus painéis e configurações de visualização, garantindo que o seu ambiente de trabalho esteja exatamente como você o deixou no último acesso.</p>
                     </div>
                  </div>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#eaeff5] mb-6 border-l-4 border-[#38bdf8] pl-4">Gerenciamento de Cookies</h2>
                  <p>Você é livre para gerenciar os cookies através das configurações de privacidade do seu navegador (Chrome, Edge, Safari, Firefox). Contudo, devido à natureza fechada e segura do Nexus360, restringir os <strong>Cookies Estritamente Necessários</strong> resultará em falha imediata ao tentar realizar login no painel de controle.</p>
               </section>
            </div>
         </div>
      </div>
   );
}
