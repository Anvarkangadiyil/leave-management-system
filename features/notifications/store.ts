import { create } from "zustand"
import { markNotificationAsRead, markAllNotificationsAsRead } from "./actions"

export interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: Date
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  eventSource: EventSource | null
  initialized: boolean
  initSSE: () => void
  closeSSE: () => void
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  eventSource: null,
  initialized: false,

  initSSE: () => {
    // Only execute client-side
    if (typeof window === "undefined") return

    const state = get()
    if (state.initialized || state.eventSource) return

    const es = new EventSource("/api/notifications/sse")

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "initial") {
          const loaded = data.notifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
          set({
            notifications: loaded,
            unreadCount: loaded.filter((n: any) => !n.read).length,
          })
        } else if (data.type === "update") {
          const updated = data.notifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))

          set((prev) => {
            // Prevent duplicate notifications
            const existingIds = new Set(prev.notifications.map((n) => n.id))
            const filteredNew = updated.filter((n: any) => !existingIds.has(n.id))

            if (filteredNew.length === 0) return {}

            const nextList = [...filteredNew, ...prev.notifications]
            return {
              notifications: nextList,
              unreadCount: nextList.filter((n) => !n.read).length,
            }
          })
        }
      } catch (err) {
        console.error("Error parsing SSE event data:", err)
      }
    }

    es.onerror = (err) => {
      console.error("SSE connection error:", err)
      
      const current = useNotificationStore.getState()
      // If the connection was closed/changed manually, do nothing
      if (current.eventSource !== es) return

      es.close()
      set({ eventSource: null, initialized: false })

      // Attempt to reconnect after a 5 second delay
      setTimeout(() => {
        const nextState = useNotificationStore.getState()
        if (typeof window !== "undefined" && !nextState.initialized && !nextState.eventSource) {
          nextState.initSSE()
        }
      }, 5000)
    }

    set({ eventSource: es, initialized: true })
  },

  closeSSE: () => {
    const { eventSource } = get()
    if (eventSource) {
      eventSource.close()
    }
    set({ eventSource: null, initialized: false, notifications: [], unreadCount: 0 })
  },

  markRead: async (id: string) => {
    // Optimistic Update
    set((prev) => {
      const nextList = prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications: nextList,
        unreadCount: nextList.filter((n) => !n.read).length,
      }
    })

    try {
      await markNotificationAsRead(id)
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  },

  markAllRead: async () => {
    // Optimistic Update
    set((prev) => {
      const nextList = prev.notifications.map((n) => ({ ...n, read: true }))
      return {
        notifications: nextList,
        unreadCount: 0,
      }
    })

    try {
      await markAllNotificationsAsRead()
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
    }
  },
}))
