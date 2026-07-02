"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { leaveTypeSchema, LeaveTypeInput } from "./schemas"
import { revalidatePath } from "next/cache"

// Re-check actor role server-side for security
async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin role required")
  }
  return session
}

export async function getLeaveTypes() {
  const session = await auth()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return await db.leaveType.findMany({
    orderBy: { name: "asc" },
  })
}

export async function createLeaveType(values: LeaveTypeInput) {
  await requireAdmin()

  const validated = leaveTypeSchema.safeParse(values)
  if (!validated.success) {
    return { error: "Invalid inputs" }
  }

  const { name, defaultDaysPerYear, active } = validated.data

  try {
    const existing = await db.leaveType.findUnique({ where: { name } })
    if (existing) {
      return { error: "A leave type with this name already exists" }
    }

    await db.$transaction(async (tx) => {
      // 1. Create the leave type
      const leaveType = await tx.leaveType.create({
        data: {
          name,
          defaultDaysPerYear,
          active,
        },
      })

      // 2. If active, allocate initial balances to all users
      if (active) {
        const users = await tx.user.findMany({ select: { id: true } })
        const currentYear = new Date().getUTCFullYear()

        const balances = users.map((user) => ({
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          allocated: defaultDaysPerYear,
          used: 0,
        }))

        if (balances.length > 0) {
          await tx.leaveBalance.createMany({
            data: balances,
          })
        }
      }
    })

    revalidatePath("/admin/leave-types")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create leave type" }
  }
}

export async function updateLeaveType(id: string, values: LeaveTypeInput) {
  await requireAdmin()

  const validated = leaveTypeSchema.safeParse(values)
  if (!validated.success) {
    return { error: "Invalid inputs" }
  }

  const { name, defaultDaysPerYear, active } = validated.data

  try {
    const existing = await db.leaveType.findFirst({
      where: { name, NOT: { id } },
    })
    if (existing) {
      return { error: "Another leave type with this name already exists" }
    }

    await db.$transaction(async (tx) => {
      // 1. Fetch original to check active status transitions
      const original = await tx.leaveType.findUnique({
        where: { id },
        select: { active: true },
      })

      // 2. Update the leave type (deactivate, never delete)
      await tx.leaveType.update({
        where: { id },
        data: {
          name,
          defaultDaysPerYear,
          active,
        },
      })

      // 3. If it was inactive and is now active, allocate balances for all users who don't have it
      if (original && !original.active && active) {
        const users = await tx.user.findMany({ select: { id: true } })
        const currentYear = new Date().getUTCFullYear()

        for (const user of users) {
          const existingBalance = await tx.leaveBalance.findUnique({
            where: {
              userId_leaveTypeId_year: {
                userId: user.id,
                leaveTypeId: id,
                year: currentYear,
              },
            },
          })

          if (!existingBalance) {
            await tx.leaveBalance.create({
              data: {
                userId: user.id,
                leaveTypeId: id,
                year: currentYear,
                allocated: defaultDaysPerYear,
                used: 0,
              },
            })
          }
        }
      }
    })

    revalidatePath("/admin/leave-types")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update leave type" }
  }
}
