/**
 * Next.js Instrumentation Hook
 * Este arquivo é executado UMA ÚNICA VEZ quando o servidor inicia.
 * Usado para restaurar as sessões WhatsApp persistidas no banco.
 * 
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Só roda no servidor Node.js, não no Edge runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { restorePersistedSessions } = await import("@/lib/whatsapp/session");
    
    // Pequeno delay para garantir que o banco está pronto
    setTimeout(async () => {
      console.log("[WA] 🚀 Iniciando restauração de sessões WhatsApp...");
      await restorePersistedSessions();
    }, 2000);
  }
}
