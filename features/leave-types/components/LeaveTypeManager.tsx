"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leaveTypeSchema, LeaveTypeInput } from "../schemas"
import { createLeaveType, updateLeaveType } from "../actions"
import { Edit2 } from "lucide-react"

interface LeaveType {
  id: string
  name: string
  defaultDaysPerYear: number
  active: boolean
}

interface LeaveTypeManagerProps {
  initialLeaveTypes: LeaveType[]
}

export default function LeaveTypeManager({ initialLeaveTypes }: LeaveTypeManagerProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(initialLeaveTypes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveTypeInput>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: "",
      defaultDaysPerYear: 10,
      active: true,
    },
  })

  const onSubmit = async (data: LeaveTypeInput) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (editingId) {
        const res = await updateLeaveType(editingId, data)
        if (res.error) {
          setError(res.error)
        } else {
          setSuccess("Leave type updated successfully.")
          setLeaveTypes((prev) =>
            prev.map((t) => (t.id === editingId ? { ...t, ...data } : t))
          )
          setEditingId(null)
          reset()
        }
      } else {
        const res = await createLeaveType(data)
        if (res.error) {
          setError(res.error)
        } else {
          setSuccess("Leave type created successfully.")
          window.location.reload()
        }
      }
    } catch (e) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (lt: LeaveType) => {
    setEditingId(lt.id)
    setValue("name", lt.name)
    setValue("defaultDaysPerYear", lt.defaultDaysPerYear)
    setValue("active", lt.active)
    setError(null)
    setSuccess(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    reset()
  }

  const handleToggleActive = async (lt: LeaveType) => {
    setError(null)
    setSuccess(null)
    const newActiveState = !lt.active

    try {
      const res = await updateLeaveType(lt.id, {
        name: lt.name,
        defaultDaysPerYear: lt.defaultDaysPerYear,
        active: newActiveState,
      })
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(
          `Leave type ${
            newActiveState ? "activated" : "deactivated"
          } successfully.`
        )
        setLeaveTypes((prev) =>
          prev.map((t) =>
            t.id === lt.id ? { ...t, active: newActiveState } : t
          )
        )
      }
    } catch (e) {
      setError("Failed to update status.")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List Column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-lg border border-hairline bg-surface-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-hairline bg-surface-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink font-mono">
              Leave Types
            </h3>
            <span className="text-[10px] text-ink-subtle font-mono">
              {leaveTypes.length} Total
            </span>
          </div>

          <div className="divide-y divide-hairline">
            {leaveTypes.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-subtle">
                No leave types defined. Create one on the right.
              </div>
            ) : (
              leaveTypes.map((lt) => (
                <div
                  key={lt.id}
                  className="p-4 flex items-center justify-between hover:bg-surface-2/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {lt.name}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          lt.active
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-ink-tertiary/10 text-ink-subtle border border-hairline-strong"
                        }`}
                      >
                        {lt.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-subtle">
                      Default Allocation:{" "}
                      <span className="font-mono text-ink-muted">
                        {lt.defaultDaysPerYear} days
                      </span>{" "}
                      per year
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(lt)}
                      className="p-1.5 rounded hover:bg-surface-2 text-ink-subtle hover:text-ink transition-colors cursor-pointer"
                      title="Edit leave type"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(lt)}
                      className={`text-[11px] font-medium px-3 py-1 rounded border transition-colors cursor-pointer ${
                        lt.active
                          ? "bg-transparent text-danger/80 border-danger/20 hover:bg-danger/10 hover:text-danger"
                          : "bg-primary text-white border-transparent hover:bg-primary-hover"
                      }`}
                    >
                      {lt.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="space-y-4">
        <div className="rounded-lg border border-hairline bg-surface-1 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-ink">
            {editingId ? "Edit Leave Type" : "Create Leave Type"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-danger/10 border border-danger/20 text-danger text-xs animate-fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded bg-success/10 border border-success/20 text-success text-xs animate-fade-in">
                {success}
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-ink-muted"
              >
                Leave Type Name
              </label>
              <input
                {...register("name")}
                id="name"
                type="text"
                placeholder="e.g. Maternity Leave"
                disabled={isSubmitting}
                className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-xs text-ink placeholder:text-ink-tertiary disabled:opacity-50"
              />
              {errors.name && (
                <p className="text-[11px] text-danger mt-0.5">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="defaultDays"
                className="block text-xs font-medium text-ink-muted"
              >
                Default Days Per Year
              </label>
              <input
                {...register("defaultDaysPerYear", { valueAsNumber: true })}
                id="defaultDays"
                type="number"
                disabled={isSubmitting}
                className="w-full bg-background border border-hairline rounded-md py-2 px-3 text-xs text-ink disabled:opacity-50"
              />
              {errors.defaultDaysPerYear && (
                <p className="text-[11px] text-danger mt-0.5">
                  {errors.defaultDaysPerYear.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register("active")}
                id="active"
                type="checkbox"
                disabled={isSubmitting}
                className="w-3.5 h-3.5 bg-background border border-hairline rounded accent-primary disabled:opacity-50"
              />
              <label
                htmlFor="active"
                className="text-xs font-medium text-ink-muted"
              >
                Active & open for requests
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-9 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-focus text-white font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingId
                  ? "Update Type"
                  : "Create Type"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="px-3 h-9 rounded-md bg-surface-2 border border-hairline hover:bg-surface-3 text-ink-muted hover:text-ink font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
