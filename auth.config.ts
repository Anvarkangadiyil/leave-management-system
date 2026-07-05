import type { NextAuthOptions } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
} satisfies Pick<NextAuthOptions, "pages" | "providers">
