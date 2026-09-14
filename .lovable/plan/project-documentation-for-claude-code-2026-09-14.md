# Project documentation for Claude Code

Create two deep-dive guides (frontend and backend) plus a rewritten README, all tailored for an AI coding assistant reading the repo cold.

## Files to create/update

1. `src/CLAUDE.md` — frontend guide
2. `supabase/CLAUDE.md` — backend guide
3. `README.md` — rewritten project overview

## 1. src/CLAUDE.md (frontend)

- What the app is: BuddyBetes, a diabetes companion (glucose logging, AI assistant, events, subscriptions, admin dashboard).
- Stack: React 18 + Vite + TypeScript + Tailwind + shadcn/ui, React Router, TanStack Query, framer-motion.
- Directory map: `pages/` (user, `auth/`, `admin/`, `settings/`), `components/` (feature folders + `ui/` shadcn primitives), `context/`, `hooks/`, `services/`, `utils/`, `integrations/supabase/`.
- Routing table from `AppRoutes.tsx`: public, protected, and admin routes, with the guards `ProtectedRoute`, `PublicRoute`, `AdminRoute` and the provider stack applied to protected pages.
- Auth and onboarding rules: email verification enforced, sign-out immediately after signup, onboarding gate, `isSignupInProgress` guard.
- State model: `AuthContext`, `LogContext`, `GlucoseUnitContext`, `SubscriptionContext` — what each owns and where data comes from.
- Key feature flows: add/edit logs, assistant (text + voice), food photo and glucometer capture, events and QR check-in, payments, admin analytics.
- Conventions: semantic Tailwind tokens only (no hardcoded colors), brand primary `#208687`, mobile-first, card containers `rounded-xl shadow-sm`, edge functions called via `supabase.functions.invoke`.
- Gotchas: realtime channel names must be unique per hook instance; timestamps stored as epoch ms; glucose unit conversion lives in `utils/glucoseUtils.ts`.
- Common tasks recipe list: add a page, add a shadcn component, add an admin page, call an edge function.

## 2. supabase/CLAUDE.md (backend)

- Overview of the Supabase project: Postgres + RLS, Auth, Storage, Edge Functions (Deno).
- Full edge function catalogue grouped by domain, each with purpose, invocation source, expected request/response shape, and JWT setting from `config.toml`:
  - AI: `glucose-assistant`, `glucose-insights`, `analyze-food-image`, `glucometer-ocr`, `parse-voice-input`, `speech-to-text`, `text-to-speech`
  - Email: `send-email-confirmation`, `send-password-reset`, `send-event-registration-email`, `send-payment-receipt`, `send-payment-verified`, `invoke-payment-email`, `send-email-blast`, `test-email-templates`
  - Events: `event-registration`, `event-checkin`
  - Payments/discounts: `create-stripe-checkout`, `verify-stripe-payment`, `apply-discount-code`, `validate-discount-code`
  - Admin/system: `verify-admin`, `notification-service`
- Shared modules: `_shared/gemini.ts` (chat, vision, native audio, PCM→WAV, retry/backoff, error mapping) and `_shared/email-templates/*`.
- AI provider rules: all AI runs on `GEMINI_API_KEY`; models `gemini-2.5-flash` and `gemini-2.5-flash-preview-tts`; no OpenAI remains.
- Email rules: Resend only, sender `noreply@buddybetes.com`, max 2 requests/sec with exponential backoff, `email_queue` table and worker, Supabase built-in auth emails must stay disabled to avoid duplicates.
- Database: table inventory with purpose, key RLS patterns, the `user_roles` + `has_role()` security-definer pattern, analytics RPCs.
- Secrets list (names only) and where each is used.
- Conventions for new work: migration ordering (create table → GRANT → enable RLS → policies), CORS header block, error shape, logging.

Table and column details will be read from `src/integrations/supabase/types.ts` and the function sources so the document matches the live schema.

## 3. README.md

Replace the Lovable boilerplate with: product summary, feature list, tech stack, architecture diagram (ASCII), local setup and scripts, environment/secret requirements, directory overview, deployment notes (Netlify config present), and links to the two CLAUDE.md guides.

## Notes

- Documentation only — no application code changes.
- Content derived from actual files, not assumptions; no invented tables, env vars, or endpoints.
