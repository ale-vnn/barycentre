const GRID_SIZE = 0.02; 
const FRANCE_BOUNDS = {
  minLon: -5.5,
  maxLon: 9.5,
  minLat: 41.0,
  maxLat: 51.5
};

let routingGrids = {}; 
let loadingPromises = {};

export async function loadRoutingGrid(mode = 'car') {
  if (routingGrids[mode]) {
    return routingGrids[mode];
  }
  
  if (loadingPromises[mode]) {
    return loadingPromises[mode];
  }
  
  loadingPromises[mode] = (async () => {
    try {
      const basePath = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${basePath}routing-grid-${mode}.json.gz`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      routingGrids[mode] = data;
      return data;
    } catch (error) {
      console.error(`Failed to load routing grid for ${mode}:`, error);
      delete loadingPromises[mode]; 
      throw error;
    } finally {
      delete loadingPromises[mode];
    }
  })();
  
  return loadingPromises[mode];
}

function getCellKey(lon, lat) {
  const cellX = Math.floor((lon - FRANCE_BOUNDS.minLon) / GRID_SIZE);
  const cellY = Math.floor((lat - FRANCE_BOUNDS.minLat) / GRID_SIZE);
  return `${cellX},${cellY}`;
}

function getCellSpeed(grid, lon, lat, defaultSpeed) {
  const cellKey = getCellKey(lon, lat);
  const speed = grid[cellKey];
  
  if (speed) return speed;
  
  const cellX = Math.floor((lon - FRANCE_BOUNDS.minLon) / GRID_SIZE);
  const cellY = Math.floor((lat - FRANCE_BOUNDS.minLat) / GRID_SIZE);
  
  let totalSpeed = 0;
  let count = 0;
  
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const neighborKey = `${cellX + dx},${cellY + dy}`;
      const neighborSpeed = grid[neighborKey];
      if (neighborSpeed) {
        totalSpeed += neighborSpeed;
        count++;
      }
    }
  }
  
  return count > 0 ? totalSpeed / count : defaultSpeed;
}

function haversine(lon1, lat1, lon2, lat2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getDetourFactor(mode, straightDistance) {
  const factors = {
    car: {
      short: 1.5,  
      medium: 1.3, 
      long: 1.2    
    },
    bike: {
      short: 1.45,  
      medium: 1.35,
      long: 1.25
    },
    foot: {
      short: 1.35,  
      medium: 1.25,
      long: 1.15
    }
  };
  
  const ranges = factors[mode] || factors.car;
  if (straightDistance < 2) return ranges.short;
  if (straightDistance < 10) return ranges.medium;
  return ranges.long;
}

export async function calculateGridRoute(from, to, mode = 'car') {
  const gridData = await loadRoutingGrid(mode);
  const grid = gridData.grid;
  
  const defaultSpeeds = { car: 60, bike: 15, foot: 5 };
  const defaultSpeed = defaultSpeeds[mode] || 50;
  
  const straightDistance = haversine(from.lon, from.lat, to.lon, to.lat);
  
  const samples = Math.max(8, Math.ceil(straightDistance * 3));
  let totalWeightedSpeed = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const lon = from.lon + (to.lon - from.lon) * t;
    const lat = from.lat + (to.lat - from.lat) * t;
    
    const speed = getCellSpeed(grid, lon, lat, defaultSpeed);
    
    const weight = (i === 0 || i === samples - 1) ? 1.5 : 1.0;
    totalWeightedSpeed += speed * weight;
    totalWeight += weight;
  }
  
  const avgSpeed = totalWeightedSpeed / totalWeight;
  
  const detourFactor = getDetourFactor(mode, straightDistance);
  
  const estimatedDistance = straightDistance * detourFactor;
  const estimatedDuration = (estimatedDistance / avgSpeed) * 60;
  
  return {
    distance: estimatedDistance,
    duration: estimatedDuration,
    mode,
    method: 'grid-approximation',
    straightDistance,
    avgSpeed: Math.round(avgSpeed),
    detourFactor
  };
}

export async function calculateGridRoutes(from, destinations, mode = 'car') {
  const gridData = await loadRoutingGrid(mode);
  const grid = gridData.grid;
  const defaultSpeeds = { car: 60, bike: 15, foot: 5 };
  const defaultSpeed = defaultSpeeds[mode] || 50;
  const results = [];
  
  for (const to of destinations) {
    const straightDistance = haversine(from.lon, from.lat, to.lon, to.lat);
    const samples = Math.max(8, Math.ceil(straightDistance * 3));
    let totalWeightedSpeed = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      const lon = from.lon + (to.lon - from.lon) * t;
      const lat = from.lat + (to.lat - from.lat) * t;
      
      const speed = getCellSpeed(grid, lon, lat, defaultSpeed);
      
      const weight = (i === 0 || i === samples - 1) ? 1.5 : 1.0;
      totalWeightedSpeed += speed * weight;
      totalWeight += weight;
    }
    
    const avgSpeed = totalWeightedSpeed / totalWeight;
    const detourFactor = getDetourFactor(mode, straightDistance);
    const estimatedDistance = straightDistance * detourFactor;
    const estimatedDuration = (estimatedDistance / avgSpeed) * 60;
    
    results.push({
      distance: estimatedDistance,
      duration: estimatedDuration,
      straightDistance,
      avgSpeed: Math.round(avgSpeed)
    });
  }
  
  return results;
}

export async function findBestLocations(origin, candidates, mode = 'car', criteria = 'distance', limit = 10) {
  
  const routes = await calculateGridRoutes(origin, candidates, mode);
  
  const scored = candidates.map((candidate, i) => ({
    ...candidate,
    ...routes[i],
    score: criteria === 'distance' ? routes[i].distance : routes[i].duration
  }));
  
  scored.sort((a, b) => a.score - b.score);
  
  return scored.slice(0, limit);
}
