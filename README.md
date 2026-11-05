# Gymora

Multi-tenant gym management SaaS. Mobile-first. One-time licence + annual maintenance.

## Stack
- Frontend: React + Vite + Tailwind (Cloudflare Pages)
- Backend: Hono on Node.js (Render free tier)
- DB: MongoDB Atlas M0
- Payments: Razorpay

## Setup

1. `cp .env.example .env` and fill in values.
2. `pnpm install`
3. `pnpm --filter @gymora/db test`   # creates indexes, verifies connection
4. `pnpm --filter @gymora/api dev`   # http://localhost:8787/health
5. `pnpm --filter @gymora/web dev`   # http://localhost:5173

## Phase status
- [x] Phase 1: Scaffold, shared schemas, DB indexes, health check
- [ ] Phase 2: Auth + gym registration + superadmin approval + activation
- [ ] Phase 3: Members / plans / payments / renewals
- [ ] Phase 4: Reports + WhatsApp templates
- [ ] Phase 5: Razorpay purchase + maintenance + webhooks
- [ ] Phase 6: Landing page + UI polish + deploy