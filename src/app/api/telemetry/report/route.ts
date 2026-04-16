import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      hostname,
      serverName,
      licenseName,
      licenseId,
      licenseExpiry,
      chipsTotal,
      chipsOnline,
      tasksActive,
      taskMode,
      cpuUsage,
      ramUsage,
      hubKey,
      ip
    } = data;

    if (!hubKey || hubKey !== process.env.HUB_KEY) {
      return NextResponse.json({ error: "Chave de acesso inválida" }, { status: 401 });
    }

    if (!hostname) {
      return NextResponse.json({ error: "Hostname é obrigatório" }, { status: 400 });
    }

    const server = await prisma.server.upsert({
      where: { hostname },
      update: {
        serverName: serverName || undefined,
        licenseName: licenseName || undefined,
        licenseId: licenseId || undefined,
        licenseExpiry: licenseExpiry || undefined,
        chipsTotal: chipsTotal ?? 0,
        chipsOnline: chipsOnline ?? 0,
        tasksActive: tasksActive ?? false,
        taskMode: taskMode || null,
        cpuUsage,
        ramUsage,
        ip,
        lastSeen: new Date(),
        status: "ONLINE"
      },
      create: {
        hostname,
        serverName,
        licenseName,
        licenseId,
        licenseExpiry,
        chipsTotal: chipsTotal ?? 0,
        chipsOnline: chipsOnline ?? 0,
        tasksActive: tasksActive ?? false,
        taskMode: taskMode || null,
        cpuUsage,
        ramUsage,
        ip,
        hubKey,
        status: "ONLINE"
      }
    });

    return NextResponse.json({ success: true, serverId: server.id });
  } catch (error: any) {
    console.error("ERRO TELEMETRIA:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
