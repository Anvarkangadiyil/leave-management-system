# Leave Management Platform — MVP

A simple, role-based leave management system built with Next.js, PostgreSQL (Neon), Prisma, Tailwind CSS, Auth.js v5 (NextAuth), and Resend.

## 🎯 Features

- **Role-Based Routing:** Edge-protected routes for `EMPLOYEE`, `MANAGER`, and `ADMIN`.
- **Leave Balances:** Automatic balance allocation per active leave type with auto-healing fallback.
- **Request Flow:** Interactive request forms with live business day duration calculations and balance checks.
- **Approval Queue:** Oldest-first approval list for managers and admins to accept or reject requests.
- **Notifications:** In-app notification system (polling-enabled bell component) and Resend email alerts.
- **Analytics Console:** Administrative stats and visual Recharts displaying approved days trends and type breakdowns.
- **Robust Transactions:** All status, balance mutations, and audit records execute in single database transactions.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Authentication:** Auth.js v5 (Credentials Provider)
- **Forms & Validation:** React Hook Form + Zod
- **Icons & Styling:** Lucide React + Tailwind CSS v4
- **Charts:** Recharts
- **Email:** Resend (API)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example` / `example.env`):
```env
# Database connection string (e.g. Neon or Local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leave_management?schema=public"

# NextAuth secret key (at least 32 characters)
AUTH_SECRET="your_next_auth_secret_minimum_32_characters_long_here"

# Resend Configuration for email notifications
RESEND_API_KEY="re_..."
RESEND_FROM="onboarding@resend.dev"
```

### 3. Migrate the Database
Initialize your database schema:
```bash
npx prisma db push
```

### 4. Seed Default Data
Seed the database with default leave types and test users:
```bash
npx prisma db seed
```

Default seeded accounts (password: `password123`):
- **Admin:** `admin@company.com`
- **Manager:** `manager@company.com`
- **Employee:** `employee@company.com`

---

## 🧪 Testing

To run the unit tests verifying business days calculations and date range logic:
```bash
npm test
```

---

## 💻 Running Locally

To boot the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

### Database (Neon)
1. Set up a PostgreSQL project on Neon.
2. Create a development branch and production branch.
3. Keep your Neon database URL in your deployment settings.

### Frontend (Vercel)
1. Import the repository into Vercel.
2. In the project settings, add the environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET` (Generate using `openssl rand -base64 32`)
   - `RESEND_API_KEY`
   - `RESEND_FROM`
3. Deploy! Next.js will automatically compile the server components, actions, and client bundles.
