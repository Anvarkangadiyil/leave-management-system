import { z } from "zod"

export const leaveTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  defaultDaysPerYear: z
    .number()
    .min(1, "Must be at least 1 day")
    .max(365, "Must be less than 365 days"),
  active: z.boolean(),
})

export type LeaveTypeInput = z.infer<typeof leaveTypeSchema>
