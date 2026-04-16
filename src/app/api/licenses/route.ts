import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET() {
  try {
    let targets = await prisma.targetDatabase.findMany({ where: { isActive: true } });
    const allLicenses = [];

    // Auto-deteção para VPS: Procura em múltiplos caminhos possíveis de volumes mapeados
    const fs = require('fs');
    const dbPaths = [
      '/x360-data/dev.db',
      '/x360-data/prisma/dev.db',
      '/x360-data/data/dev.db'
    ];
    
    let activePath = null;
    for (const p of dbPaths) {
      if (fs.existsSync(p)) {
        activePath = p;
        break;
      }
    }
    
    if (targets.length === 0 && activePath) {
      console.log("Detectado banco de dados X360C em:", activePath);
      targets = [{
        id: 'vps-auto',
        name: 'X360C Produção (VPS)',
        url: 'file:' + activePath,
        isActive: true
      } as any];
    } else if (targets.length === 0) {
      // DEBUG: Se não achou nada, lista o que tem na pasta para o usuário me avisar
      try {
        const files = fs.readdirSync('/x360-data', { recursive: true });
        return NextResponse.json({ 
          error: "Nenhum banco encontrado nos caminhos padrões.",
          debug_files_found: files,
          checked_paths: dbPaths
        }, { status: 404 });
      } catch (e: any) {
        return NextResponse.json({ error: "Pasta /x360-data não acessível ou vazia: " + e.message }, { status: 404 });
      }
    }

    for (const target of targets) {
      try {
        if (target.url.startsWith("file:")) {
          // Ajuste para caminhos Linux/Windows
          const dbPath = target.url.replace("file:///", "/").replace("file:", "");
          
          if (!fs.existsSync(dbPath)) {
            console.warn(`Arquivo não encontrado no caminho: ${dbPath}`);
            continue;
          }

          const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
          });

          // Buscar usuários (licenças)
          const users = await db.all(`SELECT id, name, role, maxSessions, expiresAt, isActive, plan FROM User`);
          
          // Buscar sessões para calcular chips
          const sessions = await db.all(`SELECT id, userId, status FROM WhatsAppSession`);

          // Associar chips a usuários
          const chipsByUserId: Record<string, { total: number; online: number }> = {};
          for (const session of sessions) {
            if (!chipsByUserId[session.userId]) {
              chipsByUserId[session.userId] = { total: 0, online: 0 };
            }
            chipsByUserId[session.userId].total += 1;
            if (session.status === "CONNECTED") {
              chipsByUserId[session.userId].online += 1;
            }
          }

          // Montar o payload final com informações da licença + chips agregados
          for (const user of users) {
             const userChips = chipsByUserId[user.id] || { total: 0, online: 0 };
             allLicenses.push({
               sourceDbId: target.id,
               sourceName: target.name,
               id: user.id,
               name: user.name || "Usuário Sem Nome",
               role: user.role,
               maxSessions: user.maxSessions,
               expiresAt: user.expiresAt,
               isActive: user.isActive,
               plan: user.plan,
               chipsConfigured: userChips.total,
               chipsOnline: userChips.online,
               serverIp: target.name === "X360C Local" ? "127.0.0.1" : "VPS",
               taskMode: null // Removido rastreamento invasivo, a pedido
             });
          }

          await db.close();
        } else {
          // Lógica futura para MySQL / Postgres se houver VPS
          console.warn("Conexões diferentes de SQLite/File ainda não suportadas para:", target.url);
        }
      } catch (err: any) {
        console.error(`Erro ao ler banco ${target.name}:`, err.message);
      }
    }

    return NextResponse.json(allLicenses);
  } catch (error: any) {
    console.error("ERRO:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
