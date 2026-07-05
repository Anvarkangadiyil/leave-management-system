import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { nextUrl } = req
    const role = req.nextauth.token?.role

    const isOnEmployee = nextUrl.pathname.startsWith("/employee")
    const isOnAdmin = nextUrl.pathname.startsWith("/admin")
    const isOnManager = nextUrl.pathname.startsWith("/manager")
    const isOnLogin = nextUrl.pathname === "/login"
    const isOnHome = nextUrl.pathname === "/"

    if (isOnAdmin && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl))
    }

    if (isOnManager && role !== "MANAGER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl))
    }

    if ((isOnLogin || isOnHome) && role) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl))
      }
      if (role === "MANAGER") {
        return NextResponse.redirect(new URL("/manager/dashboard", nextUrl))
      }
      return NextResponse.redirect(new URL("/employee/dashboard", nextUrl))
    }

    if (isOnHome && !role) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized({ token, req }) {
        const pathname = req.nextUrl.pathname
        const isProtected =
          pathname.startsWith("/employee") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/manager")

        return isProtected ? !!token : true
      },
    },
  }
)

export const config = {
  // Apply middleware to all routes except public files and the auth API routes
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
