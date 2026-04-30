import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({
      isLoggedIn: session.isLoggedIn,
      role: session.role || 'USER',
      username: session.username
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao buscar sessão" }, { status: 500 });
  }
}
