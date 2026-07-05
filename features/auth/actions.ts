"use server"

import { loginSchema, LoginInput } from "./schemas"

export async function loginAction(values: LoginInput) {
  // Plan: Keep this action as a server-side validation helper for callers that need it.
  // NextAuth v4 performs the actual credentials sign-in through its client helper.
  const validated = loginSchema.safeParse(values)
  if (!validated.success) {
    return { error: "Invalid fields" }
  }

  return { success: true }
}

export async function logoutAction() {
  return { success: true }
}
