import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        // Fetch custom fields from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isPro: true, usageCount: true },
        });
        if (dbUser) {
          session.user.isPro = dbUser.isPro;
          session.user.usageCount = dbUser.usageCount;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirect to home if not signed in (we'll show a prompt)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
