import { NextRequest } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

type NotificationTimestamp = {
  createdAt: Date | string
}

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()

  const send = async (data: unknown) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
    } catch (e) {
      // Stream might already be closed on client disconnect
    }
  }

  // Define the streaming logic to run asynchronously
  const runStreaming = async () => {
    // Initial load
    // If no notifications exist, set lastChecked to 5 minutes ago to avoid clock drift issues
    let lastChecked = new Date(Date.now() - 5 * 60 * 1000)
    try {
      const notifications = await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 15,
      })

      if (notifications.length > 0) {
        const maxTime = Math.max(...notifications.map((n: NotificationTimestamp) => new Date(n.createdAt).getTime()))
        lastChecked = new Date(maxTime)
      }

      await send({ type: "initial", notifications })
    } catch (err) {
      console.error("SSE initial load error:", err)
      await send({ type: "error", message: "Failed to load notifications" })
    }

    // Check for new notifications periodically
    const interval = setInterval(async () => {
      if (req.signal.aborted) {
        clearInterval(interval)
        try {
          writer.close()
        } catch (e) {}
        return
      }

      try {
        const newNotifications = await db.notification.findMany({
          where: {
            userId,
            createdAt: { gt: lastChecked },
          },
          orderBy: { createdAt: "desc" },
        })

        if (newNotifications.length > 0) {
          const maxTime = Math.max(...newNotifications.map((n: NotificationTimestamp) => new Date(n.createdAt).getTime()))
          lastChecked = new Date(maxTime)
          await send({ type: "update", notifications: newNotifications })
        } else {
          // Send a ping heartbeat to prevent gateway/proxy timeout
          await send({ type: "ping" })
        }
      } catch (err) {
        console.error("SSE interval check error:", err)
      }
    }, 4000)

    req.signal.addEventListener("abort", () => {
      clearInterval(interval)
      try {
        writer.close()
      } catch (e) {}
    })
  }

  // Trigger streaming asynchronously, allowing the response to be returned immediately
  runStreaming().catch((err) => {
    console.error("SSE runStreaming error:", err)
  })

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
    },
  })
}
