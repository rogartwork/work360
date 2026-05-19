import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function ModulosPage() {
   return (
      <div className="min-h-screen bg-[#010206] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
         <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
            <Link href="/nexus360" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group">
               <LucideArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
               <span className="text-sm font-black uppercase tracking-widest italic">Voltar para o Início</span>
            </Link>

            <div className="mb-16">
               <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">Ecossistema Nexus360</div>
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 leading-tight">
                  Módulos Integrados para Máxima Eficiência
               </h1>
            </div>
            
            <div className="space-y-12">
               <p className="text-lg text-white/70 leading-relaxed font-medium">
                  O Nexus360 não é apenas uma ferramenta, é um ecossistema operacional completo focado em escala. Nossos módulos foram desenvolvidos para operar em sincronia perfeita, eliminando gargalos no atendimento e na conversão:
               </p>

               <div className="space-y-8">
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors">
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">Gestão de Atendimento de Alta Conversão</h2>
                     <p className="text-white/60 leading-relaxed">Visualização em painel organizado, gestão fluída de conversas, acompanhamento em tempo real e captura automática de dados de contatos.</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors">
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">Inbox Multi-Sessão Integrado</h2>
                     <p className="text-white/60 leading-relaxed">Nossa tecnologia proprietária permite múltiplas conexões nativas e simultâneas, sem atrasos, garantindo a entrega eficiente das suas mensagens e respostas rápidas aos clientes.</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors">
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">Central de Suporte Operacional</h2>
                     <p className="text-white/60 leading-relaxed">Módulo estruturado para resolução rápida de demandas, delegação de responsáveis, alertas de tempo de resposta e histórico persistente de atendimento por contato.</p>
                  </div>


               </div>
            </div>
         </div>
      </div>
   );
}
