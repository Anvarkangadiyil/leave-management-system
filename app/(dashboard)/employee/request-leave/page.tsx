import Header from "@/components/Header"
import { auth } from "@/auth"
import RequestForm from "@/features/leave-requests/components/RequestForm"
import { getMyLeaveBalances } from "@/features/leave-balances/actions"

export default async function RequestLeavePage() {
  const session = await auth()
  const balances = await getMyLeaveBalances()

  return (
    <>
      <Header title="Request Leave" />
      <main className="p-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Request Time Off
          </h1>
          <p className="text-sm text-ink-subtle">
            Select a leave type, choose your dates, and submit your request for approval.
          </p>
        </div>

        <RequestForm balances={balances} />
      </main>
    </>
  )
}
