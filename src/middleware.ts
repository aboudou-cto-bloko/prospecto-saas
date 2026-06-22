import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-magic-link",
  "/landing",
  "/pricing",
  "/api/auth",
  "/api/webhook",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ??
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon).*)"],
};
