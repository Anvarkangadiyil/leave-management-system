"use client"

import { useState, useEffect } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, AlertCircle, CheckCircle, UserX } from "lucide-react"

interface AnalyticsData {
  typeBreakdown: { name: string; value: number }[]
  trends: { month: string; days: number }[]
  whosOut: {
    id: string
    name: string
    email: string
    leaveType: string
    startDate: Date
    endDate: Date
    days: number
  }[]
  stats: {
    totalEmployees: number
    pendingRequests: number
    approvedRequests: number
  }
}

const COLORS = ["#5e6ad2", "#8a8f98", "#23252a", "#34343a", "#62666d"]

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* General Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Employees */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-mono">
              Total Employees
            </span>
            <div className="text-2xl font-semibold text-ink font-mono">
              {data.stats.totalEmployees}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-ink-subtle/5 flex items-center justify-center border border-hairline text-ink-subtle">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-mono">
              Pending Requests
            </span>
            <div className="text-2xl font-semibold text-ink font-mono">
              {data.stats.pendingRequests}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-warning/5 flex items-center justify-center border border-warning/20 text-warning">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Approved Days */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-ink-subtle uppercase tracking-wider font-mono">
              Approved Requests
            </span>
            <div className="text-2xl font-semibold text-ink font-mono">
              {data.stats.approvedRequests}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-success/5 flex items-center justify-center border border-success/20 text-success">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leave Trends Over Time */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
            Approved Days Trend ({new Date().getFullYear()})
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trends}>
                  <XAxis
                    dataKey="month"
                    stroke="#8a8f98"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8a8f98"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141516",
                      borderColor: "#23252a",
                      color: "#f7f8f8",
                      fontSize: "12px",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="days"
                    fill="#5e6ad2"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-ink-tertiary">Loading charts...</div>
            )}
          </div>
        </div>

        {/* Leave Type Breakdown */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
            Breakdown By Leave Type (Days)
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              data.typeBreakdown.length === 0 ? (
                <div className="text-xs text-ink-tertiary">
                  No leave requests approved yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.typeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.typeBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#141516",
                        borderColor: "#23252a",
                        color: "#f7f8f8",
                        fontSize: "12px",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px", color: "#8a8f98" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="text-xs text-ink-tertiary">Loading charts...</div>
            )}
          </div>
        </div>
      </div>

      {/* Who's Out This Week */}
      <div className="rounded-lg border border-hairline bg-surface-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-hairline bg-surface-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
            Who's Out This Week
          </h3>
          <span className="text-[10px] text-ink-subtle font-mono">
            {data.whosOut.length} Out
          </span>
        </div>

        <div className="divide-y divide-hairline">
          {data.whosOut.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-subtle flex flex-col items-center gap-2">
              <UserX className="w-6 h-6 text-ink-tertiary" />
              <span>No employees scheduled for time off this week.</span>
            </div>
          ) : (
            data.whosOut.map((o) => (
              <div
                key={o.id}
                className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-surface-2/10 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-ink block">{o.name}</span>
                  <span className="text-ink-tertiary font-mono text-[10px]">
                    {o.email}
                  </span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-medium text-ink-muted block">
                    {o.leaveType}
                  </span>
                  <span className="text-[10px] text-ink-subtle font-mono">
                    {formatDate(o.startDate)} – {formatDate(o.endDate)} (
                    {o.days}d)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
