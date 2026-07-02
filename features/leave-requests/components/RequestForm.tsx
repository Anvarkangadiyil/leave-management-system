"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leaveRequestSchema, LeaveRequestInput } from "../schemas"
import { submitLeaveRequest } from "../actions"
import { AlertCircle, Calendar } from "lucide-react"
import { calculateBusinessDays } from "@/lib/utils"

interface LeaveBalance {
  id: string
  allocated: number
  used: number
  leaveType: {
    id: string
    name: string
  }
}

interface RequestFormProps {
  balances: LeaveBalance[]
  onSuccess?: () => void
}

export default function RequestForm({ balances, onSuccess }: RequestFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duration, setDuration] = useState<number>(0)
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(
    null
  )

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeaveRequestInput>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: "" as any,
      endDate: "" as any,
      reason: "",
    },
  })

  const watchLeaveTypeId = watch("leaveTypeId")
  const watchStartDate = watch("startDate")
  const watchEndDate = watch("endDate")

  // Update balance information when leave type changes
  useEffect(() => {
    if (watchLeaveTypeId) {
      const balance = balances.find((b) => b.leaveType.id === watchLeaveTypeId)
      setSelectedBalance(balance || null)
    } else {
      setSelectedBalance(null)
    }
  }, [watchLeaveTypeId, balances])

  // Calculate live business days
  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      const start = new Date(watchStartDate)
      const end = new Date(watchEndDate)
      if (end >= start) {
        setDuration(calculateBusinessDays(start, end))
      } else {
        setDuration(0)
      }
    } else {
      setDuration(0)
    }
  }, [watchStartDate, watchEndDate])

  const onSubmit = async (data: LeaveRequestInput) => {
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      const res = await submitLeaveRequest(data)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        reset()
        if (onSuccess) onSuccess()
      }
    } catch (e) {
      setError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingDays = selectedBalance
    ? selectedBalance.allocated - selectedBalance.used
    : 0
  const isBalanceExceeded = duration > remainingDays

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-ink">Request Time Off</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-xs flex gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 rounded bg-success/10 border border-success/20 text-success text-xs animate-fade-in">
            Request submitted successfully.
          </div>
        )}

        {/* Leave Type Select */}
        <div className="space-y-1">
          <label
            htmlFor="leaveTypeId"
            className="block text-xs font-medium text-ink-muted"
          >
            Leave Type
          </label>
          <select
            {...register("leaveTypeId")}
            id="leaveTypeId"
            disabled={isSubmitting}
            className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-xs text-ink placeholder:text-ink-tertiary disabled:opacity-50"
          >
            <option value="">Select a leave type</option>
            {balances.map((b) => (
              <option key={b.id} value={b.leaveType.id}>
                {b.leaveType.name}
              </option>
            ))}
          </select>
          {errors.leaveTypeId && (
            <p className="text-[11px] text-danger mt-0.5">
              {errors.leaveTypeId.message}
            </p>
          )}
        </div>

        {/* Start / End Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label
              htmlFor="startDate"
              className="block text-xs font-medium text-ink-muted"
            >
              Start Date
            </label>
            <input
              {...register("startDate")}
              id="startDate"
              type="date"
              disabled={isSubmitting}
              className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-xs text-ink disabled:opacity-50"
            />
            {errors.startDate && (
              <p className="text-[11px] text-danger mt-0.5">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="endDate"
              className="block text-xs font-medium text-ink-muted"
            >
              End Date
            </label>
            <input
              {...register("endDate")}
              id="endDate"
              type="date"
              disabled={isSubmitting}
              className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-xs text-ink disabled:opacity-50"
            />
            {errors.endDate && (
              <p className="text-[11px] text-danger mt-0.5">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-1">
          <label
            htmlFor="reason"
            className="block text-xs font-medium text-ink-muted"
          >
            Reason
          </label>
          <textarea
            {...register("reason")}
            id="reason"
            rows={3}
            placeholder="Describe the reason for your time off..."
            disabled={isSubmitting}
            className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-xs text-ink placeholder:text-ink-tertiary disabled:opacity-50 resize-none animate-fade-in"
          />
          {errors.reason && (
            <p className="text-[11px] text-danger mt-0.5">
              {errors.reason.message}
            </p>
          )}
        </div>

        {/* Balance & Live Calculation Box */}
        {selectedBalance && (
          <div className="bg-background border border-hairline rounded-md p-4 space-y-2 text-xs animate-fade-in">
            <div className="flex justify-between">
              <span className="text-ink-subtle">Available Balance:</span>
              <span className="font-mono font-medium text-ink">
                {remainingDays} days
              </span>
            </div>
            {duration > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-ink-subtle">Requested Duration:</span>
                  <span className="font-mono font-medium text-ink">
                    {duration} business days
                  </span>
                </div>
                <div className="pt-2 border-t border-hairline flex justify-between font-semibold">
                  <span className="text-ink-muted">Projected Remaining:</span>
                  <span
                    className={`font-mono ${
                      isBalanceExceeded ? "text-danger" : "text-success"
                    }`}
                  >
                    {remainingDays - duration} days
                  </span>
                </div>
              </>
            )}
            {isBalanceExceeded && (
              <div className="mt-2 text-danger text-[11px] font-medium flex gap-1.5 items-start">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Requested days exceed your current available balance for this
                  leave type.
                </span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isBalanceExceeded || duration === 0}
          className="w-full h-9 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-focus text-white font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  )
}
