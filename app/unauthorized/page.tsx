import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-6xl font-bold tracking-tight text-primary">403</h1>
        <h2 className="text-2xl font-semibold text-ink animate-fade-in">Access Denied</h2>
        <p className="text-sm text-ink-subtle leading-relaxed">
          You do not have the required permissions to view this page. Please make sure you are signed in with the correct account.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-surface-1 border border-hairline px-6 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
