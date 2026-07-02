import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

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
    await resend.emails.send({
      from: "anvarkangadiyil@gmail.com",
      to,
      subject: `Leave Request ${
        status.charAt(0) + status.slice(1).toLowerCase()
      }`,
      html: `
        <p>Hello ${userName},</p>
        <p>Your request for ${days} days of leave starting ${startDate.toLocaleDateString()} has been <strong>${status.toLowerCase()}</strong>.</p>
      `,
    })
  } catch (error) {
    // Log failures, don't let them block the approval
    console.error("Resend email failed to send:", error)
  }
}
