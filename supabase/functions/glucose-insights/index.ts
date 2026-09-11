
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { InsightRequest, InsightResponse, GlucoseLog } from './types.ts';
import { analyzeMealImpact, analyzeExerciseImpact, analyzeTimePatterns } from './analyzers.ts';
import { calculateGlucoseStats, filterGlucoseHistory } from './stats.ts';
import { createSystemPrompt, createUserPrompt } from './prompts.ts';
import { parseInsightsResponse } from './parser.ts';
import { geminiChat } from '../_shared/gemini.ts';

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
    const { glucoseHistory, language = 'english', timeRange = 'all' }: InsightRequest = await req.json();



    // Filter glucose data based on time range if specified
    const filteredHistory = filterGlucoseHistory(glucoseHistory, timeRange);

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
    const stats = calculateGlucoseStats(filteredHistory);

    // Analyze meal patterns
    const mealsWithGlucose = filteredHistory.filter(log => log.food && log.food.trim().length > 0);
    const exerciseEntries = filteredHistory.filter(log => log.notes && log.notes.toLowerCase().includes('exercise'));
    
    // Calculate impact analyses
    const mealAnalysis = analyzeMealImpact(mealsWithGlucose);
    const exerciseAnalysis = analyzeExerciseImpact(filteredHistory);
    const timePatterns = analyzeTimePatterns(filteredHistory);

    // Prepare system and user prompts
    const systemPrompt = createSystemPrompt(language, stats, mealsWithGlucose.length, exerciseEntries.length);

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

    const userPrompt = createUserPrompt(language, formattedData, contextualAnalysis);

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
    
    // Parse the AI response into clean insights
    const insights = parseInsightsResponse(aiResponse);

    // Include enhanced statistics in the response
    const responseData: InsightResponse = {
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
    };

    return new Response(
      JSON.stringify(responseData),
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
