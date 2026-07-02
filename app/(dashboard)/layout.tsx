import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar user={session.user} />
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
