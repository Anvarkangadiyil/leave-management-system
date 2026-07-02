import { z } from "zod"

export const leaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Please select a leave type"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date cannot be before start date",
    path: ["endDate"],
  })

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>
