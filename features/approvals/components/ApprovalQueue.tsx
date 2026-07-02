"use client"

import { useState } from "react"
import { decideLeaveRequest } from "../actions"
import { Check, X, Calendar, User, MessageSquare } from "lucide-react"

interface PendingRequest {
  id: string
  startDate: Date
  endDate: Date
  days: number
  reason: string
  createdAt: Date
  user: {
    name: string
    email: string
  }
  leaveType: {
    name: string
  }
}

interface ApprovalQueueProps {
  initialRequests: PendingRequest[]
}

export default function ApprovalQueue({ initialRequests }: ApprovalQueueProps) {
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDecision = async (
    requestId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setActionId(requestId)
    setError(null)

    try {
      const res = await decideLeaveRequest(requestId, status)
      if (res.error) {
        setError(res.error)
      } else {
        setRequests((prev) => prev.filter((r) => r.id !== requestId))
      }
    } catch (e) {
      setError("An unexpected error occurred.")
    } finally {
      setActionId(null)
    }
  }

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {error && (
        <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-xs animate-fade-in flex gap-2 items-center">
          <X className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-lg border border-hairline bg-surface-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-hairline bg-surface-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
            Pending Request Queue
          </h3>
          <span className="text-[10px] text-ink-subtle font-mono">
            {requests.length} Pending
          </span>
        </div>

        <div className="divide-y divide-hairline">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-subtle">
              No pending leave requests in the queue.
            </div>
          ) : (
            requests.map((req) => {
              const isLoading = actionId === req.id

              return (
                <div
                  key={req.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-2/10 transition-colors"
                >
                  {/* Requester & Date details */}
                  <div className="space-y-3 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-ink leading-none">
                          {req.user.name}
                        </h4>
                        <span className="text-[10px] text-ink-subtle font-mono">
                          {req.user.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-subtle">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-ink-tertiary" />
                        <span className="font-mono text-ink-muted">
                          {formatDate(req.startDate)} –{" "}
                          {formatDate(req.endDate)}
                        </span>
                      </div>
                      <div>
                        Type:{" "}
                        <span className="font-semibold text-ink-muted">
                          {req.leaveType.name}
                        </span>
                      </div>
                      <div>
                        Duration:{" "}
                        <span className="font-mono font-semibold text-ink-muted">
                          {req.days} days
                        </span>
                      </div>
                    </div>

                    {req.reason && (
                      <div className="flex gap-2 p-3 rounded bg-background/50 border border-hairline text-xs text-ink-muted leading-relaxed">
                        <MessageSquare className="w-4 h-4 text-ink-tertiary shrink-0 mt-0.5" />
                        <p className="italic">"{req.reason}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleDecision(req.id, "REJECTED")}
                      disabled={isLoading}
                      className="h-9 px-4 rounded-md bg-transparent border border-danger/30 hover:bg-danger/10 text-danger/90 hover:text-danger font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleDecision(req.id, "APPROVED")}
                      disabled={isLoading}
                      className="h-9 px-4 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-focus text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
