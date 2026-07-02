"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function getMyLeaveBalances() {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id
  const currentYear = new Date().getUTCFullYear()

  // Fetch active leave types to compare
  const activeTypes = await db.leaveType.findMany({
    where: { active: true },
  })

  // Fetch current user balances for the current year
  const existingBalances = await db.leaveBalance.findMany({
    where: {
      userId,
      year: currentYear,
    },
    include: {
      leaveType: true,
    },
  })

  const existingTypeIds = new Set(existingBalances.map((b) => b.leaveTypeId))
  const missingTypes = activeTypes.filter((t) => !existingTypeIds.has(t.id))

  // Auto-heal missing balances if any exist
  if (missingTypes.length > 0) {
    await db.$transaction(
      missingTypes.map((type) =>
        db.leaveBalance.create({
          data: {
            userId,
            leaveTypeId: type.id,
            year: currentYear,
            allocated: type.defaultDaysPerYear,
            used: 0,
          },
        })
      )
    )

    // Re-fetch balances
    return await db.leaveBalance.findMany({
      where: {
        userId,
        year: currentYear,
      },
      include: {
        leaveType: true,
      },
      orderBy: {
        leaveType: {
          name: "asc",
        },
      },
    })
  }

  return existingBalances.sort((a, b) =>
    a.leaveType.name.localeCompare(b.leaveType.name)
  )
}
