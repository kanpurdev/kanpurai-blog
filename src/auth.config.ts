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
    async jwt({ token, user, trigger, session }) {
      if (user) { 
        token.role = (user as any).role; 
        token.id = user.id; 
        token.username = (user as any).username;
        token.guidelinesAcceptedAt = (user as any).guidelinesAcceptedAt;
      }
      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.guidelinesAcceptedAt) token.guidelinesAcceptedAt = session.guidelinesAcceptedAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { 
        (session.user as any).role = token.role; 
        (session.user as any).id = token.id; 
        (session.user as any).username = token.username;
        (session.user as any).guidelinesAcceptedAt = token.guidelinesAcceptedAt;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
