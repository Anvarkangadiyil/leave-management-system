const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("Cleaning database...")
  await prisma.auditLog.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.leaveRequest.deleteMany({})
  await prisma.leaveBalance.deleteMany({})
  await prisma.leaveType.deleteMany({})
  await prisma.user.deleteMany({})

  console.log("Creating default leave types...")
  const annualLeave = await prisma.leaveType.create({
    data: {
      name: "Annual Leave",
      defaultDaysPerYear: 25,
    },
  })

  const sickLeave = await prisma.leaveType.create({
    data: {
      name: "Sick Leave",
      defaultDaysPerYear: 10,
    },
  })

  const studyLeave = await prisma.leaveType.create({
    data: {
      name: "Study Leave",
      defaultDaysPerYear: 5,
    },
  })

  console.log("Hashing default passwords...")
  const passwordHash = await bcrypt.hash("password123", 10)

  console.log("Creating users...")
  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@company.com",
      passwordHash,
      name: "Alice Admin",
      role: "ADMIN",
    },
  })

  // 2. Manager
  const manager = await prisma.user.create({
    data: {
      email: "manager@company.com",
      passwordHash,
      name: "Bob Manager",
      role: "MANAGER",
    },
  })

  // 3. Employee (reporting to Bob Manager)
  const employee = await prisma.user.create({
    data: {
      email: "employee@company.com",
      passwordHash,
      name: "Charlie Employee",
      role: "EMPLOYEE",
      managerId: manager.id,
    },
  })

  console.log("Generating leave balances for 2026...")
  const users = [admin, manager, employee]
  const leaveTypes = [annualLeave, sickLeave, studyLeave]

  for (const user of users) {
    for (const leaveType of leaveTypes) {
      await prisma.leaveBalance.create({
        data: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: 2026,
          allocated: leaveType.defaultDaysPerYear,
          used: 0,
        },
      })
    }
  }

  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Seeding error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
