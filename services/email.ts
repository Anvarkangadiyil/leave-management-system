import nodemailer from "nodemailer"

// SMTP Configuration from Environment Variables
const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpFrom = process.env.SMTP_FROM || "no-reply@yourdomain.com"

// Create reusable transporter object using SMTP transport if configured
const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null

export async function sendLeaveDecisionEmail(
  to: string,
  userName: string,
  status: string,
  days: number,
  startDate: Date
) {
  if (!transporter) {
    console.log(
      `[Email Mock] To: ${to}, User: ${userName}, Status: ${status}, Days: ${days}, Start: ${startDate.toISOString().split("T")[0]}`
    )
    return
  }

  try {
    const statusText = status.charAt(0) + status.slice(1).toLowerCase()
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `Leave Request ${statusText}`,
      html: `
        <p>Hello ${userName},</p>
        <p>Your request for ${days} days of leave starting ${startDate.toLocaleDateString()} has been <strong>${status.toLowerCase()}</strong>.</p>
      `,
    })
  } catch (error) {
    // Log failures, don't let them block the approval flow
    console.error("SMTP email failed to send:", error)
  }
}
