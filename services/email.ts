import { Resend } from "resend"

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
    
    // Send email using official Resend SDK
    const { error } = await resend.emails.send({
      from: resendFrom,
      to,
      subject: `Leave Request ${statusText}`,
      html: `
        <p>Hello ${userName},</p>
        <p>Your request for ${days} days of leave starting ${startDate.toLocaleDateString()} has been <strong>${status.toLowerCase()}</strong>.</p>
      `,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    // Log failures, don't let them block the approval flow
    console.error("Resend email failed to send:", error)
  }
}
