import pako from 'pako';
import { calculateDistance } from './utils.js';

function isInFrance(lat, lng) {
  const bounds = {
    north: 51.2,
    south: 41.3,
    west: -5.3,
    east: 9.7
  };
  return lat >= bounds.south && lat <= bounds.north && 
         lng >= bounds.west && lng <= bounds.east;
}

let staticBarsData = null;
let staticBarsLoaded = false;

async function loadStaticBarsData(translations) {
  if (staticBarsLoaded) return staticBarsData;
  
  try {
    const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}bars-france.geojson.gz`);
    if (!response.ok) throw new Error('Static data not available');
    
    const contentType = response.headers.get('content-type');
    let geojson;
    
    if (contentType && contentType.includes('application/json')) {
      geojson = await response.json();
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
      geojson = JSON.parse(decompressed);
    }
    staticBarsData = geojson.features.map(feature => ({
      id: feature.properties.id || feature.properties.osmId,
      osmId: feature.properties.osmId,
      name: feature.properties.name || translations.step3.noName,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      address: feature.properties.address || translations.step3.noAddress,
      website: feature.properties.website || null,
      phone: feature.properties.phone || null,
      openingHours: feature.properties.opening_hours || null,
      amenity: feature.properties.amenity
    }));
    staticBarsLoaded = true;
    return staticBarsData;
  } catch (error) {
    console.warn('Failed to load static bars data:', error);
    staticBarsLoaded = false;
    return null;
  }
}

function searchBarsInStaticData(center, radius, amenityTypes) {
  if (!staticBarsData) return null;
  
  const radiusInKm = radius / 1000;
  
  const filtered = staticBarsData.filter(bar => {
    if (!amenityTypes.includes(bar.amenity)) return false;
    const distance = calculateDistance(center.lat, center.lng, bar.lat, bar.lng);
    return distance <= radiusInKm;
  });
  
  return filtered;
}

async function searchBarsOverpass(center, radius, amenityTypes, translations, retries = 2, onRetry = null) {
  const amenityQueries = amenityTypes.map(type => {
    return `node["amenity"="${type}"](around:${radius},${center.lat},${center.lng});`;
  }).join('\n      ');
  
  const query = `[out:json][timeout:25];(${amenityQueries});out body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 504 || response.status === 429) {
          if (attempt < retries) {
            if (onRetry) onRetry(attempt + 1, retries + 1);
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
        }
        throw new Error(`Server error: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Service temporarily unavailable');
      }
      
      const data = await response.json();
      
      if (!data.elements || data.elements.length === 0) {
        return [];
      }
      
      return data.elements.map(element => ({
        id: element.id,
        osmId: element.id,
        name: element.tags?.name || translations.step3.noName,
        lat: element.lat,
        lng: element.lon,
        address: element.tags?.['addr:street'] || translations.step3.noAddress,
        website: element.tags?.website || null,
        phone: element.tags?.phone || null,
        openingHours: element.tags?.opening_hours || null
      }));
    } catch (error) {
      if (error.name === 'AbortError' && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      
      if (attempt === retries) {
        console.error('Error searching bars:', error);
        throw error;
      }
    }
  }
  
  throw new Error('Overpass service unavailable after multiple attempts');
}

export async function searchBars(center, radius, amenityTypes, translations, retries = 2, onRetry = null) {
  if (isInFrance(center.lat, center.lng)) {
    const staticData = await loadStaticBarsData(translations);
    if (staticData) {
      const results = searchBarsInStaticData(center, radius, amenityTypes);
      if (results && results.length > 0) {
        return results;
      }
    }
  }
  
  return searchBarsOverpass(center, radius, amenityTypes, translations, retries, onRetry);
}
