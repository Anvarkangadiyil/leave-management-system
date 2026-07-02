"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getMyNotifications() {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  return await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  })
}

export async function markNotificationAsRead(id: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  await db.notification.update({
    where: { id, userId: session.user.id },
    data: { read: true },
  })

  revalidatePath("/employee/dashboard")
  revalidatePath("/manager/dashboard")
  revalidatePath("/admin/dashboard")
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  revalidatePath("/employee/dashboard")
  revalidatePath("/manager/dashboard")
  revalidatePath("/admin/dashboard")
  return { success: true }
}
