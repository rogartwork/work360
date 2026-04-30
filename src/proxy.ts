import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir acesso à página de login e assets públicos
  if (
    pathname.startsWith("/login") ||
    pathname.includes("_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/license")
  ) {
    return NextResponse.next();
  }

  // Verificar se o cookie de sessão existe
  const sessionCookie = req.cookies.get("nexus_hub_session");

  // Se não estiver logado, redireciona para login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
