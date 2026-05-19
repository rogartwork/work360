import Link from "next/link";
import { LucideArrowLeft } from "lucide-react";

export default function TecnologiaPage() {
   return (
      <div className="min-h-screen bg-[#010206] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
         <div className="max-w-4xl mx-auto px-8 py-20 relative z-10">
            <Link href="/nexus360" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12 group">
               <LucideArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
               <span className="text-sm font-black uppercase tracking-widest italic">Voltar para o Início</span>
            </Link>

            <div className="mb-16">
               <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">Arquitetura de Ponta</div>
               <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 leading-tight">
                  Construído para não falhar.
               </h1>
            </div>
            
            <div className="space-y-12">
               <p className="text-lg text-white/70 leading-relaxed font-medium">
                  A infraestrutura do Nexus360 foi desenhada por engenheiros focados em estabilidade, velocidade e segurança absoluta. Desenvolvemos uma plataforma robusta para garantir que sua operação nunca pare:
               </p>

               <div className="space-y-8">
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full"></div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4 relative z-10">Conexão de Alta Performance</h2>
                     <p className="text-white/60 leading-relaxed relative z-10">Nossa tecnologia exclusiva garante comunicação estável e imediata. Projetada para minimizar atrasos, otimizar consumo de recursos e oferecer estabilidade incomparável no envio e recepção de mensagens.</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full"></div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4 relative z-10">Interface Fluída e Responsiva</h2>
                     <p className="text-white/60 leading-relaxed relative z-10">Ambiente visual desenvolvido com os mais rigorosos padrões de performance. Carregamentos em milissegundos e micro-animações garantem uma experiência de uso imersiva, focada totalmente na sua produtividade.</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full"></div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4 relative z-10">Segurança de Dados Avançada</h2>
                     <p className="text-white/60 leading-relaxed relative z-10">Arquitetura estruturada para garantir a total integridade de suas informações, assegurando processamento rápido e seguro mesmo sob altíssimo volume de requisições simultâneas.</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full"></div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4 relative z-10">Infraestrutura em Nuvem Escalonável</h2>
                     <p className="text-white/60 leading-relaxed relative z-10">Sistema isolado e distribuído que balanceia carga automaticamente, adaptando-se sem falhas ao crescimento da sua operação, mantendo todos os processos criptografados e protegidos.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
