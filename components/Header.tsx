import NotificationBell from "@/features/notifications/components/NotificationBell"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-14 border-b border-hairline bg-canvas flex items-center justify-between px-8 select-none">
      <h2 className="text-sm font-semibold tracking-tight text-ink py-4.5">{title}</h2>

      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    </header>
  )
}
