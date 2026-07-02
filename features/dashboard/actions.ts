"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required")
  }
}

export async function getAdminAnalytics() {
  await requireAdmin()

  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`)
  const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`)

  // 1. Fetch approved days grouped by leave type
  const leaveTypes = await db.leaveType.findMany({
    include: {
      requests: {
        where: {
          status: "APPROVED",
          startDate: { gte: startOfYear, lte: endOfYear },
        },
        select: {
          days: true,
        },
      },
    },
  })

  const typeBreakdown = leaveTypes
    .map((lt) => {
      const totalDays = lt.requests.reduce((sum, r) => sum + r.days, 0)
      return {
        name: lt.name,
        value: totalDays,
      }
    })
    .filter((item) => item.value > 0)

  // 2. Fetch monthly trend of approved days in the current year
  const approvedRequests = await db.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { gte: startOfYear, lte: endOfYear },
    },
    select: {
      startDate: true,
      days: true,
    },
  })

  // Initialize all months
  const monthlyData: Record<string, number> = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  }

  approvedRequests.forEach((req) => {
    const month = req.startDate.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    })
    if (monthlyData[month] !== undefined) {
      monthlyData[month] += req.days
    }
  })

  const trends = Object.entries(monthlyData).map(([month, days]) => ({
    month,
    days,
  }))

  // 3. Who is out this week (approved leave spanning today to next 7 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  const whosOut = await db.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { lte: nextWeek },
      endDate: { gte: today },
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      leaveType: {
        select: { name: true },
      },
    },
    orderBy: { startDate: "asc" },
  })

  // 4. General Stats
  const totalEmployees = await db.user.count({ where: { role: "EMPLOYEE" } })
  const pendingCount = await db.leaveRequest.count({
    where: { status: "PENDING" },
  })
  const approvedCount = await db.leaveRequest.count({
    where: {
      status: "APPROVED",
      startDate: { gte: startOfYear, lte: endOfYear },
    },
  })

  return {
    typeBreakdown,
    trends,
    whosOut: whosOut.map((w) => ({
      id: w.id,
      name: w.user.name,
      email: w.user.email,
      leaveType: w.leaveType.name,
      startDate: w.startDate,
      endDate: w.endDate,
      days: w.days,
    })),
    stats: {
      totalEmployees,
      pendingRequests: pendingCount,
      approvedRequests: approvedCount,
    },
  }
}
