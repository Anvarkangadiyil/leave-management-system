"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check } from "lucide-react"
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../actions"

interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: Date
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications()
      setNotifications(
        data.map((n) => ({ ...n, createdAt: new Date(n.createdAt) }))
      )
    } catch (e) {
      // Silently fail if not logged in yet or db not migrated
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000) // Poll every 20 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    await markNotificationAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await markAllNotificationsAsRead()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-full hover:bg-surface-1 text-ink-subtle hover:text-ink transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 flex items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white shadow-[0_0_4px_rgba(94,106,210,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-hairline bg-surface-3 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-hairline bg-surface-4 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink font-mono">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-primary hover:text-primary-hover font-medium flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-hairline">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-tertiary">
                No notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                  className={`p-3 text-xs leading-relaxed transition-colors cursor-pointer flex gap-3 ${
                    n.read
                      ? "text-ink-subtle hover:bg-surface-2/20"
                      : "bg-primary/5 text-ink hover:bg-primary/10"
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <p>{n.message}</p>
                    <span className="text-[9px] text-ink-tertiary font-mono">
                      {n.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
