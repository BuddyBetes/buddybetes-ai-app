import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  geminiGenerateContent,
  GEMINI_TTS_MODEL,
  base64ToBytes,
  bytesToBase64,
  pcmToWav,
  describeGeminiError,
} from "../_shared/gemini.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map the previously used OpenAI voice names onto Gemini prebuilt voices so
// existing callers keep working without any frontend change.
const VOICE_MAP: Record<string, string> = {
  nova: 'Leda',
  shimmer: 'Aoede',
  alloy: 'Kore',
  echo: 'Puck',
  fable: 'Charon',
  onyx: 'Charon',
};

const DEFAULT_VOICE = 'Leda';

/** Pull the sample rate out of an audio/L16 mime type such as "audio/L16;rate=24000". */
function parseSampleRate(mimeType: string | undefined): number {
  const match = mimeType?.match(/rate=(\d+)/i);
  return match ? parseInt(match[1], 10) : 24000;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    // Limit text length to prevent potential issues
    const truncatedText = String(text).substring(0, 1000);
    console.log("Processing text-to-speech request with text length:", truncatedText.length);

    const selectedVoice = VOICE_MAP[String(voice || '').toLowerCase()] || voice || DEFAULT_VOICE;
    console.log(`Using Gemini voice: ${selectedVoice}`);

    const result = await geminiGenerateContent(GEMINI_TTS_MODEL, {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Say in a warm, friendly and natural tone: ${truncatedText}` }],
        },
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const part = result?.candidates?.[0]?.content?.parts?.find(
      (p: any) => p?.inlineData?.data || p?.inline_data?.data
    );
    const inline = part?.inlineData || part?.inline_data;

    if (!inline?.data) {
      console.error("No audio returned from Gemini:", JSON.stringify(result).slice(0, 800));
      throw new Error('No audio was generated');
    }

    const pcm = base64ToBytes(inline.data);
    const sampleRate = parseSampleRate(inline.mimeType || inline.mime_type);
    const wav = pcmToWav(pcm, sampleRate, 1);
    const base64Audio = bytesToBase64(wav);

    console.log("Speech generation successful, audio bytes:", wav.length);

    return new Response(
      JSON.stringify({ audioContent: base64Audio, mimeType: 'audio/wav' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(
      JSON.stringify({ error: describeGeminiError(error) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
