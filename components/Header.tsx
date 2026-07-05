"use client"

import NotificationBell from "@/features/notifications/components/NotificationBell"
import { Menu } from "lucide-react"
import { useSidebarStore } from "./Sidebar"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const openSidebar = useSidebarStore((state) => state.open)

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-hairline bg-canvas flex items-center justify-between px-8 select-none">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Toggle (Mobile Only) */}
        <button
          onClick={openSidebar}
          className="p-1 rounded text-ink-subtle hover:bg-surface-1 hover:text-ink md:hidden transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold tracking-tight text-ink py-4.5">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    </header>
  )
}
