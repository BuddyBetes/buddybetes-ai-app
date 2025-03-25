
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
    const { message } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found");
    }

    if (!message || typeof message !== 'string') {
      throw new Error("No valid message provided");
    }

    // System prompt to instruct the model on parsing
    const systemPrompt = `
      You are a specialized parser for a diabetes management app. 
      Your task is to accurately extract glucose readings and food information from user voice inputs.
      
      Extract the following information (if present):
      1. Glucose Level (a number typically between 40 and 500, often followed by 'mg/dL')
      2. Food information (what the user ate)
      3. Meal context (before meal, after meal, or fasting)
      4. Notes or additional information
      
      Return ONLY a JSON object with these keys:
      {
        "isGlucoseLog": boolean, // true if this appears to be a glucose log intent
        "isFoodLog": boolean, // true if this appears to be a food log intent
        "glucoseLevel": number or null,
        "food": string or null,
        "mealContext": "before"|"after"|"fasting" or null,
        "notes": string or null
      }
      
      Examples:
      "My glucose is 120 after eating pizza" → {"isGlucoseLog": true, "isFoodLog": true, "glucoseLevel": 120, "food": "pizza", "mealContext": "after", "notes": null}
      "Log 95 before breakfast" → {"isGlucoseLog": true, "isFoodLog": false, "glucoseLevel": 95, "food": "breakfast", "mealContext": "before", "notes": null}
      "I ate a chicken sandwich for lunch" → {"isGlucoseLog": false, "isFoodLog": true, "glucoseLevel": null, "food": "chicken sandwich", "notes": "for lunch", "mealContext": null}
      "My fasting level is 85" → {"isGlucoseLog": true, "isFoodLog": false, "glucoseLevel": 85, "food": null, "mealContext": "fasting", "notes": null}
    `;

    console.log("Sending request to OpenAI for parsing:", message);

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
          { role: "user", content: message }
        ],
        temperature: 0.1, // Lower temperature for more deterministic parsing
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let parsedResult = data.choices[0].message.content;
    
    console.log("Raw parsed result:", parsedResult);
    
    // Attempt to extract JSON from the response if it's not already valid JSON
    try {
      if (typeof parsedResult === 'string') {
        // Try to extract JSON if wrapped in other text
        const jsonMatch = parsedResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          parsedResult = JSON.parse(parsedResult);
        }
      }
    } catch (e) {
      console.error("Error parsing JSON from OpenAI response:", e);
      // Return a default structure if parsing fails
      parsedResult = {
        isGlucoseLog: false,
        isFoodLog: false,
        glucoseLevel: null,
        food: null,
        mealContext: null,
        notes: null,
        error: "Failed to parse response"
      };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in parse-voice-input function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isGlucoseLog: false,
        isFoodLog: false,
        glucoseLevel: null,
        food: null,
        mealContext: null,
        notes: null
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
