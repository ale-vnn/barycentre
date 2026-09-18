// Scoring and calculation utilities

import { calculateBarRoutes, getUsedProfiles } from './routing.js';
import { loadRoutingGrid } from './grid-routing.js';

// BaryScore weights: getting there fast matters most, but not at any cost in fairness
const PROXIMITY_WEIGHT = 0.85;
const FAIRNESS_WEIGHT = 0.15;

export function calculateCenter(participants) {
  const totalLat = participants.reduce((sum, p) => sum + p.lat, 0);
  const totalLng = participants.reduce((sum, p) => sum + p.lng, 0);
  return {
    lat: totalLat / participants.length,
    lng: totalLng / participants.length
  };
}

export async function calculateBarScores(bars, participants) {
  await Promise.all(getUsedProfiles(participants).map(profile => loadRoutingGrid(profile)));

  const scoredBars = await Promise.all(
    bars.map(async bar => {
      const routeData = await calculateBarRoutes(bar, participants);
      const durations = routeData.durations;

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      // Proximity: linear decay, 0 at 66 min average
      const proximityScore = Math.max(0, 100 - (avgDuration * 1.5));

      // Fairness: coefficient of variation. Everyone already there means perfect fairness.
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
      const coefficientOfVariation = avgDuration > 0 ? Math.sqrt(variance) / avgDuration : 0;
      const fairnessScore = Math.max(0, 100 * (1 - coefficientOfVariation));

      const score = Math.max(1, Math.min(100,
        proximityScore * PROXIMITY_WEIGHT + fairnessScore * FAIRNESS_WEIGHT
      ));

      return {
        ...bar,
        score: score.toFixed(1),
        avgDuration: avgDuration.toFixed(1),
        maxDuration: maxDuration.toFixed(1),
        durations,
        // Deviation from the group average, per participant
        participantNotes: durations.map(d => d - avgDuration),
        routes: routeData.routes
      };
    })
  );

  return scoredBars.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
}
