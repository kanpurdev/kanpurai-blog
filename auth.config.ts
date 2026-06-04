import type { NextAuthConfig } from "next-auth";
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLogged = !!auth?.user;
      const isDash = nextUrl.pathname.startsWith("/dashboard");
      if (isDash && !isLogged) return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.id; }
      return session;
    },
  },
} satisfies NextAuthConfig;
