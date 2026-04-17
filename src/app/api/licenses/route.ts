import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";

export async function GET() {
  try {
    let targets = await prisma.targetDatabase.findMany({ where: { isActive: true } });
    const allLicenses = [];

    // Auto-deteção para VPS: Procura o banco prod.db no volume mapeado da stack gs360
    const vpsDbPath = "/x360-data/prod.db";
    
    if (targets.length === 0 && fs.existsSync(vpsDbPath)) {
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
          const dbPath = target.url.replace("file:///", "/").replace("file:", "");
          
          if (!fs.existsSync(dbPath)) continue;

          const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
          });

          // Buscar usuários (licenças)
          const users = await db.all(`SELECT id, name, role, maxSessions, expiresAt, isActive, plan FROM User`);
          
          // Buscar sessões para calcular chips
          const sessions = await db.all(`SELECT id, userId, status FROM WhatsAppSession`);

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
               serverIp: target.name === "X360C Produção (VPS)" ? "VPS" : "127.0.0.1"
             });
          }

          await db.close();
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
