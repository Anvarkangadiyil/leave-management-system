import { getMyLeaveBalances } from "../actions"

export default async function BalanceCards() {
  const balances = await getMyLeaveBalances()

  if (balances.length === 0) {
    return (
      <div className="border border-hairline border-dashed rounded-lg p-8 text-center bg-surface-1">
        <p className="text-sm text-ink-subtle">No leave balances allocated for this year.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {balances.map((balance) => {
        const remaining = balance.allocated - balance.used

        return (
          <div
            key={balance.id}
            className="rounded-lg border border-hairline bg-surface-1 p-6 flex flex-col justify-between hover:border-hairline-strong transition-colors"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-semibold font-mono">
                {balance.leaveType.name}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-semibold tracking-tight text-ink">
                  {remaining}
                </span>
                <span className="text-xs text-ink-subtle">days remaining</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-hairline flex justify-between text-xs text-ink-muted">
              <div>
                <span className="text-ink-subtle">Allocated:</span>{" "}
                <span className="font-medium text-ink">{balance.allocated}d</span>
              </div>
              <div>
                <span className="text-ink-subtle">Used:</span>{" "}
                <span className="font-medium text-ink">{balance.used}d</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
