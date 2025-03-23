
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

/**
 * Analyzes an image and identifies food items using OpenAI's vision model
 * @param base64Image - Base64 encoded image data
 * @returns Array of detected food items
 */
export async function analyzeFoodImage(base64Image: string): Promise<string[]> {
  try {
    console.log('Sending image to OpenAI, base64 length:', base64Image.length);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a food recognition expert. Your task is to identify ALL food items visible in the image. Return ONLY a JSON array of food item names (strings), with no additional text or explanations. Example output format: ["grilled chicken", "brown rice", "broccoli"]. If no food is visible or you cannot identify any food with confidence, return an empty array [].'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What food items are in this image?' },
              { 
                type: 'image_url', 
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    console.log('Raw OpenAI response:', data.choices[0].message.content);
    
    try {
      const content = data.choices[0].message.content;
      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      // Check if it's an array or an object with a foods array
      const foods = Array.isArray(parsedContent) ? parsedContent : parsedContent.foods || [];
      
      console.log('Parsed foods:', foods);
      
      // Ensure we have at least one food item
      if (foods.length === 0) {
        console.log('No foods found in the parsed response');
      }
      
      return foods;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback: Try to extract food items using regex if JSON parsing fails
      const content = data.choices[0].message.content;
      const matches = content.match(/"([^"]+)"/g);
      const extracted = matches ? matches.map(m => m.replace(/"/g, '')) : [];
      console.log('Extracted via regex fallback:', extracted);
      return extracted;
    }
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    return [];
  }
}
