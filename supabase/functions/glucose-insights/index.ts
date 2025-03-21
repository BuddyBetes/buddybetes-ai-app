
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
    const { glucoseHistory, language = 'english', timeRange = 'all' } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found");
    }

    // Filter glucose data based on time range if specified
    let filteredHistory = [...glucoseHistory];
    if (timeRange !== 'all' && glucoseHistory.length > 0) {
      const now = new Date();
      let cutoffHours = 24;
      
      if (timeRange === '7d') cutoffHours = 168; // 7 days
      else if (timeRange === '30d') cutoffHours = 720; // 30 days
      
      const cutoffTime = new Date(now.getTime() - cutoffHours * 60 * 60 * 1000);
      filteredHistory = glucoseHistory.filter(log => new Date(log.timestamp) > cutoffTime);
    }

    if (!filteredHistory || !Array.isArray(filteredHistory) || filteredHistory.length === 0) {
      return new Response(
        JSON.stringify({ 
          insights: language === 'tagalog' 
            ? [
                "Hindi sapat ang datos ng glucose upang makabuo ng mga insight. Mangyaring mag-log ng mas maraming pagbasa.",
                "Ang regular na pag-track ng glucose ay tumutulong na matukoy ang mga pattern. Subukang mag-log pagkatapos kumain at mag-ehersisyo."
              ]
            : [
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

    // Calculate basic stats
    const glucoseValues = filteredHistory
      .map(log => log.glucoseLevel)
      .filter(value => value !== undefined && value !== null) as number[];
    
    const stats = {
      count: glucoseValues.length,
      average: Math.round(glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length),
      min: Math.min(...glucoseValues),
      max: Math.max(...glucoseValues),
      inRange: glucoseValues.filter(val => val >= 70 && val <= 140).length,
      inRangePercent: Math.round((glucoseValues.filter(val => val >= 70 && val <= 140).length / glucoseValues.length) * 100)
    };

    // Prepare system prompt for OpenAI based on language preference
    const systemPrompt = language === 'tagalog'
      ? `
        Ikaw ay isang AI assistant na nagspecialize sa pamamahala ng diabetes.
        Suriin ang mga ibinigay na pagbasa ng glucose at bumuo ng 2-3 kapaki-pakinabang na obserbasyon o rekomendasyon.
        Panatilihing maikli ang bawat insight (25 salita o mas mababa) at nakatuon sa aksyon.
        Tumuon sa mga pattern, potensyal na mga alalahanin, at positibong pagpapalakas.
        HUWAG banggitin ang "batay sa iyong data" o mga katulad na parirala - maging direkta.
        HUWAG gumamit ng teknikal na jargon - panatilihing accessible ang wika.
        GUMAMIT LAMANG NG TAGALOG.

        Mga Estadistika:
        - Bilang ng mga pagbasa: ${stats.count}
        - Karaniwang antas ng glucose: ${stats.average} mg/dL
        - Pinakamababang pagbasa: ${stats.min} mg/dL
        - Pinakamataas na pagbasa: ${stats.max} mg/dL
        - Porsyento sa loob ng target range (70-140 mg/dL): ${stats.inRangePercent}%

        Mga halimbawa:
        - "Matatag ang iyong glucose sa umaga. Ipagpatuloy ang iyong kasalukuyang routine sa almusal."
        - "Isaalang-alang ang maliit na meryenda na may protina bago matulog upang maiwasan ang pagbaba sa gabi."
        - "Ang regular na pisikal na aktibidad ay maaaring makatulong na mabawasan ang iyong mga spike ng glucose sa hapon."
      `
      : `
        You are an AI assistant specializing in diabetes management. 
        Analyze the provided glucose readings and generate 2-3 insightful observations or recommendations.
        Keep each insight short (25 words or less) and action-oriented.
        Focus on patterns, potential concerns, and positive reinforcement.
        Do not mention "based on your data" or similar phrases - be direct.
        DO NOT use technical jargon - keep language accessible.

        Statistics:
        - Number of readings: ${stats.count}
        - Average glucose level: ${stats.average} mg/dL
        - Lowest reading: ${stats.min} mg/dL
        - Highest reading: ${stats.max} mg/dL
        - Percentage in target range (70-140 mg/dL): ${stats.inRangePercent}%

        Examples:
        - "Your glucose has been stable in the morning. Continue your current breakfast routine."
        - "Consider a small protein snack before bed to prevent overnight drops."
        - "Regular physical activity may help reduce your afternoon glucose spikes."
      `;

    // Format glucose history for the AI
    const formattedData = filteredHistory.map(log => 
      `${new Date(log.timestamp).toLocaleString()}: ${log.glucoseLevel} mg/dL ${log.food ? `after eating ${log.food}` : ''}`
    ).join('\n');

    const userPrompt = language === 'tagalog'
      ? `
        Narito ang mga kamakailang pagbasa ng glucose (sa mg/dL):
        ${formattedData}

        Mangyaring magbigay ng 2-3 maikling, praktikal na mga insight o rekomendasyon batay sa data na ito. GUMAMIT LAMANG NG TAGALOG.
      `
      : `
        Here are recent glucose readings (in mg/dL):
        ${formattedData}

        Please provide 2-3 short, practical insights or recommendations based on this data.
      `;

    console.log(`Sending request to OpenAI with glucose history in ${language}`);

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

    // Include the statistics in the response
    return new Response(
      JSON.stringify({ 
        insights,
        stats: {
          average: stats.average,
          min: stats.min,
          max: stats.max,
          inRangePercent: stats.inRangePercent
        }
      }),
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
