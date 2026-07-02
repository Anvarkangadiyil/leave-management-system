"use client"

import { useState } from "react"
import { Calendar, ChevronDown, ChevronUp } from "lucide-react"

interface LeaveRequest {
  id: string
  startDate: Date
  endDate: Date
  days: number
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
  leaveType: {
    name: string
  }
  approver?: {
    name: string
  } | null
}

interface RequestHistoryProps {
  requests: LeaveRequest[]
}

export default function RequestHistory({ requests }: RequestHistoryProps) {
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredRequests = requests.filter(
    (r) => filter === "ALL" || r.status === filter
  )

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "PENDING":
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
            Pending
          </span>
        )
      case "APPROVED":
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
            Approved
          </span>
        )
      case "REJECTED":
        return (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
            Rejected
          </span>
        )
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filtering Tab Bar */}
      <div className="flex gap-1.5 p-1 bg-surface-1 border border-hairline rounded-lg w-fit">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filter === s
                ? "bg-surface-2 text-ink"
                : "text-ink-subtle hover:text-ink"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* History List Panel */}
      <div className="rounded-lg border border-hairline bg-surface-1 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-subtle">
            No leave requests found matching this status.
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {filteredRequests.map((req) => {
              const isExpanded = expandedId === req.id

              return (
                <div
                  key={req.id}
                  className="hover:bg-surface-2/20 transition-colors"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-surface-2 flex items-center justify-center text-ink-subtle border border-hairline">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {req.leaveType.name}
                          </span>
                          <span className="text-xs text-ink-tertiary">
                            • {req.days} {req.days === 1 ? "day" : "days"}
                          </span>
                        </div>
                        <p className="text-xs text-ink-subtle font-mono">
                          {formatDate(req.startDate)} – {formatDate(req.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                      {getStatusBadge(req.status)}
                      <div className="text-ink-tertiary">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detail Panel (Accordion) */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-2 border-t border-hairline/50 bg-background/30 text-xs space-y-3">
                      <div>
                        <span className="font-semibold text-ink-muted block mb-1">
                          Reason:
                        </span>
                        <p className="text-ink-subtle leading-relaxed whitespace-pre-wrap">
                          {req.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[11px] text-ink-subtle pt-2 border-t border-hairline/20 font-mono">
                        <div>
                          <span className="text-ink-tertiary">
                            Submitted on:
                          </span>{" "}
                          <span>{formatDate(req.createdAt)}</span>
                        </div>
                        {req.approver && (
                          <div>
                            <span className="text-ink-tertiary font-sans">
                              Decided by:
                            </span>{" "}
                            <span className="font-sans font-medium text-ink-muted">
                              {req.approver.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
