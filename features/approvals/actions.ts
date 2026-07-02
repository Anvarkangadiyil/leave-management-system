"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { sendLeaveDecisionEmail } from "@/services/resend"
import { revalidatePath } from "next/cache"

async function requireApprover() {
  const session = await auth()
  if (
    !session ||
    !session.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
  ) {
    throw new Error("Unauthorized: Manager or Admin role required")
  }
  return session
}

export async function getPendingApprovals() {
  const session = await requireApprover()
  const role = session.user.role
  const userId = session.user.id

  if (role === "ADMIN") {
    // Admins see all pending requests
    return await db.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: { name: true, email: true },
        },
        leaveType: true,
      },
      orderBy: { createdAt: "asc" }, // oldest-first
    })
  } else {
    // Managers see direct reports' pending requests
    return await db.leaveRequest.findMany({
      where: {
        status: "PENDING",
        user: {
          managerId: userId,
        },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        leaveType: true,
      },
      orderBy: { createdAt: "asc" }, // oldest-first
    })
  }
}

export async function decideLeaveRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED"
) {
  // Plan:
  // 1. Authenticate session and check user permissions (re-check manager relation/admin role).
  // 2. Start transaction: fetch leave request and locks/reads balances.
  // 3. If approved, verify sufficient balance, increment used balance, write request status/details, and post notification + audit log.
  // 4. If rejected, write request status/details, and post notification + audit log.
  // 5. Fire off Resend email decision asynchronously without blocking the transaction success.
  const session = await requireApprover()
  const approverId = session.user.id

  try {
    const { request, userEmail, userName } = await db.$transaction(
      async (tx) => {
        // 1. Fetch leave request
        const req = await tx.leaveRequest.findUnique({
          where: { id: requestId },
          include: {
            user: true,
            leaveType: true,
          },
        })

        if (!req) {
          throw new Error("Leave request not found.")
        }

        if (req.status !== "PENDING") {
          throw new Error("Request has already been processed.")
        }

        // Authorization Check: Manager must have req.user as direct report
        if (
          session.user.role === "MANAGER" &&
          req.user.managerId !== approverId
        ) {
          throw new Error(
            "Unauthorized: You can only decide requests for your direct reports."
          )
        }

        // 2. Perform updates based on decision
        if (status === "APPROVED") {
          // Fetch balance for the year
          const currentYear = req.startDate.getUTCFullYear()
          const balance = await tx.leaveBalance.findUnique({
            where: {
              userId_leaveTypeId_year: {
                userId: req.userId,
                leaveTypeId: req.leaveTypeId,
                year: currentYear,
              },
            },
          })

          if (!balance) {
            throw new Error(
              "User does not have an active leave balance for this type."
            )
          }

          const remaining = balance.allocated - balance.used
          if (req.days > remaining) {
            throw new Error(
              `Insufficient balance. User has ${remaining} days available, but requested ${req.days} days.`
            )
          }

          // Deduct balance (increment used)
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              used: { increment: req.days },
            },
          })
        }

        // Update Request status
        const updatedRequest = await tx.leaveRequest.update({
          where: { id: requestId },
          data: {
            status,
            approverId,
            decidedAt: new Date(),
          },
        })

        // Create Notification for the user
        await tx.notification.create({
          data: {
            userId: req.userId,
            message: `Your request for ${req.days} days of ${
              req.leaveType.name
            } starting ${
              req.startDate.toISOString().split("T")[0]
            } has been ${status.toLowerCase()}.`,
          },
        })

        // Create Audit Log
        await tx.auditLog.create({
          data: {
            userId: approverId,
            action: `DECIDE_LEAVE_REQUEST`,
            details: `${status} request ${requestId} for ${req.user.name} (${req.days} days)`,
          },
        })

        return {
          request: updatedRequest,
          userEmail: req.user.email,
          userName: req.user.name,
        }
      }
    )

    // 5. Send email asynchronously. Errors will be caught inside and won't roll back the transaction.
    await sendLeaveDecisionEmail(
      userEmail,
      userName,
      status,
      request.days,
      request.startDate
    )

    // Revalidate paths
    revalidatePath("/admin/approvals")
    revalidatePath("/manager/approvals")
    revalidatePath("/employee/dashboard")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to process leave request" }
  }
}
