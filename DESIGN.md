## Overview

Role-based Leave Management System with React + MUI frontend and Express + MongoDB backend.
Auth via JWT, uploads via Multer, strict server-side validations (DOJ, overlap, business days, balances).
Primary roles: Employee, HR (future: Manager approval chain).

## System Architecture

```flowchart LR
  A[React + MUI (Browser)] -- HTTPS + JWT --> B[Express API (Node.js)]
  B --> C[(MongoDB)]
  B -- Multer --> D[(uploads/)]
  subgraph Backend
    B
    C
    D
  end ```

## Process Flow (E2E)

```flowchart TD
  subgraph HR_or_Manager[HR / Manager]
    A[Onboard Employee\n(create user, set role/manager,\nset Date of Joining, initial balances)]
    R[Review Leave Request]
    S{Decision}
    T[Approve → Status: APPROVED\nDeduct balance\nAudit + Notify]
    U[Reject → Status: REJECTED\nReason mandatory\nAudit + Notify]
  end

  subgraph Employee
    B[Receive Credentials]
    C[Login (JWT)]
    D[Apply for Leave\n(type, start, end, reason,\noptional doc)]
  end

  subgraph Backend_API[Express API + Services]
    E{Validations}
    E1[After DOJ?]
    E2[No overlap with\nPENDING/APPROVED?]
    E3[Business-day count ≤ available?]
    E4[Document required for type?]
    F[Create Leave: PENDING\nAudit + route to approver]
    G[Fail → 4xx with message]
  end

  A --> B --> C --> D --> E
  E --> E1 -->|No| G
  E --> E2 -->|No| G
  E --> E3 -->|No| G
  E --> E4 -->|Missing| G
  E1 -->|Yes| F
  E2 -->|Yes| F
  E3 -->|Yes| F
  E4 -->|OK|  F

  F --> R --> S
  S -->|Approve| T
  S -->|Reject| U ```

## Roles & Access

Employee: apply/cancel (pending), view balances/history.
HR: onboard users, view/decide all requests, view directory & balances.
Auth: Email/password → JWT (Bearer).
Middleware: requireAuth, requireRole('employee'|'hr').

## Future Enhancements

Richer employee profile: department, designation, location, probation, manager chain.

Manager workflow: route requests to reporting manager, HR as override/escalation.

Leave types: add Paternity/Father’s leave, policy-driven accrual rules per type.

Cancellation/Withdrawal: employee cancel pending; withdrawal request for approved with manager/HR consent.

Holiday calendar: region-aware exclusions in business-day calc.

Work duration & Comp-off: track extra hours/holiday work → earn comp-offs → apply/deduct.

Notifications: email/Slack on submit/decision; in-app activity feed.

Storage: move docs to S3/GCS with signed URLs, virus scanning hook.

