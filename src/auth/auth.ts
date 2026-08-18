import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

/**
 * The Google provider must only be registered when real credentials are
 * present. NextAuth still performs OIDC discovery against Google for a
 * provider that's configured with empty/undefined id+secret, which surfaces
 * as `[auth][error] TypeError: fetch failed` in the server log followed by a
 * hard 500 on `/api/auth/error?error=Configuration` the moment anyone hits
 * "Continue with Google" — instead of the "Configuration" error page you'd
 * expect. Omitting the provider entirely when unset keeps email/password
 * auth fully working in environments (local dev, preview deploys) that
 * haven't set up Google OAuth yet.
 */
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Required behind reverse proxies / most PaaS hosts (Vercel, Render, Fly,
  // Railway, etc.) so NextAuth trusts the forwarded Host header instead of
  // rejecting the request or mis-deriving the callback URL.
  trustHost: true,
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
});

/** Whether Google OAuth is wired up — used to conditionally show the button. */
export const isGoogleAuthEnabled = googleConfigured;