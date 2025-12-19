// External mapping services links generation

/**
 * Convert internal transport mode to Google Maps travelmode parameter
 * @param {string} transportMode - 'driving', 'cycling', or 'walking'
 * @returns {string} Google Maps travelmode parameter
 */
export function getGoogleMapsMode(transportMode) {
  const modeMap = {
    'driving': 'driving',
    'cycling': 'bicycling',
    'walking': 'walking'
  };
  return modeMap[transportMode] || 'driving';
}

/**
 * Generate Google Maps directions URL
 * @param {number} fromLat - Starting latitude
 * @param {number} fromLng - Starting longitude
 * @param {number} toLat - Destination latitude
 * @param {number} toLng - Destination longitude
 * @param {string} transportMode - Transport mode ('driving', 'cycling', 'walking')
 * @returns {string} Google Maps URL
 */
export function getGoogleMapsUrl(fromLat, fromLng, toLat, toLng, transportMode) {
  const travelmode = getGoogleMapsMode(transportMode);
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}?travelmode=${travelmode}`;
}

/**
 * Generate OSRM (OpenStreetMap Routing Machine) URL
 * @param {number} fromLat - Starting latitude
 * @param {number} fromLng - Starting longitude
 * @param {number} toLat - Destination latitude
 * @param {number} toLng - Destination longitude
 * @param {string} transportMode - Transport mode ('driving', 'cycling', 'walking')
 * @returns {string} OSRM URL
 */
export function getOsrmUrl(fromLat, fromLng, toLat, toLng, transportMode = 'driving') {
  const centerLat = ((fromLat + toLat) / 2).toFixed(5);
  const centerLng = ((fromLng + toLng) / 2).toFixed(5);
  
  // OSRM profile mapping: 0=car, 1=bike, 2=foot
  const profileMap = {
    'driving': 0,
    'cycling': 1,
    'walking': 2
  };
  const profile = profileMap[transportMode] || 0;
  
  return `https://map.project-osrm.org/?z=12&center=${centerLat},${centerLng}&loc=${fromLat},${fromLng}&loc=${toLat},${toLng}&hl=fr&srv=${profile}`;
}

/**
 * Generate Google Maps search URL for a place
 * @param {string} name - Place name
 * @param {string} address - Place address
 * @param {string} noAddressLabel - Label indicating no address (for comparison)
 * @returns {string} Google Maps search URL
 */
export function getGoogleMapsSearchUrl(name, address, noAddressLabel) {
  const query = address !== noAddressLabel ? `${name} ${address}` : name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Generate OpenStreetMap node URL
 * @param {string} osmId - OpenStreetMap node ID
 * @returns {string} OSM node URL
 */
export function getOsmNodeUrl(osmId) {
  return `https://www.openstreetmap.org/node/${osmId}`;
}
