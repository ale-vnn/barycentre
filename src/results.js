// Results display and bar management
import L from 'leaflet';
import { state } from './state.js';
import { t, getCurrentLang } from '../i18n.js';
import { getOsmNodeUrl, getGoogleMapsSearchUrl } from './ext-links.js';

export function clearResults() {
  state.bars = [];
  state.displayLimit = 5;
  
  state.markers.bars.forEach(marker => marker.remove());
  state.markers.bars = [];
  
  if (state.routeLayer) {
    state.routeLayer.remove();
    state.routeLayer = null;
  }
  
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) {
    resultsDiv.innerHTML = '';
  }
}

export function displayResults(scoredBars) {
  const resultsDiv = document.getElementById('results');
  
  if (scoredBars.length === 0) {
    resultsDiv.innerHTML = `<p class="loading">${t('step3.noResults')}</p>`;
    return;
  }
  
  const displayLimit = state.displayLimit || 5;
  const topBars = scoredBars.slice(0, displayLimit);
  
  resultsDiv.innerHTML = topBars.map((bar, index) => `
    <div class="result-item" data-bar-index="${index}" style="cursor: pointer;" onclick="window.openBarPopup(${index})">
      <div>
        <span class="result-rank">${index + 1}</span>
        <span class="result-name">${bar.name}</span>
      </div>
      <div class="result-address">${bar.address}</div>
      <div class="result-stats">
        <div class="stat">
          <span>BARYSCORE</span>
          <strong>${bar.score}/100</strong>
        </div>
      </div>
      <div class="participant-ratios">
        ${state.participants.map((p, i) => {
          const note = bar.participantNotes[i];
          const duration = bar.durations[i];
          const sign = note > 0 ? '+' : '';
          return `<div class="ratio-item">
            <span>${p.name}</span>
            <span>${sign}${note.toFixed(0)}min</span>
            <span>${duration.toFixed(0)}min</span>
          </div>`;
        }).join('')}
      </div>
      <div style="display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.5rem; font-size: 0.85rem;">
        <button class="btn btn-secondary" onclick="event.stopPropagation(); window.showBarRoutes(${index});">${t('step3.viewRoutes')}</button>
        ${bar.website ? `<a href="${bar.website}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">${getCurrentLang() === 'fr' ? 'Site' : 'Web'}</a>` : ''}
        ${bar.phone ? `<a href="tel:${bar.phone}" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">${bar.phone}</a>` : ''}
        <a href="${getOsmNodeUrl(bar.osmId)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">OSM</a>
        <a href="${getGoogleMapsSearchUrl(bar.name, bar.address, t('step3.noAddress'))}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">GMAPS</a>
      </div>
    </div>
  `).join('');
  
  if (scoredBars.length > displayLimit) {
    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'btn btn-secondary';
    showMoreBtn.textContent = `${getCurrentLang() === 'fr' ? '▼ Afficher plus' : '▼ Show more'} (${scoredBars.length - displayLimit} ${getCurrentLang() === 'fr' ? 'restants' : 'remaining'})`;
    showMoreBtn.style.width = '100%';
    showMoreBtn.style.marginTop = '1rem';
    showMoreBtn.onclick = () => {
      state.displayLimit = (state.displayLimit || 5) + 10;
      displayResults(scoredBars);
    };
    resultsDiv.appendChild(showMoreBtn);
  }
  
  displayBarsOnMap(topBars);
}

export function displayBarsOnMap(bars) {
  state.markers.bars.forEach(marker => marker.remove());
  state.markers.bars = [];
  
  bars.forEach((bar, index) => {
    const marker = L.marker([bar.lat, bar.lng], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #000; color: white; width: 35px; height: 35px; border-radius: 0; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 3px solid white; box-shadow: 0 4px 0 #000; font-size: 16px;">${index + 1}</div>`,
        iconSize: [35, 35],
        iconAnchor: [17.5, 17.5]
      })
    }).addTo(state.map);
    
    const popupContent = `
      <div style="font-family: 'Courier New', Courier, monospace;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${bar.name}</h3>
        <div style="margin-bottom: 0.5rem; font-size: 0.9rem;">${bar.address}</div>
        <div style="margin-bottom: 0.5rem;">
          <strong>BaryScore: ${bar.score}/100</strong>
        </div>
        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.5rem;">
          <button class="btn btn-secondary" onclick="window.showBarRoutes(${index}); return false;" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">${t('step3.viewRoutes')}</button>
          ${bar.website ? `<a href="${bar.website}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; text-decoration: none;">${getCurrentLang() === 'fr' ? 'Site' : 'Web'}</a>` : ''}
          ${bar.phone ? `<a href="tel:${bar.phone}" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; text-decoration: none;">${bar.phone}</a>` : ''}
          <a href="${getOsmNodeUrl(bar.osmId)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; text-decoration: none;">OSM</a>
          <a href="${getGoogleMapsSearchUrl(bar.name, bar.address, t('step3.noAddress'))}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; text-decoration: none;">GMAPS</a>
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent, { maxWidth: 300 });
    state.markers.bars.push(marker);
  });
}
