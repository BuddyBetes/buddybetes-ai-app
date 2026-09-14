# BuddyBetes

**Your BestFriend in Diabetes Care.** A mobile-first progressive web app for tracking blood glucose, understanding patterns, and staying connected to the BuddyBetes community.

---

## Features

- **Glucose logging** — manual entry, glucometer photo scanning (OCR), or voice ("log 120 after dinner")
- **AI assistant** — text and voice conversations that answer questions and create logs
- **Food photo analysis** — carbohydrate and nutrition estimates from a picture of a meal
- **Insights & charts** — trends, time-in-range, and AI-generated observations on your dashboard
- **Events** — RSVP to community events, get a QR ticket, check in on site
- **Subscriptions** — Stripe checkout or manual receipt upload, with discount codes
- **Admin back office** — analytics dashboard, event management, QR scanner, email campaigns, receipt verification

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS v3, shadcn/ui (Radix) |
| Data | TanStack Query, React Router v6 |
| Backend | Supabase — Postgres + RLS, Auth, Storage, Edge Functions (Deno) |
| AI | Google Gemini (`gemini-2.5-flash`, `gemini-2.5-flash-preview-tts`) |
| Email | Resend (`noreply@buddybetes.com`) |
| Payments | Stripe + manual receipt verification |
| Hosting | Netlify (SPA redirects and headers in `netlify.toml`) |

---

## Architecture

```text
┌───────────────────────────────┐
│  React SPA (Vite, PWA)        │
│  pages / components / hooks   │
└───────────────┬───────────────┘
                │ supabase-js (anon key, RLS enforced)
┌───────────────▼───────────────┐
│  Supabase                     │
│  ├── Auth (email confirmed)   │
│  ├── Postgres + RLS           │
│  ├── Storage (receipts)       │
│  └── Edge Functions (Deno)    │
└───────┬───────────┬───────────┘
        │           │
   ┌────▼────┐ ┌────▼─────┐ ┌──────────┐
   │ Gemini  │ │  Resend  │ │  Stripe  │
   │  (AI)   │ │ (email)  │ │ (payments)│
   └─────────┘ └──────────┘ └──────────┘
```

All privileged logic (AI keys, email sending, payment verification, admin checks) lives in edge functions. The browser only ever holds the publishable anon key.

---

## Getting started

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev        # http://localhost:8080
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

### Configuration

The Supabase URL and publishable anon key are committed in `src/integrations/supabase/client.ts` (safe to expose — RLS protects the data). No `.env` file is needed to run the frontend.

Server-side secrets are configured in Supabase, not in the repo:

| Secret | Used for |
| --- | --- |
| `GEMINI_API_KEY` | All AI features |
| `RESEND_API_KEY` | All transactional and campaign email |
| `FATSECRET_API_KEY` | Nutrition lookups in the assistant |
| `STRIPE_SECRET_KEY` | Checkout and payment verification |

---

## Project structure

```text
src/                        Frontend — see src/CLAUDE.md
├── pages/                  Routes (user, auth, admin, settings)
├── components/             Feature components + shadcn/ui primitives
├── context/                Auth, logs, glucose unit, subscription
├── hooks/                  Data and UI hooks
├── services/ utils/        Speech, metrics, parsing, glucose helpers
└── integrations/supabase/  Generated client and database types

supabase/                   Backend — see supabase/CLAUDE.md
├── config.toml             Per-function JWT settings
└── functions/              24 edge functions + shared Gemini and email modules
```

---

## Deployment

Netlify builds with `npm run build` and publishes `dist/`. `netlify.toml` adds SPA fallback routing, security headers, and no-cache headers for HTML and assets. Edge functions deploy to Supabase separately.

---

## Documentation

- [`src/CLAUDE.md`](src/CLAUDE.md) — frontend architecture, routing, state, conventions and gotchas
- [`supabase/CLAUDE.md`](supabase/CLAUDE.md) — edge function catalogue, database schema, email and AI rules

Both are written for AI coding assistants (Claude Code and similar) but double as onboarding docs for new developers.
