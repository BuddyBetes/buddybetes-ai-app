# BuddyBetes — Frontend Guide (`src/`)

Reference document for AI coding assistants working in this repository. Everything here is derived from the actual source files.

---

## 1. What the app is

**BuddyBetes** — "Your BestFriend in Diabetes Care". A mobile-first PWA for people managing diabetes:

- Log blood glucose readings (manual, photo of a glucometer, or voice)
- AI assistant (text + voice) that answers questions and logs readings conversationally
- Food photo analysis with nutrition estimates
- Dashboard charts, statistics and AI-generated insights
- Community events with RSVP, QR ticket and on-site check-in
- Subscription tiers with Stripe checkout and manual receipt upload
- Admin back office: analytics, events, email campaigns, receipts, discount codes

---

## 2. Stack

| Concern | Choice |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite 5 (dev server on port 8080) |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix primitives) |
| Routing | `react-router-dom` v6 |
| Server state | `@tanstack/react-query` |
| Animation | `framer-motion` |
| Charts | `recharts` (via `components/ui/chart.tsx`) |
| Forms | `react-hook-form` + `zod` |
| Backend | Supabase (`@supabase/supabase-js`) |
| Extras | `embla-carousel-react`, `html5-qrcode`, `qrcode.react`, `@react-pdf/renderer`, `date-fns` |

No Next.js, no SSR. Everything is a client-side SPA; all privileged logic lives in Supabase edge functions.

---

## 3. Directory map

```text
src/
├── main.tsx                  # React root
├── App.tsx                   # Provider stack + BrowserRouter
├── index.css                 # Tailwind layers + CSS variables (design tokens)
├── types.ts                  # Assistant message / stats / nutrition types
├── components/
│   ├── AppRoutes.tsx         # THE route table — start here
│   ├── ProtectedRoute.tsx    # auth + onboarding gate
│   ├── PublicRoute.tsx       # redirects signed-in users away from /signin, /signup
│   ├── AdminRoute.tsx        # admin-role gate
│   ├── Layout.tsx, AppHeader.tsx, Navigation.tsx, PageTransition.tsx
│   ├── ui/                   # shadcn primitives — do not hand-edit unless necessary
│   ├── admin/                # AdminLayout, AdminSidebar, EventForm, DiscountCodeForm, …
│   ├── analytics/            # MetricCard, DailyActiveUsersChart, DailyMetricsSection, …
│   ├── assistant/            # TextMode, VoiceMode, MessageList, MessageInput
│   ├── voice/                # recorder, player, pulse animation, status buttons
│   ├── auth/                 # sign-in form, password reset flow pieces
│   ├── onboarding/           # multi-step onboarding UI
│   ├── dashboard/            # stats, chart section, insights, announcements carousel
│   ├── events/               # RSVP forms, QR display, QR scanner, registration list
│   ├── food/                 # camera capture, analysis result, item editing
│   ├── glucose/              # glucometer capture + scan modal
│   ├── form/                 # individual log-form fields
│   ├── log/, insights/, profile/, payment/, paywall/, subscription/
├── context/                  # React contexts (see §5)
├── hooks/                    # data + UI hooks (see §6)
├── services/                 # speech, metrics, voice parsing service layers
├── utils/                    # glucoseUtils, voiceParser, foodDetection, speechProcessing
├── integrations/supabase/    # generated client + generated Database types
├── pages/                    # route components
│   ├── auth/    SignIn, SignUp, ResetPassword, EmailConfirmed
│   ├── admin/   AdminAuth, AdminDashboardHome, EventDashboard, EventScannerView,
│   │            EmailManagement, EmailCampaigns, PaymentReceipts, DiscountCodes
│   └── settings/ Settings, Help, Privacy
└── types/                    # logs, metrics, filters, discountCodes, global.d.ts
```

---

## 4. Routing (`src/components/AppRoutes.tsx`)

Single source of truth for navigation. Three categories:

**Public**
| Path | Component | Notes |
| --- | --- | --- |
| `/` | redirect | → `/dashboard` if authenticated, else `/signin` |
| `/signin` | `auth/SignIn` | wrapped in `PublicRoute` |
| `/signup` | `auth/SignUp` | wrapped in `PublicRoute` |
| `/confirm` | `auth/EmailConfirmed` | email confirmation landing |
| `/reset-password` | `auth/ResetPassword` | |
| `/terms` | `Terms` | |
| `/event/:eventId` | `Event` | public event page + RSVP |

