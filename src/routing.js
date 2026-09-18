// Routing calculation service

import { calculateGridRoutes } from './grid-routing.js';

const PROFILE_BY_MODE = {
  driving: 'car',
  cycling: 'bike',
  walking: 'foot'
};

export function getProfile(transportMode) {
  return PROFILE_BY_MODE[transportMode] || 'car';
}

// Distinct grid profiles needed by a group, so only those get downloaded
export function getUsedProfiles(participants) {
  return [...new Set(participants.map(p => getProfile(p.transportMode)))];
}

export async function calculateBarRoutes(bar, participants) {
  // Each participant travels with their own transport mode
  const routes = await Promise.all(
    participants.map(async (p) => {
      const [route] = await calculateGridRoutes(
        { lon: bar.lng, lat: bar.lat },
        [{ lon: p.lng, lat: p.lat }],
        getProfile(p.transportMode)
      );
      return {
        distance: route.distance,
        duration: route.duration,
        avgSpeed: route.avgSpeed
      };
    })
  );

  return {
    distances: routes.map(r => r.distance),
    durations: routes.map(r => r.duration),
    routes
  };
}
