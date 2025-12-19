// Routing calculation service

import { calculateGridRoutes } from './grid-routing.js';

export async function calculateBarRoutes(bar, participants) {
  const profileMap = {
    'driving': 'car',
    'cycling': 'bike',
    'walking': 'foot'
  };
  
  // Calculate route for each participant with their own transport mode
  const routes = await Promise.all(
    participants.map(async (p) => {
      const profile = profileMap[p.transportMode] || 'car';
      const gridRoutes = await calculateGridRoutes(
        { lon: bar.lng, lat: bar.lat },
        [{ lon: p.lng, lat: p.lat }],
        profile
      );
      return gridRoutes[0];
    })
  );
  
  const formattedRoutes = routes.map(route => ({
    distance: route.distance,
    duration: route.duration,
    geometry: null,
    avgSpeed: route.avgSpeed
  }));
  
  const distances = formattedRoutes.map(r => r.distance);
  const durations = formattedRoutes.map(r => r.duration);
  
  return {
    distances,
    durations,
    routes: formattedRoutes
  };
}
