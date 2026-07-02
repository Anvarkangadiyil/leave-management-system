import Header from "@/components/Header"
import { auth } from "@/auth"
import BalanceCards from "@/features/leave-balances/components/BalanceCards"
import RequestForm from "@/features/leave-requests/components/RequestForm"
import RequestHistory from "@/features/leave-requests/components/RequestHistory"
import { getMyLeaveBalances } from "@/features/leave-balances/actions"
import { getMyLeaveRequests } from "@/features/leave-requests/actions"

export default async function EmployeeDashboard() {
  const session = await auth()

  // Fetch data in parallel for optimal RSC loading performance
  const [balances, requests] = await Promise.all([
    getMyLeaveBalances(),
    getMyLeaveRequests(),
  ])

  return (
    <>
      <Header title="Employee Dashboard" />
      <main className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-sm text-ink-subtle">
            Manage your leave requests and view your current balances.
          </p>
        </div>

        {/* Balance Cards (Top, Full Width) */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
            My Balances ({new Date().getFullYear()})
          </h2>
          <BalanceCards />
        </section>

        {/* Two Column Layout for Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request History (Left 2 Columns) */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
              Request History
            </h2>
            <RequestHistory requests={requests} />
          </section>

          {/* New Request Form (Right 1 Column) */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
              Request Leave
            </h2>
            <RequestForm balances={balances} />
          </section>
        </div>
      </main>
    </>
  )
}
