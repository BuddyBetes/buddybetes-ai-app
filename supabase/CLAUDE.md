# BuddyBetes — Backend Guide (`supabase/`)

Reference document for AI coding assistants. Everything here reflects the actual code in this folder and the generated types in `src/integrations/supabase/types.ts`.

---

## 1. Overview

The backend is a single Supabase project (`zjqiikollqinafveesvo`):

- **Postgres** with Row Level Security on every user-facing table
- **Supabase Auth** (email + password, email confirmation required)
- **Storage** for payment receipts and uploaded images
- **Edge Functions** (Deno / TypeScript) for everything privileged: AI calls, email sending, payments, event check-in, admin verification

```text
supabase/
├── config.toml                     # per-function JWT settings
└── functions/
    ├── _shared/
    │   ├── gemini.ts               # single AI helper for all functions
    │   └── email-templates/        # base-template, components, styles, buddybetes-promo
    ├── <function-name>/index.ts    # one folder per function
    └── analyze-food-image/{services,utils}/ , glucose-insights/{analyzers,parser,prompts,stats,types}.ts
```

`config.toml` lists functions that skip JWT verification (`verify_jwt = false`): `send-email-confirmation`, `send-password-reset`, `send-payment-receipt`, `send-payment-verified`, `invoke-payment-email`. Everything else requires an authorization header.

---

## 2. AI: Gemini only

**All AI runs on `GEMINI_API_KEY`. No OpenAI code remains anywhere in the repo — do not reintroduce it.**

`_shared/gemini.ts` is the only place that talks to Google:

| Export | Purpose |
| --- | --- |
| `geminiChat({ messages, model?, temperature?, maxTokens?, jsonMode? })` | Chat and vision via the OpenAI-compatible endpoint; returns the assistant text |
| `geminiGenerateContent(model, payload)` | Native `generateContent` — used for audio in (STT) and audio out (TTS) |
| `getGeminiKey()` | Throws a clear error when the key is missing |
| `GeminiError` / `describeGeminiError(err)` | Maps 429 → "AI is busy", 401/403 → permission message |
| `pcmToWav(pcm, sampleRate, channels)` | Wraps Gemini's raw 16-bit PCM output in a WAV header |
| `bytesToBase64` / `base64ToBytes` | Chunked base64 helpers (avoid stack overflow on large buffers) |

Constants: `DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"`, `GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts"`.
Built-in retry: 3 attempts with exponential backoff on 429 and 5xx; 4xx fails fast.

**Rules for new AI code**
- Import from `../_shared/gemini.ts`; never `fetch` Google directly.
- Never wrap the call in a client-side timeout/`AbortSignal.timeout` — generation can legitimately take minutes.
- Always `await` the AI call before returning the function response.
- Use `jsonMode: true` when you need structured output, and still guard `JSON.parse` with a fallback.

---

## 3. Edge function catalogue

### AI functions

| Function | Request body | Returns | Called from |
| --- | --- | --- | --- |
| `glucose-assistant` | `{ message, glucoseHistory?, foodQuery?, makeBrief?, language = 'english', analyzeTrends? }` | assistant reply (+ stats / trend analysis / nutrition when requested) | `hooks/assistant/useAssistantResponse` |
| `glucose-insights` | `{ glucoseHistory, language = 'english', timeRange = 'all' }` | structured insights; stats and analyzers in sibling modules | `useGlucoseInsights` |
| `parse-voice-input` | `{ message }` | parsed glucose value / meal context intent | `services/voiceParsingService` |
| `analyze-food-image` | `{ image }` (base64) | detected foods + nutrition estimates | `useImageAnalysis` / food camera |
| `glucometer-ocr` | `{ image }` (base64) | numeric glucose reading from a meter photo | `components/glucose/GlucometerScanModal` |
| `speech-to-text` | `{ audio, language?, mimeType? }` (JSON base64 or multipart) | `{ text }` | voice recorder |
| `text-to-speech` | `{ text, voice? }` | `{ audioContent, mimeType }` — WAV, **consume the returned mimeType** | `useSpeechSynthesis`, `components/voice/AudioPlayer` |

`glucose-assistant` also enriches answers with FatSecret nutrition lookups (`FATSECRET_API_KEY`) and produces Tagalog output via a second Gemini pass when `language = 'tagalog'`.

### Email functions (Resend)

| Function | Request body | Notes |
| --- | --- | --- |
| `send-email-confirmation` | `{ email, firstName, lastName, confirmationUrl, userId }` | signup confirmation; `verify_jwt = false` |
| `send-password-reset` | `{ email, resetUrl, otp }` | `verify_jwt = false` |
| `send-event-registration-email` | `{ email, firstName, lastName, eventTitle, eventDate, qrCode, userId }` | the reference template all others follow |
| `send-payment-receipt` | `{ receiptId, userId }` | |
| `send-payment-verified` | `{ receiptId, userId }` | links back to `https://app.buddybetes.com` |
| `invoke-payment-email` | `{ receiptId, emailType }` | dispatcher for the two payment emails |
| `send-email-blast` | `{ campaignId }` | campaign/blast sender with segmentation + rate limiting |
| `test-email-templates` | `{ emailType, recipientEmail }` | admin preview/test sends |

### Events

| Function | Request body | Notes |
| --- | --- | --- |
| `event-registration` | `{ eventId, email, firstName, lastName, userId? }` | creates the registration, generates the QR code, triggers the confirmation email |
| `event-checkin` | `{ qrCode }` | validates the QR and marks attendance; powers `LiveCheckInStats` |

