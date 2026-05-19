import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function CookiesPage() {
   return (
      <div className="min-h-screen bg-[#010206] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
         <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
            <Link href="/nexus360" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group">
               <LucideArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
               <span className="text-sm font-black uppercase tracking-widest italic">Voltar para o Início</span>
            </Link>

            <div className="mb-16 border-b border-white/5 pb-10">
               <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">Documentação Legal</div>
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 leading-tight">
                  Política de Cookies
               </h1>
            </div>
            
            <div className="space-y-12 text-white/60 leading-relaxed text-lg">
               <p className="text-white font-medium text-xl">Para proporcionar uma experiência fluída, garantir a segurança do seu acesso e manter a sua autenticação, o Nexus360 utiliza cookies e rastreadores essenciais em sua arquitetura web.</p>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">O que são Cookies?</h2>
                  <p>Cookies são pequenos arquivos armazenados no seu dispositivo quando você utiliza nossa plataforma. Eles desempenham funções técnicas fundamentais, desde validar o seu login de forma segura até nos ajudar a compreender a estabilidade do sistema em horários de pico.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">Como utilizamos os Cookies</h2>
                  <div className="space-y-8 mt-6">
                     <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                           1. Cookies Estritamente Necessários
                        </h3>
                        <p>São a espinha dorsal da plataforma e não podem ser desativados. Eles permitem o acesso seguro à sua conta, a proteção contínua contra acessos não autorizados e o balanceamento eficiente das conexões de rede. Sem eles, as áreas internas do Nexus360 ficam inacessíveis.</p>
                     </div>

                     <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                           2. Cookies de Desempenho e Monitoramento
                        </h3>
                        <p>Auxiliam a nossa engenharia a entender como a interface se comporta em diferentes cenários de uso. Eles monitoram silenciosamente métricas vitais como velocidade de carregamento e taxas de instabilidade. Esses dados são puramente técnicos, anônimos, e focados em aprimorar a confiabilidade do sistema.</p>
                     </div>

                     <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                           3. Cookies Funcionais
                        </h3>
                        <p>Memorizam ajustes da sua interface para poupar tempo. Eles lembram detalhes como filtros ativos nos seus painéis e configurações de visualização, garantindo que o seu ambiente de trabalho esteja exatamente como você o deixou no último acesso.</p>
                     </div>
                  </div>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">Gerenciamento de Cookies</h2>
                  <p>Você é livre para gerenciar os cookies através das configurações de privacidade do seu navegador (Chrome, Edge, Safari, Firefox). Contudo, devido à natureza fechada e segura do Nexus360, restringir os <strong>Cookies Estritamente Necessários</strong> resultará em falha imediata ao tentar realizar login no painel de controle.</p>
               </section>
            </div>
         </div>
      </div>
   );
}
