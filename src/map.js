// Map management functions
import L from 'leaflet';
import { state } from './state.js';
import { t, getCurrentLang } from '../i18n.js';
import { getGoogleMapsUrl, getOsrmUrl } from './ext-links.js';
import { escapeHtml } from './utils.js';

export function initMap() {
  state.map = L.map('map').setView([48.1173, -1.6778], 12);
  
  // Plain OSM tiles, desaturated by CSS (see .leaflet-tile-pane in style.css):
  // one open source for both themes, no API key, no extra dependency.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(state.map);
}

export function getMapPadding() {
  const isMobile = window.innerWidth <= 1000;
  const mainContent = document.querySelector('.main-content');
  const isHidden = mainContent?.classList.contains('hidden');
  
  if (isHidden) {
    return [80, 80];
  }
  
  if (isMobile) {
    const panelHeight = mainContent?.offsetHeight || 0;
    return [80, Math.max(panelHeight + 40, 80)];
  } else {
    const panelWidth = mainContent?.offsetWidth || 0;
    return [80, 80, 80, Math.max(panelWidth + 40, 80)];
  }
}

export function updateMap() {
  state.markers.participants.forEach(marker => marker.remove());
  state.markers.participants = [];
  
  if (state.participants.length === 0) return;
  
  state.participants.forEach((p, index) => {
    const marker = L.marker([p.lat, p.lng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #fff; color: #000; width: 32px; height: 32px; border-radius: 0; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 3px solid #000; box-shadow: 0 4px 0 #000;">${index + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(state.map);
    
    marker.bindPopup(`<strong>${escapeHtml(p.name)}</strong><br>${escapeHtml(p.address)}`);
    state.markers.participants.push(marker);
  });
  
  if (state.participants.length > 0) {
    const bounds = L.latLngBounds(state.participants.map(p => [p.lat, p.lng]));
    state.map.fitBounds(bounds, { padding: getMapPadding(), maxZoom: 13 });
  }
}

// Routes are straight-line approximations: the grid router returns durations, not geometries
function buildRouteTooltip(participant, bar, duration, note) {
  const lang = getCurrentLang();
  const sign = note > 0 ? '+' : '';
  const noteLabel = note < -1 ? (lang === 'fr' ? 'Avantagé' : 'Advantaged') :
                    note > 1 ? (lang === 'fr' ? 'Pénalisé' : 'Penalized') :
                    (lang === 'fr' ? 'Équitable' : 'Fair');
  const googleUrl = getGoogleMapsUrl(participant.lat, participant.lng, bar.lat, bar.lng, participant.transportMode);
  const osrmUrl = getOsrmUrl(participant.lat, participant.lng, bar.lat, bar.lng, participant.transportMode);

  return `<div style="padding: 0.75rem; font-family: 'Courier New', monospace; min-width: 200px;">
    <div style="font-weight: bold; margin-bottom: 0.5rem; font-size: 0.9rem;">${escapeHtml(participant.name)}</div>
    <div style="font-size: 0.85rem; margin-bottom: 0.75rem; line-height: 1.5;">
      <div>${lang === 'fr' ? 'Temps estimé' : 'Est. time'}: <strong>${duration.toFixed(0)}min</strong></div>
      <div>${noteLabel}: <strong>${sign}${note.toFixed(0)}min</strong></div>
    </div>
    <div style="display: flex; gap: 0.5rem;">
      <a href="${googleUrl}" target="_blank" rel="noopener">GMAPS</a>
      <a href="${osrmUrl}" target="_blank" rel="noopener">OSRM</a>
    </div>
  </div>`;
}

function buildCurvedLine(start, end) {
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const dx = end[1] - start[1];
  const dy = end[0] - start[0];
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offsetRatio = Math.min(0.15, distance * 0.1);
  const controlLat = midLat - dx * offsetRatio;
  const controlLng = midLng + dy * offsetRatio;

  const curvePoints = [];
  for (let t = 0; t <= 1; t += 0.05) {
    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * controlLat + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * controlLng + t * t * end[1];
    curvePoints.push([lat, lng]);
  }
  return curvePoints;
}

export function showBarRoutes(barIndex) {
  const bar = state.bars[barIndex];

  if (state.routeLayer) {
    state.routeLayer.clearLayers();
    state.routeLayer.remove();
    state.routeLayer = null;
  }

  state.map.eachLayer(layer => {
    if (layer.getTooltip && layer.getTooltip()) {
      layer.closeTooltip();
    }
  });

  state.routeLayer = L.layerGroup().addTo(state.map);

  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  const colors = isDarkMode
    ? ['#ffffff', '#d0d0d0', '#b0b0b0', '#909090', '#707070']
    : ['#000000', '#2d2d2d', '#4a4a4a', '#666666', '#808080'];
  const tooltips = [];

  bar.routes.forEach((route, index) => {
    const participant = state.participants[index];
    const curvedLine = L.polyline(buildCurvedLine([participant.lat, participant.lng], [bar.lat, bar.lng]), {
      color: colors[index % colors.length],
      weight: 3,
      opacity: 0.7,
      dashArray: '8, 8'
    }).addTo(state.routeLayer);

    curvedLine.bindTooltip(
      buildRouteTooltip(participant, bar, route.duration, bar.participantNotes[index]),
      { permanent: true, direction: 'center', className: 'route-tooltip' }
    );

    tooltips.push(curvedLine);
  });

  const allPoints = [bar, ...state.participants].map(p => [p.lat, p.lng]);
  const needsZoom = allPoints.some(point => !state.map.getBounds().contains(point));

  if (needsZoom) {
    state.map.fitBounds(L.latLngBounds(allPoints), {
      padding: getMapPadding(),
      maxZoom: 14,
      animate: false
    });
  }

  if (window.innerWidth <= 1000) {
    document.querySelector('.main-content').classList.add('hidden');
    document.getElementById('togglePanel').textContent = '▲';
  }

  tooltips.forEach(layer => layer.openTooltip());
}

export function openBarPopup(barIndex) {
  if (state.markers.bars[barIndex]) {
    const marker = state.markers.bars[barIndex];
    
    const markerLatLng = marker.getLatLng();
    const mapBounds = state.map.getBounds();
    
    if (!mapBounds.contains(markerLatLng)) {
      state.map.panTo(markerLatLng, { animate: true });
    }
    
    marker.openPopup();
    
    const isMobile = window.innerWidth <= 1000;
    if (isMobile) {
      const mainContent = document.querySelector('.main-content');
      const toggleBtn = document.getElementById('togglePanel');
      mainContent.classList.add('hidden');
      toggleBtn.textContent = '▲';
    }
  }
}
