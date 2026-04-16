import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET() {
  try {
    let targets = await prisma.targetDatabase.findMany({ where: { isActive: true } });
    const allLicenses = [];

    // Auto-deteção para VPS: Se não houver alvos e o arquivo do volume existir, adiciona temporariamente
    const fs = require('fs');
    const vpsDbPath = '/x360-data/dev.db';
    
    if (targets.length === 0 && fs.existsSync(vpsDbPath)) {
      console.log("Detectado banco de dados X360C via Volume Docker (VPS)");
      targets = [{
        id: 'vps-auto',
        name: 'X360C Produção (VPS)',
        url: 'file:' + vpsDbPath,
        isActive: true
      } as any];
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
