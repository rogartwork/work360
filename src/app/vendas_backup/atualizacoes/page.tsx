import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function AtualizacoesPage() {
   return (
      <div className="min-h-screen bg-[#010206] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
         <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
            <Link href="/nexus360" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group">
               <LucideArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
               <span className="text-sm font-black uppercase tracking-widest italic">Voltar para o Início</span>
            </Link>

            <div className="mb-16">
               <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">Updates e Melhorias</div>
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 leading-tight">
                  Evolução Contínua. Sempre à frente do mercado.
               </h1>
            </div>
            
            <div className="space-y-12">
               <p className="text-lg text-white/70 leading-relaxed font-medium">
                  No Nexus360, a inovação é constante. Nossa equipe realiza atualizações ininterruptas para garantir que sua operação tenha sempre acesso às ferramentas e automatizações mais refinadas e seguras.
               </p>

               <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#010206] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl shadow-blue-500/20 text-blue-400 z-10">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-3xl bg-white/[0.02] border border-blue-500/30 shadow-2xl shadow-blue-500/5">
                        <div className="flex flex-col mb-4">
                           <span className="text-blue-400 font-black uppercase tracking-widest text-xs italic mb-2">Versão Atual</span>
                           <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Nexus360 Ecosystem</h2>
                        </div>
                        <ul className="text-white/60 space-y-3 leading-relaxed text-sm list-disc list-inside">
                           <li>Lançamento do ecossistema avançado de atendimento</li>
                           <li>Reestruturação de interface para máxima velocidade de resposta</li>
                           <li>Novo sistema de automação e integração de licenças</li>
                           <li>Estabilização de conexões simultâneas de alta densidade</li>
                        </ul>
                     </div>
                  </div>

                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#010206] text-white/50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-3xl bg-transparent border border-white/5">
                        <div className="flex flex-col mb-4">
                           <span className="text-white/30 font-black uppercase tracking-widest text-xs italic mb-2">Roadmap Futuro</span>
                           <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white/80">Próximos Passos</h2>
                        </div>
                        <ul className="text-white/50 space-y-3 leading-relaxed text-sm list-disc list-inside">
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
