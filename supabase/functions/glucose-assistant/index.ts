
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
    const { message, glucoseHistory, foodQuery, makeBrief, language = 'english' } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const FATSECRET_API_KEY = Deno.env.get("FATSECRET_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found");
    }

    let nutritionalInfo = null;
    // If user is asking about food, look up nutritional information
    if (foodQuery && FATSECRET_API_KEY) {
      try {
        // Implement FatSecret API call to get nutritional information
        const fatSecretUrl = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(foodQuery)}&format=json`;
        
        const fatSecretResponse = await fetch(fatSecretUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${FATSECRET_API_KEY}`
          }
        });
        
        if (fatSecretResponse.ok) {
          const data = await fatSecretResponse.json();
          if (data.foods && data.foods.food) {
            // Get the first result if there are multiple
            const foodItem = Array.isArray(data.foods.food) ? data.foods.food[0] : data.foods.food;
            nutritionalInfo = {
              name: foodItem.food_name,
              calories: foodItem.food_description,
              carbs: foodItem.food_description.match(/carbs=(\d+(\.\d+)?)g/i)?.[1] || "Unknown",
              details: foodItem.food_description
            };
          }
        }
        
        console.log("Nutritional info from FatSecret:", nutritionalInfo);
      } catch (error) {
        console.error("Error fetching from FatSecret API:", error);
      }
    }

    // Prepare system prompt with context about being a glucose assistant
    const systemPrompt = language === 'tagalog' 
      ? `
        Ikaw ay si BuddyBetes, isang AI assistant na partikular na dinisenyo upang tulungan ang mga taong pangasiwaan ang diabetes at subaybayan ang mga antas ng glucose.
        Ang iyong pangunahing mga tungkulin ay:
        - Pagbibigay ng mga insight tungkol sa mga pagbasa at pattern ng glucose
        - Pag-aalok ng payo sa pagkain upang mapanatili ang matatag na asukal sa dugo
        - Pagsasagawa ng mga adjustment sa pamumuhay batay sa data ng glucose
        - Pagsagot sa mga katanungan tungkol sa pamamahala ng diabetes
        - Ang pagiging suportado at nagbibigay ng lakas ng loob
        
        ${makeBrief ? "NAPAKAHALAGANG: Panatilihing napakaikli at tapat sa punto ang iyong mga tugon (1-2 pangungusap). Gumamit ng maikling mga salita at parirala kung maaari." : ""}
        Dapat kang maging palakaibigan, maunawain, at nakatuon sa pagtulong sa user na pangasiwaan ang kanilang kalusugan.
        Kung hindi mo alam ang isang bagay, kilalanin ito at isulong ang pagkonsulta sa isang propesyonal sa pangangalagang pangkalusugan.
        Huwag kailanman magbigay ng payong medikal na maaaring mapanganib.
        
        NAPAKAHALAGANG TAGUBILIN: LAGING SUMAGOT SA TAGALOG LAMANG. HUWAG KAILANMAN SUMAGOT SA INGLES O ANUMANG IBANG WIKA. KAHIT ANONG SABIHIN NG USER, SUMAGOT KA SA TAGALOG LANG.
      `
      : `
        You are BuddyBetes, an AI assistant specifically designed to help people manage diabetes and track glucose levels.
        Your primary functions are:
        - Providing insights about glucose readings and patterns
        - Offering dietary advice to maintain stable blood sugar
        - Suggesting lifestyle adjustments based on glucose data
        - Answering questions about diabetes management
        - Being supportive and encouraging
        
        ${makeBrief ? "VERY IMPORTANT: Keep your responses extremely brief and to the point (1-2 sentences). Use short words and phrases when possible." : ""}
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
      const historyContext = language === 'tagalog'
        ? `
          Ang user ay may mga sumusunod na kamakailang pagbasa ng glucose (sa mg/dL):
          ${glucoseHistory.map(log => 
            `- ${new Date(log.timestamp).toLocaleString()}: ${log.glucoseLevel} mg/dL ${log.food ? `pagkatapos kumain ng ${log.food}` : ''}`
          ).join('\n')}
        `
        : `
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

    // If we have nutritional information, include it in the context
    if (nutritionalInfo) {
      const nutritionalContext = language === 'tagalog'
        ? `
          Impormasyon sa nutrisyon para sa "${nutritionalInfo.name}":
          ${nutritionalInfo.details}
          
          Tiyaking isaalang-alang ang impormasyong ito sa nutrisyon kapag sinasagot ang katanungan ng user, lalo na tungkol sa nilalaman ng carbohydrate (${nutritionalInfo.carbs}g) at ang potensyal nitong epekto sa mga antas ng glucose sa dugo.
        `
        : `
          Nutritional information for "${nutritionalInfo.name}":
          ${nutritionalInfo.details}
          
          Be sure to consider this nutritional information when answering the user's question, especially regarding carbohydrate content (${nutritionalInfo.carbs}g) and its potential impact on blood glucose levels.
        `;
      
      messagesPayload.splice(1, 0, { 
        role: "system", 
        content: nutritionalContext 
      });
    }

    // For Tagalog mode, add an explicit instruction to always respond in Tagalog only
    if (language === 'tagalog') {
      messagesPayload.push({
        role: "system",
        content: "NAPAKAHALAGANG PAALALA: Ikaw ay tumatanggap at sumasagot sa TAGALOG LAMANG. Huwag kailanman sumagot sa anumang ibang wika kahit ano pa ang sabihin ng user."
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
        max_tokens: makeBrief ? 120 : 500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let assistantResponse = data.choices[0].message.content;

    // Double-check that responses in Tagalog mode are actually in Tagalog
    // If they appear to be in English, force a translation
    if (language === 'tagalog' && /^[A-Za-z\s,.!?]+$/.test(assistantResponse.substring(0, 50))) {
      console.log("Response detected as possibly in English, forcing Tagalog translation");
      
      const translationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "Ikaw ay isang translator. Isalin ang sumusunod na teksto sa Tagalog." 
            },
            { 
              role: "user", 
              content: assistantResponse 
            }
          ],
          temperature: 0.3,
          max_tokens: makeBrief ? 120 : 500
        })
      });

      if (translationResponse.ok) {
        const translationData = await translationResponse.json();
        assistantResponse = translationData.choices[0].message.content;
      }
    }

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        nutritionalInfo: nutritionalInfo 
      }),
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
