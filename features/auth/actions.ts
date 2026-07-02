"use server"

import { signIn, signOut } from "@/auth"
import { loginSchema, LoginInput } from "./schemas"
import { AuthError } from "next-auth"

export async function loginAction(values: LoginInput) {
  // Plan: Validate credentials server-side using Zod, then trigger next-auth credentials sign-in.
  const validated = loginSchema.safeParse(values)
  if (!validated.success) {
    return { error: "Invalid fields" }
  }

  const { email, password } = validated.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: true, // Let next-auth handle redirect based on authorized callback
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong. Please try again." }
      }
    }
    // Re-throw redirect errors so Next.js redirects work
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

