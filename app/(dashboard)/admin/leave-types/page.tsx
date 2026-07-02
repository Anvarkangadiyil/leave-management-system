import Header from "@/components/Header"
import LeaveTypeManager from "@/features/leave-types/components/LeaveTypeManager"
import { getLeaveTypes } from "@/features/leave-types/actions"

export default async function AdminLeaveTypesPage() {
  const initialLeaveTypes = await getLeaveTypes()

  return (
    <>
      <Header title="Manage Leave Types" />
      <main className="p-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Leave Types Configuration
          </h1>
          <p className="text-sm text-ink-subtle">
            Configure system-wide leave types and their default yearly allocations.
            Deactivating a type prevents new requests but preserves historical data.
          </p>
        </div>

        <LeaveTypeManager initialLeaveTypes={initialLeaveTypes} />
      </main>
    </>
  )
}