**Protected** (`renderProtectedRoute` = `ProtectedRoute` → `GlucoseUnitProvider` → `SubscriptionProvider` → `PageTransition`)
`/dashboard`, `/add-log`, `/logs`, `/assistant`, `/subscription`, `/payment-success`, `/profile`, `/settings`, and `/onboarding` (same stack but with `skipOnboardingCheck`).

**Admin** (`AdminRoute` → `AdminLayout`)
`/admin` (login), `/admin/dashboard`, `/admin/receipts`, `/admin/campaigns`, `/admin/emails`, `/admin/events`, `/admin/events/scan/:eventId`, `/admin/discounts`.

> `/admin/dashboard` is the analytics dashboard — there is no separate analytics route.

**Adding a route:** add the import and the `<Route>` in `AppRoutes.tsx`, wrapping it with `renderProtectedRoute(...)` for user pages or `<AdminRoute><AdminLayout>…</AdminLayout></AdminRoute>` for admin pages. Admin pages also need a sidebar entry in `components/admin/AdminSidebar.tsx`.

---

## 5. Auth & onboarding rules (do not regress these)

These behaviours were fixed deliberately; changing them reintroduces known bugs.

1. **Email verification is mandatory.** After `signUp`, the user is signed out immediately and redirected to `/signin` with a reminder to confirm their email. They must never land on `/onboarding` straight from signup.
2. **`isSignupInProgress`** (from `useAuthOperations`, exposed on `AuthContext`) guards against the race where the transient signup session briefly makes `useAuthSession` report an authenticated user.
3. **`/onboarding` is reachable only after a confirmed email and a fresh sign-in.** `ProtectedRoute` gates every other page on `hasCompletedOnboarding`.
4. **Onboarding requires** gender, birthdate, height, weight and diabetes type. The "Complete Setup" button stays clickable at all times; missing fields surface as a toast, never as a disabled button.
5. **Auth emails come from custom Resend edge functions**, not Supabase's built-in mailer (which must stay disabled — otherwise users get duplicates).

Relevant files: `context/auth/useAuthSession.ts`, `useAuthOperations.ts`, `useOnboardingStatus.ts`, `components/ProtectedRoute.tsx`, `pages/auth/SignUp.tsx`, `pages/Onboarding.tsx`.

---

## 6. State model

Provider stack in `App.tsx`:
`BrowserRouter → QueryClientProvider → TooltipProvider → AuthProvider → PasswordResetProvider → LogProvider → AnalyticsTracker`.
Protected routes add `GlucoseUnitProvider` and `SubscriptionProvider`.

| Context | Owns |
| --- | --- |
| `AuthContext` | session, user, `isAuthenticated`, `loading`, `signIn/signUp/signOut`, `hasCompletedOnboarding`, `isPasswordRecovery`, `isSignupInProgress` |
| `LogContext` | all glucose logs for the user + CRUD + derived helpers (`getRecentLogs`, `getLogsForToday`, `getAverageGlucose`) |
| `GlucoseUnitContext` | mg/dL vs mmol/L display preference |
| `SubscriptionContext` | active tier and feature access |
| `PasswordResetContext` | token processing / link validation / reset completion |

**Key hooks**

| Hook | Purpose |
| --- | --- |
| `useLogAPI` | Supabase CRUD for `glucose_logs` |
| `useLogUtils` / `useLogFilters` | derived stats and list filtering |
| `useGlucoseInsights` | calls `glucose-insights` edge function |
| `useAssistant` + `hooks/assistant/*` | assistant orchestration (UI state, message handling, persistence, speech synthesis, glucose-log intent parsing) |
| `useAudioCapture`, `useVoiceProcessor`, `useVoiceButtonState` | voice recording pipeline |
| `useImageAnalysis` | food photo + glucometer OCR calls |
| `useNotifications` | `user_notifications` CRUD, realtime subscription, glucose-pattern alerts |
| `useAdminStatus` | checks admin role via `verify-admin` |
| `useMetricsData`, `useAnalytics`, `usePageTracking`, `useSessionTracking` | admin analytics + product telemetry |
| `usePaymentVerification`, `usePDFExport`, `usePwaInstall`, `use-mobile`, `use-toast` | supporting utilities |

---

## 7. Feature flows

**Logging a reading** — `pages/AddLog.tsx` → `components/LogForm.tsx` (fields in `components/form/*`) → `useLogAPI.addLog` → `glucose_logs`. Photo path: `components/glucose/GlucometerScanModal` → `glucometer-ocr` edge function → prefilled value. Voice path: `services/voiceParsingService` → `parse-voice-input`.

