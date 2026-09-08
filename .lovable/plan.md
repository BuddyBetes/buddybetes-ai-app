# Restore AI features + full app test

## What the tests found

Working now:
- Database is back online: 641 accounts (550 email-confirmed), 624 profiles, 2,289 glucose logs, 3 events, 84 event registrations.
- Email sending is healthy: the most recent 237 confirmation and 100 password-reset emails all sent successfully. The only failures are old ones from before the domain was verified.

Broken now:
- The OpenAI key is still valid, but the OpenAI account has no credits left. Every AI feature fails ("no credits remaining" / error 429): voice assistant, spoken replies, speech-to-text, food photo analysis, glucometer photo reading, and dashboard glucose insights.

## Fix: move AI off OpenAI billing

All AI features move to the built-in Lovable AI, which is paid from your Lovable credits instead of a separate OpenAI account. No new API key to buy or manage. Note: Grok is not offered there; the supported models cover everything the app needs today.

Features being switched over:
1. Voice/chat assistant replies
2. Voice command parsing ("log 120 after dinner")
3. Dashboard glucose insights
4. Food photo analysis (nutrition lookup via FatSecret stays unchanged)
5. Glucometer photo reading
6. Speech-to-text (voice input)
7. Text-to-speech (spoken replies)

Each one is called for real after the switch and the response checked before it is considered done. If the OpenAI key is ever topped up again, nothing breaks — the app simply no longer depends on it.

## Then: full walkthrough test

Driven in a real browser against the live app, reporting anything broken with screenshots:
- Sign up -> confirmation email -> sign in -> onboarding "Complete Setup"
- Password reset request
- Add a glucose reading, view logs, filter, dashboard charts and insights
- Voice assistant: speak, parse, log, spoken reply
- Food photo and glucometer photo capture
- Events page: RSVP, "Show QR Code" for already-registered users
- Admin dashboard: metrics cards, daily/monthly active charts, calendar date picker, event creation, email campaigns and email health, mobile layout

Anything found that is a small, clear defect gets fixed in the same pass; anything larger is reported back with a recommendation.

## Technical notes

- Enable the Lovable AI Gateway and ensure `LOVABLE_API_KEY` exists.
- Edge functions to update: `glucose-assistant`, `glucose-insights`, `parse-voice-input`, `analyze-food-image` (vision step), `glucometer-ocr`, `speech-to-text`, `text-to-speech`.
- Chat/vision calls use `openai/gpt-6-astra` via the gateway Responses API at `https://ai.gateway.lovable.dev`, authenticated with the `Lovable-API-Key` header; `temperature`/`max_tokens` are dropped in favour of prompt-stated limits, and reasoning effort is set to `low`.
- Speech-to-text and text-to-speech move to the gateway's audio endpoints, keeping the existing request/response contract (base64 audio in, base64 mp3 out) so no frontend changes are needed.
- Gateway errors are surfaced properly: 402/403 show a clear "AI temporarily unavailable" message in the UI, 429/5xx retry with backoff.
- Existing OpenAI secrets are left in place, unused, as a rollback path.
