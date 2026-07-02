"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { leaveRequestSchema, LeaveRequestInput } from "./schemas"
import { revalidatePath } from "next/cache"
import { calculateBusinessDays } from "@/lib/utils"

export async function getMyLeaveRequests() {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  return await db.leaveRequest.findMany({
    where: { userId: session.user.id },
    include: {
      leaveType: true,
      approver: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function submitLeaveRequest(values: LeaveRequestInput) {
  // Plan:
  // 1. Authenticate user and validate request date ranges/fields.
  // 2. Run transaction: check for overlap, verify sufficient balance (considering other pending requests).
  // 3. Write PENDING leave request and append an audit log entry atomically.
  const session = await auth()
  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  const validated = leaveRequestSchema.safeParse(values)
  if (!validated.success) {
    return { error: "Invalid inputs" }
  }

  const { leaveTypeId, startDate, endDate, reason } = validated.data
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = calculateBusinessDays(start, end)

  if (days <= 0) {
    return { error: "Leave request must span at least 1 business day" }
  }

  const currentYear = start.getFullYear()

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Check for overlapping requests (PENDING or APPROVED)
      const overlapping = await tx.leaveRequest.findFirst({
        where: {
          userId,
          status: { in: ["PENDING", "APPROVED"] },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start },
            },
          ],
        },
      })

      if (overlapping) {
        throw new Error(
          "You already have an overlapping leave request during these dates."
        )
      }

      // 2. Fetch balance for the year
      const balance = await tx.leaveBalance.findUnique({
        where: {
          userId_leaveTypeId_year: {
            userId,
            leaveTypeId,
            year: currentYear,
          },
        },
      })

      if (!balance) {
        throw new Error(
          "No leave balance allocated for this type in the requested year."
        )
      }

      // 3. Fetch current pending requests to calculate available buffer
      const pendingRequests = await tx.leaveRequest.findMany({
        where: {
          userId,
          leaveTypeId,
          status: "PENDING",
          startDate: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31`),
          },
        },
      })

      const pendingDays = pendingRequests.reduce((sum, req) => sum + req.days, 0)
      const availableDays = balance.allocated - balance.used - pendingDays

      if (days > availableDays) {
        throw new Error(
          `Insufficient balance. You requested ${days} days, but only have ${availableDays} days available (including ${pendingDays} pending days).`
        )
      }

      // 4. Create leave request
      const request = await tx.leaveRequest.create({
        data: {
          userId,
          leaveTypeId,
          startDate: start,
          endDate: end,
          days,
          reason,
          status: "PENDING",
        },
      })

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: "SUBMIT_LEAVE_REQUEST",
          details: `Submitted ${days}-day ${
            balance.leaveTypeId
          } request starting ${startDate}`,
        },
      })

      return request
    })

    revalidatePath("/employee/dashboard")
    return { success: true, data: result }
  } catch (error: any) {
    return { error: error.message || "Failed to submit leave request" }
  }
}
