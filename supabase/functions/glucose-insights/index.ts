
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

    // Analyze meal patterns
    const mealsWithGlucose = filteredHistory.filter(log => log.food && log.food.trim().length > 0);
    const exerciseEntries = filteredHistory.filter(log => log.notes && log.notes.toLowerCase().includes('exercise'));
    
    // Calculate meal impact analysis
    const mealAnalysis = analyzeMealImpact(mealsWithGlucose);
    const exerciseAnalysis = analyzeExerciseImpact(filteredHistory);
    const timePatterns = analyzeTimePatterns(filteredHistory);

    // Prepare enhanced system prompt for OpenAI based on language preference
    const systemPrompt = language === 'tagalog'
      ? `
        Ikaw ay isang AI assistant na nagspecialize sa pamamahala ng diabetes.
        Suriin ang mga ibinigay na pagbasa ng glucose kasama ang konteksto ng pagkain at ehersisyo upang bumuo ng 3-4 tiyak at aksyunableng mga rekomendasyon.
        Panatilihing maikli ang bawat insight (30 salita o mas mababa) at nakatuon sa aksyon.
        Mag-focus sa mga pattern, meal impact, timing, at mga tiyak na rekomendasyon.
        HUWAG banggitin ang "batay sa iyong data" - maging direkta.
        GUMAMIT LAMANG NG TAGALOG.

        Mga kategorya ng insights na dapat isama:
        - Diet/Pagkain: Tukuyin ang mga pagkaing nagiging dahilan ng mataas na glucose
        - Timing: Mga pattern ayon sa oras ng araw
        - Exercise: Epekto ng pisikal na aktibidad
        - General: Pangkalahatang mga payo

        Mga Estadistika:
        - Bilang ng mga pagbasa: ${stats.count}
        - Karaniwang antas ng glucose: ${stats.average} mg/dL
        - Pinakamababang pagbasa: ${stats.min} mg/dL
        - Pinakamataas na pagbasa: ${stats.max} mg/dL
        - Porsyento sa loob ng target range (70-140 mg/dL): ${stats.inRangePercent}%
        - Mga log na may pagkain: ${mealsWithGlucose.length}
        - Mga log na may ehersisyo: ${exerciseEntries.length}
      `
      : `
        You are an AI assistant specializing in diabetes management. 
        Analyze the provided glucose readings along with meal and exercise context to generate 3-4 specific and actionable recommendations.
        Keep each insight short (30 words or less) and action-oriented.
        Focus on patterns, meal impact, timing, and specific recommendations.
        DO NOT mention "based on your data" - be direct.
        DO NOT use technical jargon - keep language accessible.

        Categories of insights to include:
        - Diet: Identify foods that cause glucose spikes
        - Timing: Patterns by time of day
        - Exercise: Impact of physical activity
        - General: Overall recommendations

        Statistics:
        - Number of readings: ${stats.count}
        - Average glucose level: ${stats.average} mg/dL
        - Lowest reading: ${stats.min} mg/dL
        - Highest reading: ${stats.max} mg/dL
        - Percentage in target range (70-140 mg/dL): ${stats.inRangePercent}%
        - Logs with meals: ${mealsWithGlucose.length}
        - Logs with exercise: ${exerciseEntries.length}
      `;

    // Format glucose history with enhanced context for the AI
    const formattedData = filteredHistory.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      const glucose = `${log.glucoseLevel} mg/dL`;
      const meal = log.food ? ` after eating ${log.food}` : '';
      const context = log.mealContext ? ` (${log.mealContext})` : '';
      const notes = log.notes ? ` - ${log.notes}` : '';
      return `${timestamp}: ${glucose}${meal}${context}${notes}`;
    }).join('\n');

    const contextualAnalysis = `
    Meal Impact Analysis: ${mealAnalysis}
    Exercise Impact: ${exerciseAnalysis}  
    Time Patterns: ${timePatterns}
    `;

    const userPrompt = language === 'tagalog'
      ? `
        Narito ang mga kamakailang pagbasa ng glucose (sa mg/dL):
        ${formattedData}

        Kontekstual na pagsusuri:
        ${contextualAnalysis}

        Mangyaring magbigay ng 3-4 tiyak, praktikal na mga insight o rekomendasyon batay sa data na ito. 
        Isama ang mga kategorya: Diet, Timing, Exercise, at General recommendations. GUMAMIT LAMANG NG TAGALOG.
      `
      : `
        Here are recent glucose readings (in mg/dL):
        ${formattedData}

        Contextual Analysis:
        ${contextualAnalysis}

        Please provide 3-4 specific, practical insights or recommendations based on this data.
        Include categories: Diet, Timing, Exercise, and General recommendations.
      `;

    console.log(`Sending enhanced request to OpenAI with glucose history in ${language}`);

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
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the AI response into separate insights with categories
    const insights = aiResponse
      .split(/\n+/)
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);

    // Include enhanced statistics in the response
    return new Response(
      JSON.stringify({ 
        insights,
        stats: {
          average: stats.average,
          min: stats.min,
          max: stats.max,
          inRangePercent: stats.inRangePercent,
          totalReadings: stats.count,
          mealsLogged: mealsWithGlucose.length,
          exerciseEntries: exerciseEntries.length
        },
        analysis: {
          mealImpact: mealAnalysis,
          exerciseImpact: exerciseAnalysis,
          timePatterns: timePatterns
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

// Helper function to analyze meal impact
function analyzeMealImpact(mealsWithGlucose: any[]) {
  if (mealsWithGlucose.length === 0) return "No meal data available for analysis";
  
  const highGlucoseMeals = mealsWithGlucose.filter(log => log.glucoseLevel > 140);
  const mealTypes = mealsWithGlucose.reduce((acc, log) => {
    const food = log.food.toLowerCase();
    if (food.includes('rice') || food.includes('bread') || food.includes('pasta')) {
      acc.carbs++;
    }
    if (food.includes('sweet') || food.includes('dessert') || food.includes('cake')) {
      acc.sweets++;
    }
    return acc;
  }, { carbs: 0, sweets: 0 });

  return `${highGlucoseMeals.length}/${mealsWithGlucose.length} meals caused glucose >140mg/dL. Carb-heavy meals: ${mealTypes.carbs}, Sweet foods: ${mealTypes.sweets}`;
}

// Helper function to analyze exercise impact
function analyzeExerciseImpact(logs: any[]) {
  const exerciseLogs = logs.filter(log => 
    log.notes && (
      log.notes.toLowerCase().includes('exercise') ||
      log.notes.toLowerCase().includes('walk') ||
      log.notes.toLowerCase().includes('gym') ||
      log.notes.toLowerCase().includes('run')
    )
  );
  
  if (exerciseLogs.length === 0) return "No exercise data logged";
  
  const avgGlucoseAfterExercise = exerciseLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / exerciseLogs.length;
  return `${exerciseLogs.length} exercise entries logged. Average glucose after exercise: ${Math.round(avgGlucoseAfterExercise)}mg/dL`;
}

// Helper function to analyze time patterns
function analyzeTimePatterns(logs: any[]) {
  const morningLogs = logs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 6 && hour < 12;
  });
  
  const afternoonLogs = logs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 12 && hour < 18;
  });
  
  const eveningLogs = logs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 18 || hour < 6;
  });

  const morningAvg = morningLogs.length > 0 ? Math.round(morningLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / morningLogs.length) : 0;
  const afternoonAvg = afternoonLogs.length > 0 ? Math.round(afternoonLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / afternoonLogs.length) : 0;
  const eveningAvg = eveningLogs.length > 0 ? Math.round(eveningLogs.reduce((sum, log) => sum + log.glucoseLevel, 0) / eveningLogs.length) : 0;

  return `Morning avg: ${morningAvg}mg/dL (${morningLogs.length} readings), Afternoon avg: ${afternoonAvg}mg/dL (${afternoonLogs.length} readings), Evening avg: ${eveningAvg}mg/dL (${eveningLogs.length} readings)`;
}