**Assistant** — `pages/Assistant.tsx` → `useAssistant`. Text mode and voice mode share message state. Messages persist to `assistant_conversations` / `assistant_messages`. Speech in: `speech-to-text`. Speech out: `text-to-speech` (returns base64 audio **plus a `mimeType`** — always use the returned MIME type, never assume MP3). Glucose-logging intents are detected before falling through to `glucose-assistant`.

**Food analysis** — `components/food/CameraModal` → `analyze-food-image` → `FoodAnalysisResult` → optionally attached to a log.

**Events** — public `/event/:eventId` page shows details, video section and RSVP. Registered users see **"Show QR Code"** instead of "Register Now". Admin scans at `/admin/events/scan/:eventId` using `html5-qrcode` → `event-checkin`.

**Payments** — `pages/Subscription.tsx` → Stripe checkout (`create-stripe-checkout`) or manual receipt upload → `/payment-success` → `verify-stripe-payment`. Discount codes via `validate-discount-code` / `apply-discount-code`.

**Admin analytics** — `pages/admin/AdminDashboardHome.tsx` composes `OverviewMetricsSection`, `DailyMetricsSection` (with `DayNavigator`), `DailyActiveUsersChart` and `MonthlyActiveUsersChart`, fed by `useMetricsData` / `services/metricsService.ts` and the analytics RPCs.

---

## 8. Conventions

- **Colors come from tokens.** Brand primary is `#208687` (exposed as `--buddy-500`, with `--buddy-600` / `--buddy-700`). Use Tailwind semantic classes and the `buddy-*` scale from `tailwind.config.ts`. Do not hardcode `text-white`, `bg-black` or arbitrary hex values in components.
- **Cards**: `rounded-xl shadow-sm` containers.
- **Mobile-first is mandatory**, including every admin page. Design for ~360px width first, then add `sm:` / `md:` / `lg:`. Admin tables need horizontal scroll or card fallbacks on small screens.
- **Safe areas**: `--safe-area-*` CSS variables exist for iOS PWA insets.
- **Imports** use the `@/` alias for `src/`.
- **Edge functions** are always called with `supabase.functions.invoke('name', { body })` — never `fetch` the URL directly.
- **shadcn components** live in `components/ui/`; prefer composing them over new primitives.
- Toasts: `useToast` (`components/ui/toaster`) and `sonner` are both mounted in `App.tsx`.

---

## 9. Gotchas

- **Realtime channels must have unique names per hook instance.** Two components subscribing to the same channel name causes `cannot add postgres_changes callbacks … after subscribe()` and a blank screen. `useNotifications` appends a per-instance random ID; keep that pattern for any new realtime subscription, and always `supabase.removeChannel(channel)` in the effect cleanup.
- **Timestamps** in assistant messages are epoch **milliseconds** (`number`), converted from the DB `timestamp` column on load.
- **Glucose units**: values are stored in mg/dL; conversion for display lives in `utils/glucoseUtils.ts`. Never convert ad hoc in a component.
- **Date pickers / calendars**: the admin daily-metrics calendar had an off-by-one caused by UTC parsing. Build dates from local components, not `new Date(isoString)` truncation.
- **`integrations/supabase/types.ts` is generated** — never hand-edit it.
- `setTimeout` handles must be typed `ReturnType<typeof setTimeout>` (not `NodeJS.Timeout`), and framer-motion easing strings need `as const`.

---

## 10. Recipes

**Add a user page**
1. Create `src/pages/MyPage.tsx`.
2. Import it in `AppRoutes.tsx` and add `<Route path="/my-page" element={renderProtectedRoute(<MyPage />)} />`.
3. Add a nav entry in `components/Navigation.tsx` if it should be reachable from the tab bar.

**Add an admin page**
1. Create `src/pages/admin/MyAdminPage.tsx`.
2. Route: `<Route path="/admin/my-page" element={<AdminRoute><AdminLayout><MyAdminPage /></AdminLayout></AdminRoute>} />`.
3. Add the sidebar link in `components/admin/AdminSidebar.tsx`. Verify at 360px width.

**Call an edge function**
```ts
const { data, error } = await supabase.functions.invoke('glucose-insights', {
  body: { glucoseHistory, language: 'english', timeRange: 'all' },
});
if (error) throw error;
```

**Query a table**
```ts
const { data, error } = await supabase
  .from('glucose_logs')
  .select('*')
  .eq('user_id', user.id)
  .order('timestamp', { ascending: false });
```
RLS scopes rows to the signed-in user; never add a service-role key to the frontend.

See `supabase/CLAUDE.md` for the backend contract of every function and table.