### Payments & discounts

| Function | Request body | Notes |
| --- | --- | --- |
| `create-stripe-checkout` | `{ tierId, discountCodeId? }` | uses the caller's JWT to identify the user, then service role to persist |
| `verify-stripe-payment` | `{ sessionId }` | confirms the session and activates the subscription |
| `validate-discount-code` | `{ code }` | read-only check |
| `apply-discount-code` | `{ code, tierId }` | records a redemption |

### Admin & system

| Function | Purpose |
| --- | --- |
| `verify-admin` | Server-side admin check — never trust client-side role state |
| `notification-service` | Processes scheduled `user_notifications` (invoked by `checkScheduledNotifications` in the Supabase client helper) |

---

## 4. Email rules

- **Resend is the only email provider.** Supabase's built-in auth mailer must stay **disabled** — when it is on, users receive duplicate messages from a second sender.
- **Sender is always `BuddyBetes <noreply@buddybetes.com>`** (verified domain, Pro plan). A different or unverified `from` produces a Resend 422 `invalid from field`.
- **Rate limit: 2 requests/second.** Batched sends must throttle and use exponential backoff on 429.
- **`email_queue`** holds queued sends with retry state; a worker drains it. `email_logs` records outcomes (linked to `user_id` where known), `email_analytics` tracks opens/clicks, `email_unsubscribes` holds opt-outs — check it before any campaign send.
- **Templates** live in `_shared/email-templates/`: `base-template.ts` (branded gradient shell), `components.ts` (buttons, cards, headings), `styles.ts`, plus campaign-specific bodies. New emails must compose the base template rather than inlining HTML.

---

## 5. Database

### Tables

| Table | Purpose |
| --- | --- |
| `profiles` | Basic user profile; created by the `on_auth_user_created` trigger |
| `health_data` | Onboarding health metrics: gender, birthdate, height, weight, diabetes type |
| `glucose_logs` | Core readings with meal context, food, medication, exercise, notes |
| `assistant_conversations`, `assistant_messages` | Assistant history (`message_type`, `content`, `timestamp`, `nutritional_info`) |
| `user_notifications` | In-app notifications + scheduled reminders (realtime enabled) |
| `events`, `event_registrations` | Events and RSVPs with QR codes and check-in state |
| `subscription_tiers`, `user_subscriptions` | Plans and active subscriptions |
| `payment_receipts` | Manually uploaded proof of payment, admin-verified |
| `discount_codes`, `discount_redemptions` | Promo codes and their usage |
| `email_campaigns`, `email_campaign_recipients`, `email_logs`, `email_queue`, `email_analytics`, `email_unsubscribes` | Email system |
| `user_roles` | Role assignments (`user_role` enum: `admin` \| `user`) |
| `user_sessions`, `user_activity_logs`, `daily_active_users`, `user_retention_cohorts` | Product analytics |
| `admin_activity_logs` | Admin audit trail |
| `pending_accounts` | Signups awaiting email confirmation |

### Database functions (RPC)

`has_role(_user_id, _role)`, `is_admin(_user_id)`, `has_active_subscription(_user_id)`, `has_feature_access(...)`,
`get_monthly_active_users(...)`, `get_cohort_retention_data(...)`, `get_user_lifecycle_distribution(...)`, `get_analytics_retention_data()`,
`update_daily_active_users()`, `update_daily_active_users_enhanced()`, `update_retention_cohorts()`, `backfill_analytics_data()`.

DAU/MAU charts on the admin dashboard are derived from the retention/analytics tables via these RPCs.

### Roles & security

Roles are stored in a **separate `user_roles` table** — never on `profiles`. Checks go through the security-definer function:

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
```

Policies call `public.has_role(auth.uid(), 'admin')` so RLS never recurses. Admin UI gating additionally goes through the `verify-admin` edge function.

---

## 6. Secrets (names only)

| Secret | Used by |
| --- | --- |
| `GEMINI_API_KEY` | every AI function via `_shared/gemini.ts` |
| `RESEND_API_KEY` | every email function |
| `FATSECRET_API_KEY` | `glucose-assistant` nutrition lookups |
| `STRIPE_SECRET_KEY` | `create-stripe-checkout`, `verify-stripe-payment` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | injected automatically into functions |

Service-role keys are server-side only; they must never appear in `src/`.

---

## 7. Conventions for new work

**Migrations** — every `CREATE TABLE` in `public` must be followed, in the same migration and in this order, by grants, RLS, then policies:

```sql
create table public.my_table (...);

grant select, insert, update, delete on public.my_table to authenticated;
grant all on public.my_table to service_role;
-- grant select on public.my_table to anon;  -- only if a policy allows anonymous reads

alter table public.my_table enable row level security;

create policy "Users manage their own rows"
  on public.my_table for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

**Edge function skeleton**

```ts
import { corsHeaders } from "../_shared/cors.ts"; // or inline the block below

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { foo } = await req.json();
    // work…
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("my-function error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

Register the function in `config.toml`, adding `verify_jwt = false` only when it genuinely must be callable without a session (e.g. an email hook).

**Other rules**
- Log errors with `console.error` and a function-name prefix; never log secrets, tokens or full email bodies.
- Keep response shapes stable — the frontend depends on exact field names (`text`, `audioContent`, `mimeType`, `insights`, …).
- Use the service-role client only for work the user legitimately cannot do under RLS, and always re-derive the user from the JWT rather than trusting a `userId` in the body for privileged actions.

See `src/CLAUDE.md` for how the frontend consumes all of this.
