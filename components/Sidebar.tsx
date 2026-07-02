"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/features/auth/actions"
import {
  LayoutDashboard,
  CalendarPlus,
  CheckSquare,
  Settings,
  Users,
  LogOut,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const role = user.role

  const getLinks = () => {
    switch (role) {
      case "ADMIN":
        return [
          {
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/admin/leave-types",
            label: "Leave Types",
            icon: Settings,
          },
          {
            href: "/admin/approvals",
            label: "Approval Queue",
            icon: CheckSquare,
          },
        ]
      case "MANAGER":
        return [
          {
            href: "/employee/dashboard",
            label: "My Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/manager/approvals",
            label: "Team Approvals",
            icon: CheckSquare,
          },
        ]
      case "EMPLOYEE":
      default:
        return [
          {
            href: "/employee/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
        ]
    }
  }

  const links = getLinks()

  return (
    <div className="flex flex-col w-64 border-r border-hairline bg-canvas h-screen text-ink select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-6 border-b border-hairline">
        <div className="flex items-center gap-2">
          {/* Lavender signature logo mark */}
          <div className="w-3.5 h-3.5 rounded bg-primary shadow-[0_0_8px_rgba(94,106,210,0.5)]" />
          <span className="font-semibold text-sm tracking-tight text-ink">
            LeaveManager
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors",
                isActive
                  ? "bg-surface-2 text-ink"
                  : "text-ink-subtle hover:bg-surface-1 hover:text-ink"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-hairline bg-surface-1 flex flex-col gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-ink truncate">
            {user.name}
          </span>
          <span className="text-[10px] text-ink-subtle truncate uppercase tracking-wider font-mono">
            {user.role}
          </span>
        </div>
        <button
          onClick={async () => {
            await logoutAction()
          }}
          className="flex items-center gap-2 mt-2 w-full px-3 py-1.5 text-[11px] font-medium text-ink-subtle hover:text-danger rounded hover:bg-surface-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}
