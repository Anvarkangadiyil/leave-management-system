import Header from "@/components/Header"
import { auth } from "@/auth"

export default async function ManagerDashboard() {
  const session = await auth()

  return (
    <>
      <Header title="Manager Dashboard" />
      <main className="p-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Manager Portal
          </h1>
          <p className="text-sm text-ink-subtle">
            Hello, {session?.user?.name}. Oversee your direct reports and approve pending leave requests.
          </p>
        </div>

        <div className="border border-hairline border-dashed rounded-lg p-12 text-center bg-surface-1">
          <p className="text-sm text-ink-tertiary">
            Direct reports' request queue and approval options will be implemented in Phase 3.
          </p>
        </div>
      </main>
    </>
  )
}
