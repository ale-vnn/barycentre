// Scoring and calculation utilities

import { calculateBarRoutes } from './routing.js';
import { loadRoutingGrid } from './grid-routing.js';

export function calculateCenter(participants) {
  const totalLat = participants.reduce((sum, p) => sum + p.lat, 0);
  const totalLng = participants.reduce((sum, p) => sum + p.lng, 0);
  return {
    lat: totalLat / participants.length,
    lng: totalLng / participants.length
  };
}

export async function calculateBarScores(bars, participants, transportMode) {
  // Preload all routing grids
  await Promise.all([
    loadRoutingGrid('car'),
    loadRoutingGrid('bike'),
    loadRoutingGrid('foot')
  ]);
  
  const scoredBars = await Promise.all(
    bars.map(async bar => {
      const routeData = await calculateBarRoutes(bar, participants, transportMode);
      const durations = routeData.durations;
      
      // Calculate average duration
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      
      // Proximity score: linear decay based on average duration
      const proximityScore = Math.max(0, 100 - (avgDuration * 1.5));
      
      // Fairness score: based on coefficient of variation
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
      const coefficientOfVariation = Math.sqrt(variance) / avgDuration;
      const fairnessScore = Math.max(0, 100 * (1 - coefficientOfVariation));
      
      // Final score: 85% proximity, 15% fairness
      const score = Math.max(1, Math.min(100, 
        proximityScore * 0.85 + fairnessScore * 0.15
      ));
      
      // Calculate individual participant notes (deviation from average)
      const participantNotes = durations.map(d => d - avgDuration);
      
      return {
        ...bar,
        score: score.toFixed(1),
        avgDuration: avgDuration.toFixed(1),
        maxDuration: maxDuration.toFixed(1),
        durations,
        participantNotes,
        routes: routeData.routes
      };
    })
  );
  
  // Sort by score (descending)
  return scoredBars.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
}
