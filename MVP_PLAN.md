# MVP Build Plan — Leave Management Platform

A simple role-based leave management system: employees request leave, managers/admins approve it, balances update automatically.

**Stack:** Next.js 15 (App Router) + TypeScript · PostgreSQL (Neon) · Prisma ORM · Tailwind CSS + shadcn/ui · Auth.js v5 · Resend (email) · Recharts (charts) · Vercel (deploy)

Solo-builder pace. Each phase should run end-to-end before moving to the next.

---

## 1. What this is

Three roles (Employee, Manager, Admin). Employees request leave against a balance. Managers/admins approve or reject. Balances update, an in-app notification + email go out, and admins get a dashboard with basic analytics.

No AI features in this version — the app just needs to work correctly and be safe with real data.

---

## 2. Data model

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(EMPLOYEE)
  managerId    String?
  manager      User?    @relation("ManagerReports", fields: [managerId], references: [id])
  reports      User[]   @relation("ManagerReports")
  createdAt    DateTime @default(now())

  leaveRequests LeaveRequest[] @relation("Requester")
  approvals     LeaveRequest[] @relation("Approver")
  leaveBalances LeaveBalance[]
  notifications Notification[]
}

enum Role {
  EMPLOYEE
  MANAGER
  ADMIN
}

model LeaveType {
  id                 String   @id @default(cuid())
  name               String   @unique
  defaultDaysPerYear Int
  active             Boolean  @default(true)

  balances LeaveBalance[]
  requests LeaveRequest[]
}

model LeaveBalance {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  leaveTypeId String
  leaveType   LeaveType @relation(fields: [leaveTypeId], references: [id])
  year        Int
  allocated   Int
  used        Int       @default(0)

  @@unique([userId, leaveTypeId, year])
}

model LeaveRequest {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation("Requester", fields: [userId], references: [id])
  leaveTypeId String
  leaveType   LeaveType     @relation(fields: [leaveTypeId], references: [id])
  startDate   DateTime
  endDate     DateTime
  days        Int
  reason      String
  status      RequestStatus @default(PENDING)
  approverId  String?
  approver    User?         @relation("Approver", fields: [approverId], references: [id])
  decidedAt   DateTime?
  createdAt   DateTime      @default(now())

  @@index([userId, status])
  @@index([status, createdAt])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, read])
}
```

No audit log table for MVP (add later if you actually need one).

---

## 3. Phase plan

### Phase 0 — Foundation
- Next.js + TS + Tailwind + shadcn/ui scaffold
- Neon Postgres project (dev + prod branch)
- `lib/db.ts` — Prisma client singleton
- Auth.js v5: credentials provider, bcrypt-hashed passwords, JWT session with `role` claim
- Zod validation on forms and Server Actions
- `User` model + migration
- Middleware: `/employee/*` and `/admin/*` blocked at the edge by role
- Base layout: role-aware sidebar, empty dashboard per role

**Done when:** fresh clone boots with a documented `.env`, and hitting an admin route as an employee redirects/403s instead of just hiding a nav link.

### Phase 1 — Leave types & balances
- `LeaveType`, `LeaveBalance` models + migration
- Balance auto-created per active leave type on user creation
- Employee dashboard: balance cards (allocated / used / remaining)
- Admin: create/edit leave types (deactivate, never delete)

**Done when:** no user ever exists without balances, and deactivating a type doesn't break old requests that reference it.

### Phase 2 — Leave requests
- `LeaveRequest` model + migration
- Request form (React Hook Form + Zod): date range, balance check, overlap warning
- Submission wrapped in a transaction so two rapid requests can't both pass a stale balance check
- Request history with status badges and filtering

**Done when:** you can't overdraw a balance by double-submitting, and validation happens server-side regardless of client input.

### Phase 3 — Approvals & notifications — **production floor**
- Approval queue: pending requests, filter by status, oldest-first
- Approve/reject Server Action, transactional: balance deduction + status update happen together or not at all
- `Notification` model + migration — created in the same transaction as the approve/reject
- Email on approve/reject via Resend — log failures, don't let them block the approval
- In-app notification bell: unread count, dropdown list, mark-as-read
- Authorization check inside the Server Action: manager → own reports only, admin → all

**Done when:** the request → approve → balance-deduct → notify loop is correct under concurrency, and a failed email never rolls back an approval or the in-app notification.

### Phase 4 — Analytics dashboard
- Admin dashboard: leave trends over time (Recharts line/bar chart)
- Breakdown by leave type and department (Recharts pie/bar chart)
- Simple team calendar/list view — who's out this week
- These are read queries only — no writes, so keep them dumb and fast; add pagination or date-range filters if a query gets slow, not before

**Done when:** the dashboard loads in under a second against a realistic seed dataset (not just 5 rows).

### Phase 5 — Polish & deploy
- Empty/loading/error states on every list
- A few tests: balance/transaction logic, approve/reject flow, one E2E happy path (login → request → approve)
- Deploy: Vercel + Neon prod branch, preview deployments per PR
- README: setup, env vars, how to deploy

**Done when:** someone else could clone the repo, follow the README, and get it running.

---

## 4. Non-negotiables

- Every balance/status mutation (and its notification) runs inside a Prisma transaction
- Every Server Action re-checks authorization server-side — UI role checks are cosmetic only
- Every input is Zod-validated on the server, not just the client
- No secrets committed; `.env.example` stays current

---

## 5. UI direction

Linear-style: dense, calm, neutral palette with one accent color for primary actions and status. Cards for balances, tables for the approval queue, simple charts for the dashboard. No gradients or illustrations.

---

## 6. Git discipline

```
main (protected)
├── feat/auth-and-roles
├── feat/leave-types-and-balances
├── feat/leave-request-flow
├── feat/admin-approvals-and-notifications
└── feat/analytics-dashboard
```
Conventional commits, PRs into `main`.

---

## 7. Explicitly deferred

Audit logging, AI assistant, OAuth login, holiday calendars, multi-org support, payroll integration, mobile app.

Add these back later if the app actually needs them — don't build for hypothetical scale on day one.