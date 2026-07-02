import Header from "@/components/Header"
import AnalyticsDashboard from "@/features/dashboard/components/AnalyticsDashboard"
import { getAdminAnalytics } from "@/features/dashboard/actions"

export default async function AdminDashboard() {
  const analyticsData = await getAdminAnalytics()

  return (
    <>
      <Header title="Admin Console" />
      <main className="p-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Admin Console
          </h1>
          <p className="text-sm text-ink-subtle">
            Overview of company-wide leave trends, statistics, and weekly
            scheduled absences.
          </p>
        </div>

        <AnalyticsDashboard data={analyticsData} />
      </main>
    </>
  )
}
