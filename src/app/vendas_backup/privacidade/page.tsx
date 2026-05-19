import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
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
                  Política de Privacidade e Proteção de Dados
               </h1>
            </div>
            
            <div className="space-y-12 text-white/60 leading-relaxed text-lg">
               <p className="text-white font-medium text-xl">O Nexus360 leva a segurança e a privacidade dos seus dados empresariais a sério. Estamos totalmente comprometidos com as melhores práticas e diretrizes legais de Proteção de Dados.</p>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">1. Coleta de Dados</h2>
                  <p>Coletamos exclusivamente as informações estritamente necessárias para o provimento, funcionamento e melhoria contínua da nossa plataforma. Isso inclui:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                     <li>Dados de Cadastro: Nome, e-mail comercial, telefone e informações de faturamento.</li>
                     <li>Dados Operacionais: Logs de atividade no sistema e métricas de acesso para estabilidade.</li>
                  </ul>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">2. Comunicações e Integridade</h2>
                  <p>As mensagens trafegadas pela nossa infraestrutura utilizam conexões e rotas seguras. Ressaltamos que <strong>não utilizamos o conteúdo das suas conversas para treinar modelos abertos de inteligência artificial</strong> e nem analisamos o teor delas para fins publicitários externos. Os dados transitam visando exclusivamente a garantia da sua operação.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">3. Armazenamento e Responsabilidade de Dados</h2>
                  <p>A sua base de contatos e informações é mantida em infraestrutura de nuvem com alto rigor de segurança, <strong>sendo a gestão, uso e o conteúdo desta base de inteira e exclusiva responsabilidade do contratante</strong>. Realizamos backups estratégicos e implementamos barreiras de acesso rigorosas; nossa equipe técnica tem alcance estritamente limitado, intervindo apenas quando solicitado para manutenções ou suporte.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">4. Compartilhamento de Dados</h2>
                  <p>O Nexus360 <strong>não vende e não comercializa</strong> a sua base de dados sob nenhuma hipótese. O trânsito de dados externo ocorre apenas de forma técnica para a manutenção da sua própria conta com:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                     <li>Gateways de Pagamento parceiros, para processamento de sua licença.</li>
                     <li>Provedores de Infraestrutura de Nuvem, que mantêm a aplicação no ar.</li>
                     <li>Autoridades competentes, apenas quando mediante obrigação ou ordem judicial.</li>
                  </ul>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">5. Seus Direitos</h2>
                  <p>Como titular da conta Nexus360, você detém o controle sobre os seus dados. Através de nossos canais oficiais de suporte, você pode solicitar:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
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
