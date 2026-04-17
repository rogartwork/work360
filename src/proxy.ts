import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "./lib/session";
import { cookies } from "next/headers";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<{ isLoggedIn: boolean }>(await cookies(), sessionOptions);

  const { pathname } = req.nextUrl;

  // Permitir acesso à página de login e assets públicos
  if (
    pathname.startsWith("/login") ||
    pathname.includes("_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return res;
  }

  // Se não estiver logado e tentar acessar qualquer outra página, redireciona para login
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
