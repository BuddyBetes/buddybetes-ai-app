# Switch all AI features from OpenAI to your Gemini key

Your OpenAI account is out of credits, so every AI feature currently errors out. This moves all seven of them onto your own Gemini key instead.

## Features being switched

1. Voice/chat assistant replies
2. Voice command parsing ("log 120 after dinner")
3. Dashboard glucose insights
4. Food photo analysis (the nutrition lookup via FatSecret stays exactly as it is)
5. Glucometer photo reading
6. Speech-to-text (turning your voice into text)
7. Text-to-speech (the spoken replies)

Nothing changes visually — same buttons, same screens, same results. Only the service behind them changes.

## How it will work

- You'll be asked to paste your Gemini key into a secure form; it is stored encrypted and only used by the server side of the app, never exposed in the browser.
- Each of the seven features is called for real after the switch and the answer checked before it counts as done.
- The old OpenAI key stays saved but unused, so nothing is lost if you ever top it up.

## One thing to know about the spoken voice

The spoken replies currently use an OpenAI voice ("nova"). Gemini has its own set of voices, so the assistant will sound different after the switch. I'll pick the closest warm, natural-sounding female voice and you can tell me if you'd like a different one.

## Technical notes

- New secret: `GEMINI_API_KEY`. Edge functions updated: `glucose-assistant`, `glucose-insights`, `parse-voice-input`, `analyze-food-image` (vision step only), `glucometer-ocr`, `speech-to-text`, `text-to-speech`.
- Text + vision calls go to the Gemini API (`generativelanguage.googleapis.com`) using `gemini-2.5-flash`, with images passed as `inline_data` base64 parts. JSON-returning functions (voice parsing, insights, food detection) use `responseMimeType: application/json` with a response schema so the existing parsers keep working unchanged.
- Speech-to-text uses Gemini's native audio understanding: the recorded audio is sent as an `inline_data` part with its detected MIME type plus a transcribe-only prompt; response contract stays `{ text }`, so no frontend change.
- Text-to-speech uses `gemini-2.5-flash-preview-tts`, which returns raw PCM. The function wraps it in a WAV header and returns base64 audio under the existing `audioContent` key. If the browser audio player has trouble with WAV, it falls back to a client-side playable format — verified by actually playing a generated clip in the test pass.
- Error handling: 429/5xx retried with backoff, quota/permission errors surfaced in the UI as a clear "AI temporarily unavailable" message instead of a silent failure.
- A shared `_shared/gemini.ts` helper holds the request builders so all seven functions use one consistent call path.
