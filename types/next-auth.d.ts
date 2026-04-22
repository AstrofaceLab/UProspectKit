import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
      usageCount: number;
    } & DefaultSession["user"];
  }

  interface User {
    isPro: boolean;
    usageCount: number;
  }
}
