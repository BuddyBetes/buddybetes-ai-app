
export function parseInsightsResponse(aiResponse: string): string[] {
  return aiResponse
    .split(/\n+/)
    .filter(line => line.trim().length > 0)
    .map(line => {
      // Remove common markdown and formatting
      return line
        .replace(/^[-*]\s*/, '') // Remove bullet points
        .replace(/^\d+\.\s*/, '') // Remove numbered lists (1., 2., etc.)
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
        .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
        .replace(/^#+\s*/, '') // Remove heading markers
        .replace(/`(.*?)`/g, '$1') // Remove code formatting
        .replace(/\[(.*?)\]/g, '$1') // Remove square brackets
        .trim();
    })
    .filter(line => {
      // Filter out lines that are mostly numbers, stats, or very short
      return line.length > 10 && 
             !line.match(/^\d+%?\s*$/) && // Pure numbers/percentages
             !line.match(/^\d+\s*(mg\/dL|readings?|logs?)\s*$/i) && // Stats patterns
             !line.match(/^(average|min|max|total):\s*\d+/i); // Stat labels
    });
}
