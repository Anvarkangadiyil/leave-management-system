# 📬 Project Submission — Leave Management Platform

---

## 🔗 GitHub Repository

**URL:** https://github.com/Anvarkangadiyil/leave-management-system

---

## 🚀 Live Demo

**URL:** https://leave-management-system-beige.vercel.app/

---

## 🎥 Demo Proof

> **Test credentials (password: `password123`):**
>
> | Role     | Email                |
> |----------|----------------------|
> | Admin    | admin@company.com    |
> | Manager  | manager@company.com  |
> | Employee | employee@company.com |

**Key flows to verify:**

1. **Employee** → Submit a leave request → Balance only deducted after approval (not on submission)
2. **Manager** → Approve/Reject from the queue → In-app notification + email fired atomically
3. **Admin** → Approve/Reject any request (all employees, not scoped to reports) → Manage leave types → View analytics dashboard with Recharts charts

---

## 📝 Short Note

### ⚠️ Challenges

1. **Transactional safety under race conditions** — Two rapid submissions from the same user could both pass a stale balance check. Fixed with a serialized Prisma transaction that re-reads the balance inside the write boundary.

2. **Auth.js v5 + Next.js 15 App Router at the edge** — The combination has thin documentation. Getting role-based middleware to hard-redirect at the Vercel edge (not just hide nav links) required working around Next.js 15 middleware constraints on `next-auth` session tokens.

3. **Live notifications without WebSockets** — A notification bell that updates without full page reload was built using Server-Sent Events (SSE), which is significantly harder to keep alive in a Next.js serverless context than in a persistent Node.js server.

4. **Email never blocking approvals** — A failed email send must never roll back a committed approval or its in-app notification. Solved by dispatching email after the transaction commits, logging failures silently instead of throwing.

5. **Business-day calculation consistency** — Working-day duration must match exactly between the client (live form preview) and the server action that records `days`. Extracted into a shared utility with unit tests to prevent drift.

---

### 🚀 Improvements (if given more time)

1. **Holiday calendar** — Weekends are excluded from duration counts but public holidays are not. A configurable per-country holiday table would make balance math production-accurate.

2. **Audit log table** — The schema and Server Action hooks are ready to receive an append-only `AuditLog` row on every balance/status mutation. Deferred to post-MVP per the plan.

3. **OAuth login (Google / Microsoft SSO)** — Credentials-only auth works for an MVP; real company deployments need SSO. Auth.js v5 supports additional providers with minimal extra code.

4. **Team calendar view** — A visual "who's out this week" calendar would give managers faster situational awareness than the current table list.

5. **Delegated approvals** — If a manager is on leave, their pending queue stalls. An auto-escalate-to-admin rule after N days would prevent bottlenecks.

6. **Playwright E2E tests** — Unit tests cover business-day calculation. A full login → submit → approve E2E test would close the remaining coverage gap.

7. **Optimistic UI on approvals** — React 19 transitions + optimistic state would make the approval queue feel instant instead of waiting for a round-trip.

---

## 📊 Evaluation Criteria — Self Assessment

| Criteria           | Weight | Notes                                                                                        |
|--------------------|--------|----------------------------------------------------------------------------------------------|
| Practical Thinking | 30%    | Balance math transactional; server-side auth re-checked on every mutation; email isolated from approval commit |
| AI Usage           | 20%    | Antigravity CLI used for scaffolding, debugging, and review — every suggestion adapted, not blindly applied |
| Code Quality       | 20%    | Strict TypeScript (no `any`), Zod at every Server Action boundary, feature-scoped directories, conventional commits |
| Git Discipline     | 10%    | Feature branch per phase, PRs merged into `main`, conventional commit messages throughout     |
| UI/UX              | 10%    | Linear-inspired dark UI; status badges; loading/empty/error states on every list; accessible forms |
| Ownership          | 10%    | Solo-built end-to-end across all 5 phases: auth → leave types → requests → approvals → analytics |
