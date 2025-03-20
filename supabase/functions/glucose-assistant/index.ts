
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
    const { message, glucoseHistory } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found");
    }

    // Prepare system prompt with context about being a glucose assistant
    const systemPrompt = `
      You are Glucose Buddy, an AI assistant specifically designed to help people manage diabetes and track glucose levels.
      Your primary functions are:
      - Providing insights about glucose readings and patterns
      - Offering dietary advice to maintain stable blood sugar
      - Suggesting lifestyle adjustments based on glucose data
      - Answering questions about diabetes management
      - Being supportive and encouraging
      
      You should be friendly, empathetic, and focused on helping the user manage their health.
      If you don't know something, acknowledge it and suggest consulting a healthcare professional.
      Never provide medical advice that could be harmful.
    `;

    let messagesPayload = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    // If we have glucose history data, include it in the context
    if (glucoseHistory && glucoseHistory.length > 0) {
      const historyContext = `
        The user has the following recent glucose readings (in mg/dL):
        ${glucoseHistory.map(log => 
          `- ${new Date(log.timestamp).toLocaleString()}: ${log.glucoseLevel} mg/dL ${log.food ? `after eating ${log.food}` : ''}`
        ).join('\n')}
      `;
      
      messagesPayload.splice(1, 0, { 
        role: "system", 
        content: historyContext 
      });
    }

    console.log("Sending request to OpenAI with payload:", JSON.stringify(messagesPayload));

    // Make request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in glucose-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
