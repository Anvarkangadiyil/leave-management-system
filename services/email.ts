import { Resend } from "resend"
import { getLeaveDecisionEmailHtml } from "@/lib/emailTemplates"

// Resend Configuration from Environment Variables
const resendApiKey = process.env.RESEND_API_KEY
let resendFrom = process.env.RESEND_FROM || "onboarding@resend.dev"
if (resendFrom && !resendFrom.includes("@")) {
  resendFrom = `no-reply@${resendFrom}`
}

const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendLeaveDecisionEmail(
  to: string,
  userName: string,
  status: string,
  days: number,
  startDate: Date
) {
  if (!resend) {
    console.log(
      `[Email Mock] To: ${to}, User: ${userName}, Status: ${status}, Days: ${days}, Start: ${startDate.toISOString().split("T")[0]}`
    )
    return
  }

  try {
    const statusText = status.charAt(0) + status.slice(1).toLowerCase()
    const badgeClass = status === "APPROVED" ? "badge-approved" : "badge-rejected"
    const startDateFormatted = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const html = getLeaveDecisionEmailHtml(
      userName,
      statusText,
      badgeClass,
      days,
      startDateFormatted
    )

    // Send email using official Resend SDK
    const { error } = await resend.emails.send({
      from: resendFrom,
      to,
      subject: `Leave Request ${statusText} - ${days} Days`,
      html,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    // Log failures, don't let them block the approval flow
    console.error("Resend email failed to send:", error)
  }
}
