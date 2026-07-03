"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/features/auth/actions"
import { create } from "zustand"
import {
  LayoutDashboard,
  CalendarPlus,
  CheckSquare,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Zustand store to manage open/close and collapse state of the sidebar
interface SidebarState {
  isOpen: boolean // For mobile mobile drawer open/close
  isCollapsed: boolean // For desktop collapse toggle
  toggle: () => void
  close: () => void
  open: () => void
  toggleCollapse: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}))

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

  const isOpen = useSidebarStore((state) => state.isOpen)
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)
  const close = useSidebarStore((state) => state.close)
  const toggleCollapse = useSidebarStore((state) => state.toggleCollapse)

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
            href: "/employee/request-leave",
            label: "Request Leave",
            icon: CalendarPlus,
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
          {
            href: "/employee/request-leave",
            label: "Request Leave",
            icon: CalendarPlus,
          },
        ]
    }
  }

  const links = getLinks()

  // Get user initials for collapsed profile view
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <>
      {/* Desktop Sidebar (Permanent on md and above, collapsible) */}
      <div
        className={cn(
          "hidden md:flex flex-col border-r border-hairline bg-canvas h-screen text-ink select-none flex-shrink-0 transition-all duration-300 ease-in-out relative",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Floating Edge Collapse Button (Desktop Only) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute top-4 -right-3 w-6 h-6 rounded-full bg-canvas border border-hairline items-center justify-center text-ink-subtle hover:text-ink hover:bg-surface-1 transition-all duration-200 cursor-pointer z-50 shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Brand Header */}
        <div
          className={cn(
            "h-14 flex items-center border-b border-hairline transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "px-6"
          )}
        >
          <div className="flex items-center gap-2">
            {/* Lavender signature logo mark */}
            <div className="w-3.5 h-3.5 rounded bg-primary shadow-[0_0_8px_rgba(94,106,210,0.5)] flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-semibold text-sm tracking-tight text-ink animate-in fade-in duration-300">
                LeaveManager
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          className={cn(
            "flex-1 py-4 space-y-1.5 transition-all duration-300",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-md transition-all duration-200",
                  isCollapsed
                    ? "justify-center w-10 h-10 mx-auto"
                    : "gap-3 px-3 py-2 text-xs font-medium",
                  isActive
                    ? "bg-surface-2 text-ink"
                    : "text-ink-subtle hover:bg-surface-1 hover:text-ink"
                )}
                title={isCollapsed ? link.label : undefined}
              >
                <Icon className="w-4 h-4" flex-shrink-0="true" />
                {!isCollapsed && (
                  <span className="animate-in fade-in duration-300">
                    {link.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Footer Profile */}
        <div
          className={cn(
            "border-t border-hairline bg-surface-1 flex flex-col gap-3 transition-all duration-300",
            isCollapsed ? "p-2 items-center" : "p-4"
          )}
        >
          {isCollapsed ? (
            <>
              {/* User Avatar Circle */}
              <div
                className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-primary border border-hairline"
                title={`${user.name} (${user.role})`}
              >
                {userInitials}
              </div>
              {/* Sign out mini button */}
              <button
                onClick={async () => {
                  await logoutAction()
                }}
                className="flex items-center justify-center p-2 text-ink-subtle hover:text-danger rounded hover:bg-surface-2 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col min-w-0 animate-in fade-in duration-300">
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
                className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] font-medium text-ink-subtle hover:text-danger rounded hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                Sign out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Drawer (Toggled by store on mobile) */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={close}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-64 border-r border-hairline bg-canvas h-screen text-ink select-none flex-col z-50 md:hidden animate-in slide-in-from-left duration-200 flex">
            {/* Brand Header & Close Button */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-hairline">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-primary shadow-[0_0_8px_rgba(94,106,210,0.5)]" />
                <span className="font-semibold text-sm tracking-tight text-ink">
                  LeaveManager
                </span>
              </div>
              <button
                onClick={close}
                className="p-1 rounded text-ink-subtle hover:bg-surface-1 hover:text-ink transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
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
                    onClick={close}
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
                  close()
                  await logoutAction()
                }}
                className="flex items-center gap-2 mt-2 w-full px-3 py-1.5 text-[11px] font-medium text-ink-subtle hover:text-danger rounded hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
