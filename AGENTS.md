# 🤖 AI Agent Instructions (Leave Management Platform — MVP Scope)

Governs any AI coding agent (Claude Code, Cursor, Antigravity CLI, etc.) on this repo. Solo-builder MVP, built to production standards. Prevent scope creep; never compromise correctness or auth.

---

## 🎯 1. Vision & Scope

**Product:** Employees submit/track leave requests; managers/admins approve or reject against real balances, with a full audit trail.
**MVP bar:** Balance math and authorization must never be wrong. Everything else can be rough.
**Design:** `DESIGN.md` is the literal source of truth for all colors, spacing, type, and component tokens. Don't invent values — if a token is missing, propose adding it to `tailwind.config.ts`.

**Out of scope until named explicitly:**
In-product AI assistant, OAuth providers, holiday calendar, multi-org/tenant, payroll integration, mobile app, Docker (Neon DB branching replaces it). Full list: `MVP_PLAN.md` §8–9.

---

## ⚠️ 2. Non-Negotiables

- **Scope lock** — build only the current phase (`MVP_PLAN.md`). Flag anything outside it; don't build it silently.
- **No placeholders** — no `// TODO`, no `// ...existing code`. Ship complete code.
- **Minimal diffs** — touch only what the task requires.
- **Plan first** — 2–3 line comment before non-trivial logic, especially anything touching `LeaveBalance` or `LeaveRequest.status`.
- **Strict types** — no `any`, no `@ts-ignore`. `unknown` only at validation boundaries, narrowed immediately.
- **No new dependencies** without explicit approval.
- **Transactions are mandatory** on any mutation touching balance, status, or audit log — related writes succeed or fail together.
- **Server-side authorization, always** — client-side role checks are UX only. Every mutating Server Action re-checks actor role + scope (e.g. a manager only acts on their own reports).

---

## 🛠️ 3. Stack

**Frontend:** Next.js 15 (App Router, RSC by default), TypeScript, Tailwind + shadcn/ui, React Hook Form + Zod, Zustand (cross-component client state only), Recharts.
**Backend:** Server Actions (mutations) + Route Handlers (webhooks only), PostgreSQL (Neon) + Prisma, Auth.js v5 (credentials only for v1), Resend (email).

---

## 🏗️ 4. Architecture Rules

- Server Components by default; `"use client"` only at leaf nodes.
- Fetch data server-side in RSCs — never `useEffect` for fetching.
- Mutations = Server Actions. Route Handlers only for real webhooks.
- Filters/pagination/sort live in URL search params, not client state.

---

## 🗄️ 5. Database Rules

- `lib/db.ts` caches the Prisma client across hot reloads/invocations.
- v1 models: `User`, `LeaveType`, `LeaveBalance`, `LeaveRequest`, `Notification`, `AuditLog` — schema and required indexes in `MVP_PLAN.md` §2. Don't scaffold post-MVP models early.
- Soft-deactivate (`LeaveType.active`), never hard-delete financial/historical records. Hard delete only for disposable data (e.g. unread notifications), if asked.
- Zod validates all input before Prisma, at the top of each Server Action.
- `AuditLog` is append-only — no update/delete path, anywhere.

---

## 🎨 6. UI Rules

- All tokens (colors, spacing, radii, type, status colors) come from `DESIGN.md` — no hardcoded one-offs.
- Status badges (`PENDING`/`APPROVED`/`REJECTED`) use `DESIGN.md`'s semantic status tokens consistently everywhere.
- Forms: RHF + Zod, validated client and server. Handle `isSubmitting`, field errors, disabled-while-pending, success/failure toast.
- Every list/table: explicit empty, loading, and error states.
- Accessibility required: semantic HTML, labels, keyboard nav, focus states.

---

## 📂 7. Directory Structure

```text
src/
├── app/                  # routes, layouts, webhook handlers only
├── features/
│   ├── auth/ leave-types/ leave-balances/ leave-requests/
│   ├── approvals/ notifications/ audit-log/ dashboard/
├── components/           # shared UI
├── lib/                  # db.ts, utils.ts, auth.ts
├── types/
├── constants/
└── services/             # resend.ts (anthropic.ts is post-MVP only)
```
Each `features/x/` owns its `components/`, `actions.ts`, `schemas.ts`, `store.ts`. No cross-feature imports except via explicit exports.

---

## 📋 8. Source of Truth

`MVP_PLAN.md` governs scope and phase order. Phase 3 (Approvals) is the production floor — transactional safety and authorization must be solid before Phase 4/5 work starts. Nothing in `MVP_PLAN.md` §8–9 gets built unless named explicitly.