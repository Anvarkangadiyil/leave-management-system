import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role

      const isOnEmployee = nextUrl.pathname.startsWith("/employee")
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isOnManager = nextUrl.pathname.startsWith("/manager")
      const isOnLogin = nextUrl.pathname === "/login"
      const isOnHome = nextUrl.pathname === "/"

      // Check admin routes
      if (isOnAdmin) {
        if (!isLoggedIn) return false
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/unauthorized", nextUrl))
        }
        return true
      }

      // Check manager routes
      if (isOnManager) {
        if (!isLoggedIn) return false
        if (role !== "MANAGER" && role !== "ADMIN") {
          return Response.redirect(new URL("/unauthorized", nextUrl))
        }
        return true
      }

      // Check employee routes
      if (isOnEmployee) {
        if (!isLoggedIn) return false
        return true
      }

      // Redirect authenticated users away from login / home
      if ((isOnLogin || isOnHome) && isLoggedIn) {
        if (role === "ADMIN") {
          return Response.redirect(new URL("/admin/dashboard", nextUrl))
        } else if (role === "MANAGER") {
          return Response.redirect(new URL("/manager/dashboard", nextUrl))
        } else {
          return Response.redirect(new URL("/employee/dashboard", nextUrl))
        }
      }

      // Default redirect for home if not logged in is /login
      if (isOnHome && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  providers: [], // Add providers in auth.ts (non-edge compatible)
} satisfies NextAuthConfig
