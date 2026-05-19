import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function TermosPage() {
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
                  Termos de Uso e Condições de Serviço
               </h1>
            </div>
            
            <div className="space-y-12 text-white/60 leading-relaxed text-lg">
               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">1. Aceitação</h2>
                  <p>Ao acessar e utilizar a plataforma Nexus360, você concorda expressamente com os termos e condições aqui estabelecidos. O uso de nossos serviços é estritamente destinado a fins corporativos, visando a automação e otimização de processos de atendimento.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">2. Licenciamento e Acesso</h2>
                  <p>A plataforma é fornecida sob o modelo de serviço. A licença concedida ao usuário é de caráter revogável, não exclusivo, intransferível e limitada ao plano contratado. Reservamo-nos o direito de suspender o acesso em caso de inadimplência ou violação destes termos.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">3. Uso Aceitável e Conformidade</h2>
                  <p className="mb-4">O usuário compromete-se a utilizar a plataforma em conformidade com a legislação vigente e as políticas dos canais integrados. É terminantemente proibido o uso do Nexus360 para:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                     <li>Envio massivo de mensagens não solicitadas (Spam).</li>
                     <li>Disseminação de conteúdo ilícito, difamatório, ameaçador ou que viole direitos autorais.</li>
                     <li>Atividades que possam comprometer a segurança ou integridade da nossa infraestrutura ou de redes terceiras.</li>
                  </ul>
                  <p className="mt-4 text-blue-400 font-bold">O usuário é o único e exclusivo responsável por todo o conteúdo trafegado e pelas consequências de suas interações através da plataforma.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">4. Nível de Serviço (SLA) e Disponibilidade</h2>
                  <p>A nossa equipe emprega os melhores esforços técnicos para manter a máxima disponibilidade da plataforma. No entanto, não nos responsabilizamos por indisponibilidades decorrentes de manutenções programadas, falhas na infraestrutura de internet do usuário, ou instabilidades nos servidores de canais de comunicação integrados, cujas operações estão fora de nosso controle direto.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">5. Propriedade Intelectual</h2>
                  <p>Todo o código-fonte, design de interface, logomarca "Nexus360", documentação e tecnologias embarcadas são de nossa propriedade exclusiva. Qualquer tentativa de engenharia reversa, cópia não autorizada, ou reprodução do sistema resultará nas sanções legais cabíveis.</p>
               </section>

               <section>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6">6. Cancelamento e Reembolso</h2>
                  <p>O cancelamento da assinatura pode ser solicitado a qualquer momento pelo painel de controle. Políticas de reembolso operam em estrita conformidade com as regras de nossas plataformas de processamento de pagamentos parceiras e respeitam os prazos legais de arrependimento vigentes.</p>
               </section>
            </div>
         </div>
      </div>
   );
}
