"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginInput } from "../schemas"
import { signIn } from "next-auth/react"

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/",
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsSubmitting(false)
        return
      }

      router.push(result?.url ?? "/")
      router.refresh()
    } catch (e) {
      setError("An unexpected error occurred.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[400px] rounded-lg border border-hairline bg-surface-1 p-8 shadow-2xl">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="text-sm text-ink-subtle">
          Access your leave management portal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs font-medium text-ink-muted">
            Email address
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={isSubmitting}
            className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-sm text-ink placeholder:text-ink-tertiary transition-colors disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.email && (
            <p className="text-xs text-danger mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-medium text-ink-muted">
              Password
            </label>
          </div>
          <input
            {...register("password")}
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isSubmitting}
            className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-sm text-ink placeholder:text-ink-tertiary transition-colors disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.password && (
            <p className="text-xs text-danger mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 flex items-center justify-center rounded-md bg-primary hover:bg-primary-hover active:bg-primary-focus text-white font-medium text-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 border-t border-hairline pt-4 text-xs text-ink-tertiary">
        <p className="font-medium text-ink-subtle mb-1">Demo Credentials (pw: password123):</p>
        <ul className="space-y-1 text-[11px]">
          <li>
            <span className="text-ink-muted font-mono">admin@company.com</span> - Admin
          </li>
          <li>
            <span className="text-ink-muted font-mono">manager@company.com</span> - Manager
          </li>
          <li>
            <span className="text-ink-muted font-mono">employee@company.com</span> - Employee
          </li>
        </ul>
      </div>
    </div>
  )
}
