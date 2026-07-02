import Header from "@/components/Header"
import ApprovalQueue from "@/features/approvals/components/ApprovalQueue"
import { getPendingApprovals } from "@/features/approvals/actions"

export default async function AdminApprovalsPage() {
  const pendingRequests = await getPendingApprovals()

  return (
    <>
      <Header title="Company Approvals" />
      <main className="p-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Company-Wide Leave Requests
          </h1>
          <p className="text-sm text-ink-subtle">
            Review and decide leave requests submitted by all employees.
          </p>
        </div>

        <ApprovalQueue initialRequests={pendingRequests} />
      </main>
    </>
  )
}
