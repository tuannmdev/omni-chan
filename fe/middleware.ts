/**
 * Next.js Middleware
 * Protected routes and authentication checks
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const accessToken = request.cookies.get("accessToken");
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const isPublicRoute = pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  // Dashboard routes that require authentication
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Redirect to login if accessing dashboard without token
  if (isDashboardRoute && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth pages with valid token
  if (isPublicRoute && accessToken && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
