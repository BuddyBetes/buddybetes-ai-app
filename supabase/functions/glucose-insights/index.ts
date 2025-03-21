
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { glucoseHistory } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found");
    }

    if (!glucoseHistory || !Array.isArray(glucoseHistory) || glucoseHistory.length === 0) {
      return new Response(
        JSON.stringify({ 
          insights: [
            "Not enough glucose data to generate insights. Please log more readings.",
            "Regular glucose tracking helps identify patterns. Try logging after meals and exercise."
          ]
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Prepare system prompt for OpenAI
    const systemPrompt = `
      You are an AI assistant specializing in diabetes management. 
      Analyze the provided glucose readings and generate 2-3 insightful observations or recommendations.
      Keep each insight short (25 words or less) and action-oriented.
      Focus on patterns, potential concerns, and positive reinforcement.
      Do not mention "based on your data" or similar phrases - be direct.
      DO NOT use technical jargon - keep language accessible.

      Examples:
      - "Your glucose has been stable in the morning. Continue your current breakfast routine."
      - "Consider a small protein snack before bed to prevent overnight drops."
      - "Regular physical activity may help reduce your afternoon glucose spikes."
    `;

    // Format glucose history for the AI
    const formattedData = glucoseHistory.map(log => 
      `${new Date(log.timestamp).toLocaleString()}: ${log.glucoseLevel} mg/dL ${log.food ? `after eating ${log.food}` : ''}`
    ).join('\n');

    const userPrompt = `
      Here are recent glucose readings (in mg/dL):
      ${formattedData}

      Please provide 2-3 short, practical insights or recommendations based on this data.
    `;

    console.log("Sending request to OpenAI with glucose history");

    // Make request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the AI response into separate insights
    const insights = aiResponse
      .split(/\n+/)
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);

    return new Response(
      JSON.stringify({ insights }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in glucose-insights function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        insights: [
          "Unable to generate insights at this time.",
          "Check your connections and try again later."
        ] 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
