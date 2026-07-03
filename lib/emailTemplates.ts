/**
 * Generates the HTML content for the leave decision email template.
 */
export function getLeaveDecisionEmailHtml(
  userName: string,
  statusText: string,
  badgeClass: string,
  days: number,
  startDateFormatted: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Request Update</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 48px 24px;
      box-sizing: border-box;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .header {
      border-bottom: 1px solid #f1f5f9;
      padding: 32px 32px 24px 32px;
    }
    .logo {
      color: #5e6ad2;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 16px;
    }
    .content {
      padding: 32px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      line-height: 28px;
      margin: 0 0 16px 0;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    p {
      font-size: 15px;
      line-height: 24px;
      color: #475569;
      margin: 0 0 24px 0;
    }
    .details-card {
      background-color: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-row:first-child {
      padding-top: 0;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      color: #0f172a;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-approved {
      background-color: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-rejected {
      background-color: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
      padding: 24px 32px;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      line-height: 18px;
      color: #94a3b8;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">LeavePortal</div>
        <h1>Leave Request Update</h1>
      </div>
      <div class="content">
        <p>Hello ${userName},</p>
        <p>Your manager has reviewed and made a decision on your leave request. Here are the details of the decision:</p>
        
        <div class="details-card">
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value">
              <span class="badge ${badgeClass}">${statusText}</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration</span>
            <span class="detail-value">${days} ${days === 1 ? 'day' : 'days'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Start Date</span>
            <span class="detail-value">${startDateFormatted}</span>
          </div>
        </div>

        <p>You can check the full details, current balances, and history of your requests directly on the employee dashboard.</p>
      </div>
      <div class="footer">
        <p class="footer-text">This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
