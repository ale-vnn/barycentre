import { fetchJsonGz } from './gz-json.js';

// Grid geometry is NOT hardcoded: it is read from the file metadata, so a grid
// regenerated with a different cell size stays correct.
const DEFAULT_SPEEDS = { car: 60, bike: 15, foot: 5 };

const routingGrids = {};
const loadingPromises = {};

export async function loadRoutingGrid(mode = 'car') {
  if (routingGrids[mode]) return routingGrids[mode];
  if (loadingPromises[mode]) return loadingPromises[mode];

  loadingPromises[mode] = (async () => {
    try {
      const basePath = import.meta.env.BASE_URL || '/';
      const data = await fetchJsonGz(`${basePath}routing-grid-${mode}.json.gz`);
      const { gridSize, bounds } = data.metadata || {};

      if (!data.grid || !gridSize || !bounds) {
        throw new Error(`routing-grid-${mode} is missing metadata.gridSize / metadata.bounds`);
      }

      routingGrids[mode] = { cells: data.grid, gridSize, bounds };
      return routingGrids[mode];
    } catch (error) {
      console.error(`Failed to load routing grid for ${mode}:`, error);
      throw error;
    } finally {
      delete loadingPromises[mode];
    }
  })();

  return loadingPromises[mode];
}

function getCellSpeed(grid, lon, lat, defaultSpeed) {
  const cellX = Math.floor((lon - grid.bounds.minLon) / grid.gridSize);
  const cellY = Math.floor((lat - grid.bounds.minLat) / grid.gridSize);

  const speed = grid.cells[`${cellX},${cellY}`];
  if (speed) return speed;

  // Fall back to the 8 surrounding cells before the mode default
  let totalSpeed = 0;
  let count = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const neighborSpeed = grid.cells[`${cellX + dx},${cellY + dy}`];
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

// Straight-line distance underestimates real roads: correct it by mode and range
function getDetourFactor(mode, straightDistance) {
  const factors = {
    car: { short: 1.5, medium: 1.3, long: 1.2 },
    bike: { short: 1.45, medium: 1.35, long: 1.25 },
    foot: { short: 1.35, medium: 1.25, long: 1.15 }
  };

  const ranges = factors[mode] || factors.car;
  if (straightDistance < 2) return ranges.short;
  if (straightDistance < 10) return ranges.medium;
  return ranges.long;
}

export async function calculateGridRoutes(from, destinations, mode = 'car') {
  const grid = await loadRoutingGrid(mode);
  const defaultSpeed = DEFAULT_SPEEDS[mode] || 50;

  return destinations.map(to => {
    const straightDistance = haversine(from.lon, from.lat, to.lon, to.lat);
    const samples = Math.max(8, Math.ceil(straightDistance * 3));
    let totalWeightedSpeed = 0;
    let totalWeight = 0;

    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      const lon = from.lon + (to.lon - from.lon) * t;
      const lat = from.lat + (to.lat - from.lat) * t;

      // Endpoints matter more: they carry the local street speed at each end
      const weight = (i === 0 || i === samples - 1) ? 1.5 : 1.0;
      totalWeightedSpeed += getCellSpeed(grid, lon, lat, defaultSpeed) * weight;
      totalWeight += weight;
    }

    const avgSpeed = totalWeightedSpeed / totalWeight;
    const estimatedDistance = straightDistance * getDetourFactor(mode, straightDistance);

    return {
      distance: estimatedDistance,
      duration: (estimatedDistance / avgSpeed) * 60,
      straightDistance,
      avgSpeed: Math.round(avgSpeed)
    };
  });
}
