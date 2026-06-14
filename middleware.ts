import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth: nextAuthMiddleware } = NextAuth(authConfig);

export const middleware = nextAuthMiddleware((req) => {
  const isLoggedIn = !!req.auth;
  const isDash = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnboarding = req.nextUrl.pathname.startsWith("/onboarding");
  
  if (isLoggedIn) {
    const user = req.auth?.user as any;
    const needsOnboarding = !user.username || !user.guidelinesAcceptedAt;
    
    if (needsOnboarding && !isOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
    }
    
    if (!needsOnboarding && isOnboarding) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  if (isDash && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = { matcher: ["/dashboard/:path*", "/onboarding"] };
