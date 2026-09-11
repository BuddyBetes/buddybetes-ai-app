// Shared Gemini helper for all AI features.
// Uses Google's OpenAI-compatible endpoint for chat/vision so existing
// OpenAI-shaped payloads keep working, and the native endpoints for audio.

export const GEMINI_CHAT_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
export const GEMINI_NATIVE_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";

export function getGeminiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) {
    throw new Error("Gemini API key is not configured");
  }
  return key;
}

export class GeminiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "GeminiError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempts = 3,
): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(url, init);

      if (response.ok) return response;

      const body = await response.text();

      // 429 / 5xx are transient - retry with backoff.
      if (response.status === 429 || response.status >= 500) {
        lastError = new GeminiError(response.status, body);
        if (attempt < attempts - 1) {
          await sleep(800 * Math.pow(2, attempt));
          continue;
        }
      }

      throw new GeminiError(response.status, body);
    } catch (error) {
      if (error instanceof GeminiError && error.status < 500 && error.status !== 429) {
        throw error;
      }
      lastError = error;
      if (attempt < attempts - 1) {
        await sleep(800 * Math.pow(2, attempt));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed");
}

export interface GeminiChatOptions {
  messages: Array<Record<string, unknown>>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Chat / vision completion through Gemini's OpenAI-compatible endpoint.
 * Returns the assistant message text.
 */
export async function geminiChat(options: GeminiChatOptions): Promise<string> {
  const apiKey = getGeminiKey();
  const body: Record<string, unknown> = {
    model: options.model || DEFAULT_GEMINI_MODEL,
    messages: options.messages,
  };

  if (typeof options.temperature === "number") body.temperature = options.temperature;
  if (typeof options.maxTokens === "number") body.max_tokens = options.maxTokens;
  if (options.jsonMode) body.response_format = { type: "json_object" };

  const response = await fetchWithRetry(GEMINI_CHAT_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    console.error("Unexpected Gemini response:", JSON.stringify(data));
    throw new Error("Empty response from Gemini");
  }

  return content;
}

/**
 * Native generateContent call (used for audio input / audio output).
 */
export async function geminiGenerateContent(
  model: string,
  payload: Record<string, unknown>,
): Promise<any> {
  const apiKey = getGeminiKey();
  const response = await fetchWithRetry(
    `${GEMINI_NATIVE_BASE}/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return await response.json();
}

/** Turn a friendly gateway/provider failure into a user-facing message. */
export function describeGeminiError(error: unknown): string {
  if (error instanceof GeminiError) {
    if (error.status === 429) {
      return "AI is busy right now. Please try again in a moment.";
    }
    if (error.status === 401 || error.status === 403) {
      return "AI is temporarily unavailable (key or permission problem).";
    }
    return `AI request failed (${error.status}).`;
  }
  return error instanceof Error ? error.message : "AI request failed.";
}

/** Wrap raw 16-bit PCM audio in a WAV container. */
export function pcmToWav(pcm: Uint8Array, sampleRate = 24000, channels = 1): Uint8Array {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeString(36, "data");
  view.setUint32(40, pcm.length, true);

  const out = new Uint8Array(buffer);
  out.set(pcm, 44);
  return out;
}

/** Base64-encode bytes in chunks (avoids stack overflow on large buffers). */
export function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 32768;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(
      String.fromCharCode.apply(
        null,
        Array.from(bytes.subarray(i, Math.min(i + chunkSize, bytes.length))) as unknown as number[],
      ),
    );
  }
  return btoa(chunks.join(""));
}

/** Decode base64 into bytes in chunks. */
export function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.includes(",") && base64.startsWith("data:")
    ? base64.split(",")[1]
    : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
