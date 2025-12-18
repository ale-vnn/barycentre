import L from 'leaflet';

const translations = {
  fr: {
    subtitle: 'Le bar parfait pour tout le monde',
    nav: {
      participants: '① PARTICIPANTS',
      criteria: '② CRITÈRES',
      results: '③ RÉSULTATS'
    },
    step1: {
      title: 'PARTICIPANTS',
      namePlaceholder: 'Nom',
      addressPlaceholder: 'Adresse',
      addBtn: '+ AJOUTER',
      nextBtn: 'SUIVANT →',
      minParticipants: 'X AU MOINS 2 PARTICIPANTS REQUIS'
    },
    step2: {
      title: 'CRITÈRES DE RECHERCHE',
      transportLabel: 'MODE DE TRANSPORT',
      driving: '■ VOITURE',
      cycling: '■ VÉLO',
      walking: '■ MARCHE',
      establishmentLabel: 'TYPE D\'ÉTABLISSEMENT',
      bars: 'Bars',
      pubs: 'Pubs',
      wineBars: 'Bars à vin',
      biergartens: 'Biergartens',
      searchBtn: 'RECHERCHER',
      searchRequired: 'X LANCEZ D\'ABORD LA RECHERCHE'
    },
    step3: {
      title: 'RÉSULTATS',
      shareBtn: '↗ PARTAGER',
      viewRoutes: 'Voir itinéraires',
      avgDistance: 'Distance moy',
      avgTime: 'Temps moy',
      maxTime: 'Temps max',
      noResults: 'Aucun résultat trouvé',
      noAddress: 'Adresse non disponible',
      noName: 'Bar sans nom'
    },
    toast: {
      linkCopied: '→ LIEN COPIÉ',
      error: 'X ERREUR',
      sessionImported: '→ SESSION IMPORTÉE',
      searching: '■ RECHERCHE EN COURS...',
      calculating: '■ CALCUL DES ITINÉRAIRES...',
      modeChanged: 'Mode: ',
      fallbackWarning: '⚠ Calculs approximatifs (distance à vol d\'oiseau)',
      retrying: 'Nouvelle tentative...',
      apiError: 'Service temporairement indisponible',
      fallbackMode: 'Continuer en mode approximatif (distance à vol d\'oiseau)'
    },
    info: {
      title: 'À propos',
      services: 'Services utilisés',
      geocoding: 'Géocodage d\'adresses',
      search: 'Recherche de lieux',
      routing: 'Calcul d\'itinéraires',
      tiles: 'Tuiles cartographiques',
      library: 'Bibliothèque cartographique',
      license: 'Licence MIT - Code source ouvert'
    }
  },
  en: {
    subtitle: 'The perfect bar for everyone',
    nav: {
      participants: '① PARTICIPANTS',
      criteria: '② CRITERIA',
      results: '③ RESULTS'
    },
    step1: {
      title: 'PARTICIPANTS',
      namePlaceholder: 'Name',
      addressPlaceholder: 'Address',
      addBtn: '+ ADD',
      nextBtn: 'NEXT →',
      minParticipants: 'X AT LEAST 2 PARTICIPANTS REQUIRED'
    },
    step2: {
      title: 'SEARCH CRITERIA',
      transportLabel: 'TRANSPORT MODE',
      driving: '■ CAR',
      cycling: '■ BIKE',
      walking: '■ WALK',
      establishmentLabel: 'ESTABLISHMENT TYPE',
      bars: 'Bars',
      pubs: 'Pubs',
      wineBars: 'Wine bars',
      biergartens: 'Biergartens',
      searchBtn: 'SEARCH',
      searchRequired: 'X RUN THE SEARCH FIRST'
    },
    step3: {
      title: 'RESULTS',
      shareBtn: '↗ SHARE',
      viewRoutes: 'View routes',
      avgDistance: 'Avg distance',
      avgTime: 'Avg time',
      maxTime: 'Max time',
      noResults: 'No results found',
      noAddress: 'Address unavailable',
      noName: 'Unnamed bar'
    },
    toast: {
      linkCopied: '→ LINK COPIED',
      error: 'X ERROR',
      sessionImported: '→ SESSION IMPORTED',
      searching: '■ SEARCHING...',
      calculating: '■ CALCULATING ROUTES...',
      modeChanged: 'Mode: ',
      fallbackWarning: '⚠ Approximate calculations (straight line distance)',
      retrying: 'Retrying...',
      apiError: 'Service temporarily unavailable',
      fallbackMode: 'Continue in approximate mode (straight line distance)'
    },
    info: {
      title: 'About',
      services: 'Services used',
      geocoding: 'Address geocoding',
      search: 'Place search',
      routing: 'Route calculation',
      tiles: 'Map tiles',
      library: 'Mapping library',
      license: 'MIT License - Open source code'
    }
  }
};

let currentLang = 'fr';
let hasFallbackRoutes = false;

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  
  document.title = currentLang === 'fr' 
    ? 'Barycentre - Trouvez le bar optimal' 
    : 'Barycentre - Find the optimal bar';
}

function switchLanguage(lang) {
  currentLang = lang;
  applyTranslations();
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  document.querySelectorAll('.step-btn').forEach(btn => {
    const step = btn.dataset.step;
    const labelKey = lang === 'fr' ? 'labelFr' : 'labelEn';
    const label = btn.dataset[labelKey];
    const isActive = btn.classList.contains('active');
    
    if (isActive) {
      const circleNumber = step === '1' ? '①' : step === '2' ? '②' : '③';
      btn.textContent = `${circleNumber} ${label}`;
    } else {
      const circleNumber = step === '1' ? '①' : step === '2' ? '②' : '③';
      const firstLetter = label ? label.charAt(0) : '';
      btn.textContent = `${circleNumber}${firstLetter}`;
    }
  });
}

const state = {
  participants: [],
  bars: [],
  map: null,
  markers: {
    participants: [],
    bars: []
  },
  routeLayer: null,
  transportMode: 'driving',
  establishmentTypes: ['bar', 'pub']
};

function initMap() {
  state.map = L.map('map').setView([48.8566, 2.3522], 12);
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(state.map);
}

function getMapPadding() {
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

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function shareSession() {
  const params = new URLSearchParams();
  params.set('data', btoa(JSON.stringify({
    participants: state.participants,
    mode: state.transportMode
  })));
  
  const url = `${window.location.origin}${window.location.pathname}?${params}`;
  
  navigator.clipboard.writeText(url).then(() => {
    showToast(t('toast.linkCopied'));
  }).catch(() => {
    showToast(t('toast.error'));
  });
}

async function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  
  if (data) {
    try {
      const decoded = JSON.parse(atob(data));
      if (decoded.participants) {
        state.participants = decoded.participants;
        state.transportMode = decoded.mode || 'driving';
        updateParticipantsList();
        updateMap();
        updateWorkflowButtons();
        updateTransportModeUI();
        showToast(t('toast.sessionImported'));
        
        goToStep(2);
        setTimeout(async () => {
          await handleSearchBars();
          goToStep(3);
        }, 500);
      }
    } catch (error) {
      console.error('Erreur import URL:', error);
    }
  }
}

function goToStep(stepNumber) {
  if (stepNumber === 2 && state.participants.length < 2) {
    showToast(t('step1.minParticipants'));
    return;
  }
  
  if (stepNumber === 3 && state.bars.length === 0) {
    showToast(t('step2.searchRequired'));
    return;
  }
  
  document.querySelectorAll('.workflow-step').forEach(step => {
    step.classList.remove('active');
  });
  
  document.querySelectorAll('.step-btn').forEach(btn => {
    const step = btn.dataset.step;
    const labelKey = currentLang === 'fr' ? 'labelFr' : 'labelEn';
    const label = btn.dataset[labelKey];
    
    if (step === stepNumber.toString()) {
      btn.classList.add('active');
      btn.classList.remove('compact');
      const circleNumber = step === '1' ? '①' : step === '2' ? '②' : '③';
      btn.textContent = `${circleNumber} ${label}`;
    } else {
      btn.classList.remove('active');
      btn.classList.add('compact');
      const circleNumber = step === '1' ? '①' : step === '2' ? '②' : '③';
      const firstLetter = label ? label.charAt(0) : '';
      btn.textContent = `${circleNumber}${firstLetter}`;
    }
  });
  
  const stepEl = document.getElementById(`step${stepNumber}`);
  if (stepEl) stepEl.classList.add('active');
}

function clearResults() {
  state.bars = [];
  hasFallbackRoutes = false;
  
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
  
  updateWorkflowButtons();
}

function updateWorkflowButtons() {
  const nextBtn = document.getElementById('nextToCriteria');
  const step2Btn = document.querySelector('.step-btn[data-step="2"]');
  const step3Btn = document.querySelector('.step-btn[data-step="3"]');
  const searchOptions = document.getElementById('searchOptions');
  const searchBtn = document.getElementById('searchBars');
  
  const hasEnoughParticipants = state.participants.length >= 2;
  if (nextBtn) {
    nextBtn.disabled = !hasEnoughParticipants;
  }
  if (step2Btn) {
    step2Btn.disabled = !hasEnoughParticipants;
  }
  
  if (searchOptions) {
    if (hasEnoughParticipants) {
      searchOptions.classList.remove('disabled');
    } else {
      searchOptions.classList.add('disabled');
    }
  }
  if (searchBtn) {
    searchBtn.disabled = !hasEnoughParticipants;
  }
  
  if (step3Btn) {
    step3Btn.disabled = state.bars.length === 0;
  }
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    throw new Error('Adresse non trouvée');
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    throw error;
  }
}

async function addParticipant(name, address) {
  try {
    const location = await geocodeAddress(address);
    
    const participant = {
      id: Date.now(),
      name,
      address: location.displayName,
      lat: location.lat,
      lng: location.lng
    };
    
    state.participants.push(participant);
    clearResults();
    updateParticipantsList();
    updateMap();
    updateWorkflowButtons();
    
    return participant;
  } catch (error) {
    throw new Error('Impossible de localiser cette adresse');
  }
}

function removeParticipant(id) {
  state.participants = state.participants.filter(p => p.id !== id);
  clearResults();
  updateParticipantsList();
  updateMap();
  updateWorkflowButtons();
}

function updateParticipantsList() {
  const list = document.getElementById('participantsList');
  
  if (state.participants.length === 0) {
    list.innerHTML = '<p class="loading">Aucun participant ajouté</p>';
    return;
  }
  
  list.innerHTML = state.participants.map(p => `
    <div class="participant-item">
      <div class="participant-info">
        <div class="participant-name">${p.name}</div>
        <div class="participant-address">${p.address}</div>
      </div>
      <button class="btn btn-danger" onclick="window.removeParticipant(${p.id})">
        Supprimer
      </button>
    </div>
  `).join('');
}

function updateMap() {
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
    
    marker.bindPopup(`<strong>${p.name}</strong><br>${p.address}`);
    state.markers.participants.push(marker);
  });
  
  if (state.participants.length > 0) {
    const bounds = L.latLngBounds(state.participants.map(p => [p.lat, p.lng]));
    state.map.fitBounds(bounds, { padding: getMapPadding(), maxZoom: 13 });
  }
}

function updateTransportModeUI() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === state.transportMode);
  });
}

function updateEstablishmentTypes() {
  state.establishmentTypes = [];
  
  if (document.getElementById('filterBar').checked) state.establishmentTypes.push('bar');
  if (document.getElementById('filterPub').checked) state.establishmentTypes.push('pub');
  if (document.getElementById('filterWineBar').checked) state.establishmentTypes.push('wine_bar');
  if (document.getElementById('filterBiergarten').checked) state.establishmentTypes.push('biergarten');
  
  if (state.establishmentTypes.length === 0) {
    state.establishmentTypes = ['bar'];
    document.getElementById('filterBar').checked = true;
  }
}

function calculateCenter(participants) {
  const avgLat = participants.reduce((sum, p) => sum + p.lat, 0) / participants.length;
  const avgLng = participants.reduce((sum, p) => sum + p.lng, 0) / participants.length;
  return { lat: avgLat, lng: avgLng };
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function calculateRoute(lat1, lng1, lat2, lng2, retries = 2) {
  const profileMap = {
    'driving': 'car',
    'cycling': 'bike',
    'walking': 'foot'
  };
  const profile = profileMap[state.transportMode] || 'car';
  const url = `https://router.project-osrm.org/route/v1/${profile}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance / 1000,
          duration: route.duration / 60,
          geometry: route.geometry,
          isFallback: false
        };
      }
      
      break;
    } catch (error) {
      console.error(`Erreur OSRM (tentative ${attempt + 1}/${retries + 1}):`, error.message);
      
      if (attempt === retries || error.name === 'AbortError') {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  hasFallbackRoutes = true;
  return {
    distance: calculateDistance(lat1, lng1, lat2, lng2),
    duration: null,
    geometry: null,
    isFallback: true
  };
}

async function calculateBarRoutes(bar, participants) {
  const routes = await Promise.all(
    participants.map(p => calculateRoute(p.lat, p.lng, bar.lat, bar.lng))
  );
  
  const distances = routes.map(r => r.distance);
  const durations = routes.map(r => r.duration).filter(d => d !== null);
  
  const totalDistance = distances.reduce((sum, d) => sum + d, 0);
  const avgDistance = totalDistance / distances.length;
  const maxDistance = Math.max(...distances);
  
  const totalDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) : null;
  const avgDuration = durations.length > 0 ? totalDuration / durations.length : null;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : null;
  
  return {
    distances,
    durations,
    routes,
    totalDistance,
    avgDistance,
    maxDistance,
    totalDuration,
    avgDuration,
    maxDuration
  };
}

async function searchBars(retries = 2, onRetry = null) {
  const center = calculateCenter(state.participants);
  const radius = 3000;
  
  const amenityQueries = state.establishmentTypes.map(type => {
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
            console.log(`Overpass timeout/rate limit (tentative ${attempt + 1}/${retries + 1}), retry dans 2s...`);
            if (onRetry) onRetry(attempt + 1, retries + 1);
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON:', text.substring(0, 200));
        throw new Error('Service temporairement indisponible');
      }
      
      const data = await response.json();
      
      if (!data.elements || data.elements.length === 0) {
        return [];
      }
      
      return data.elements.map(element => ({
        id: element.id,
        osmId: element.id,
        name: element.tags?.name || t('step3.noName'),
        lat: element.lat,
        lng: element.lon,
        address: element.tags?.['addr:street'] || t('step3.noAddress'),
        website: element.tags?.website || null,
        phone: element.tags?.phone || null,
        openingHours: element.tags?.opening_hours || null
      }));
      
    } catch (error) {
      if (error.name === 'AbortError' && attempt < retries) {
        console.log(`Overpass timeout (tentative ${attempt + 1}/${retries + 1}), retry dans 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      
      if (attempt === retries) {
        console.error('Erreur lors de la recherche de bars:', error);
        throw error;
      }
    }
  }
  
  throw new Error('Service Overpass indisponible après plusieurs tentatives');
}

async function calculateBarScores(bars) {
  const scoredBars = await Promise.all(
    bars.map(async bar => {
      const routeData = await calculateBarRoutes(bar, state.participants);
      
      return {
        ...bar,
        totalDistance: routeData.totalDistance.toFixed(2),
        avgDistance: routeData.avgDistance.toFixed(2),
        maxDistance: routeData.maxDistance.toFixed(2),
        totalDuration: routeData.totalDuration ? routeData.totalDuration.toFixed(1) : null,
        avgDuration: routeData.avgDuration ? routeData.avgDuration.toFixed(1) : null,
        maxDuration: routeData.maxDuration ? routeData.maxDuration.toFixed(1) : null,
        distances: routeData.distances,
        routes: routeData.routes
      };
    })
  );
  
  return scoredBars.sort((a, b) => parseFloat(a.avgDistance) - parseFloat(b.avgDistance));
}

function displayResults(scoredBars) {
  const resultsDiv = document.getElementById('results');
  
  if (scoredBars.length === 0) {
    resultsDiv.innerHTML = `<p class="loading">${t('step3.noResults')}</p>`;
    return;
  }
  
  const topBars = scoredBars.slice(0, 5);
  
  const warningHtml = hasFallbackRoutes ? `<div style="padding: 0.75rem; background: rgba(255,200,0,0.15); border: 2px solid rgba(255,200,0,0.5); margin-bottom: 1rem; font-size: 0.9rem;">${t('toast.fallbackWarning')}</div>` : '';
  
  resultsDiv.innerHTML = warningHtml + topBars.map((bar, index) => `
    <div class="result-item" data-bar-index="${index}" style="cursor: pointer;" onclick="window.openBarPopup(${index})">
      <div>
        <span class="result-rank">${index + 1}</span>
        <span class="result-name">${bar.name}</span>
      </div>
      <div class="result-address">${bar.address}</div>
      <div class="result-stats">
        <div class="stat">
          <span>${t('step3.avgDistance')}</span>
          <strong>${bar.avgDistance} km</strong>
        </div>
        ${bar.avgDuration ? `
        <div class="stat">
          <span>${t('step3.avgTime')}</span>
          <strong>${bar.avgDuration} min</strong>
        </div>
        ` : ''}
        <div class="stat">
          <span>${currentLang === 'fr' ? 'Distance max' : 'Max distance'}</span>
          <strong>${bar.maxDistance} km</strong>
        </div>
        ${bar.maxDuration ? `
        <div class="stat">
          <span>${t('step3.maxTime')}</span>
          <strong>${bar.maxDuration} min</strong>
        </div>
        ` : ''}
      </div>
      <div style="display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.5rem; font-size: 0.85rem;">
        <button class="btn btn-secondary" onclick="event.stopPropagation(); window.showBarRoutes(${index});">${t('step3.viewRoutes')}</button>
        ${bar.website ? `<a href="${bar.website}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">${currentLang === 'fr' ? 'Site' : 'Web'}</a>` : ''}
        ${bar.phone ? `<a href="tel:${bar.phone}" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">${bar.phone}</a>` : ''}
        <a href="https://www.openstreetmap.org/node/${bar.osmId}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">OSM</a>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bar.address !== t('step3.noAddress') ? bar.name + ' ' + bar.address : bar.name)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" onclick="event.stopPropagation();" style="text-decoration: none;">Maps</a>
      </div>
    </div>
  `).join('');
  
  displayBarsOnMap(topBars);
}

function displayBarsOnMap(bars) {
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
      <h3>${bar.name}</h3>
      <div>${bar.address}</div>
      <div style="margin-top: 0.5rem;"><strong>${currentLang === 'fr' ? 'Distance moy' : 'Avg distance'}: ${bar.avgDistance} km</strong></div>
      ${bar.avgDuration ? `<div><strong>${currentLang === 'fr' ? 'Temps moy' : 'Avg time'}: ${bar.avgDuration} min</strong></div>` : ''}
    `;
    
    marker.bindPopup(popupContent);
    state.markers.bars.push(marker);
  });
}

function openBarPopup(barIndex) {
  if (state.markers.bars[barIndex]) {
    const marker = state.markers.bars[barIndex];
    const currentZoom = state.map.getZoom();
    const targetZoom = Math.min(currentZoom - 1, 14);
    state.map.setView(marker.getLatLng(), targetZoom);
    marker.openPopup();
  }
}

function showBarRoutes(barIndex) {
  const bar = state.bars[barIndex];
  
  if (state.routeLayer) {
    state.routeLayer.remove();
  }
  
  state.routeLayer = L.layerGroup().addTo(state.map);
  
  const colors = ['#000000', '#2d2d2d', '#4a4a4a', '#666666', '#808080'];
  const tooltips = [];
  
  bar.routes.forEach((route, index) => {
    const participant = state.participants[index];
    const color = colors[index % colors.length];
    
    if (route.geometry) {
      const routeLine = L.geoJSON(route.geometry, {
        style: {
          color: color,
          weight: 4,
          opacity: 0.8
        }
      }).addTo(state.routeLayer);
      
      const tooltipContent = `<strong>${participant.name}</strong><br>Distance: ${route.distance.toFixed(2)} km${route.duration ? `<br>${currentLang === 'fr' ? 'Temps' : 'Time'}: ${route.duration.toFixed(1)} min` : ''}`;
      
      routeLine.bindTooltip(tooltipContent, {
        permanent: true,
        direction: 'center',
        className: 'route-tooltip'
      });
      
      tooltips.push(routeLine);
    } else {
      const simpleLine = L.polyline([[participant.lat, participant.lng], [bar.lat, bar.lng]], {
        color: color,
        weight: 4,
        opacity: 0.5,
        dashArray: '10, 10'
      }).addTo(state.routeLayer);
      
      const tooltipContent = `<strong>${participant.name}</strong><br>Distance: ~${route.distance.toFixed(2)} km<br><em style="font-size: 0.85em;">(${currentLang === 'fr' ? 'à vol d\'oiseau' : 'straight line'})</em>`;
      
      simpleLine.bindTooltip(tooltipContent, {
        permanent: true,
        direction: 'center',
        className: 'route-tooltip'
      });
      
      tooltips.push(simpleLine);
    }
  });
  
  const allPoints = [bar, ...state.participants].map(p => [p.lat, p.lng]);
  const bounds = L.latLngBounds(allPoints);
  state.map.fitBounds(bounds, { padding: getMapPadding(), maxZoom: 14 });
  
  setTimeout(() => {
    tooltips.forEach(layer => {
      layer.openTooltip();
    });
    
    if (state.markers.bars[barIndex]) {
      state.markers.bars[barIndex].openPopup();
    }
  }, 300);
}

async function handleSearchBars(useFallback = false) {
  const resultsDiv = document.getElementById('results');
  const button = document.getElementById('searchBars');
  
  clearResults();
  
  resultsDiv.innerHTML = `<p class="loading">${t('toast.searching')}</p>`;
  button.disabled = true;
  button.textContent = t('toast.searching');
  
  try {
    const bars = await searchBars(2, (attempt, total) => {
      resultsDiv.innerHTML = `<p class="loading">${t('toast.searching')}<br><small>${t('toast.retrying')} (${attempt}/${total})</small></p>`;
    });
    
    if (bars.length === 0) {
      resultsDiv.innerHTML = `<p class="error">X ${currentLang === 'fr' ? 'Aucun établissement trouvé dans cette zone' : 'No establishments found in this area'}</p>`;
      button.disabled = false;
      button.textContent = t('step2.searchBtn');
      return;
    }
    
    resultsDiv.innerHTML = `<p class="loading">${t('toast.calculating')}</p>`;
    button.textContent = t('toast.calculating');
    
    const scoredBars = await calculateBarScores(bars);
    state.bars = scoredBars;
    displayResults(scoredBars);
    updateWorkflowButtons();
    goToStep(3);
    
    if (hasFallbackRoutes) {
      showToast(t('toast.fallbackWarning'));
    }
  } catch (error) {
    console.error('Erreur recherche:', error);
    resultsDiv.innerHTML = `
      <div class="error-container">
        <p class="error">X ${t('toast.apiError')}</p>
        <p style="margin: 1rem 0; font-size: 0.9rem;">${error.message}</p>
        <button class="btn" onclick="window.handleSearchBars()" style="margin-top: 1rem;">
          ↻ ${currentLang === 'fr' ? 'Réessayer' : 'Retry'}
        </button>
      </div>
    `;
  } finally {
    button.disabled = false;
    button.textContent = t('step2.searchBtn');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  
  const form = document.getElementById('personForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('personName');
    const addressInput = document.getElementById('personAddress');
    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    
    if (!name || !address) return;
    
    const list = document.getElementById('participantsList');
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'loading';
    loadingMsg.textContent = '■ GÉOLOCALISATION...';
    list.appendChild(loadingMsg);
    
    try {
      await addParticipant(name, address);
      nameInput.value = '';
      addressInput.value = '';
      nameInput.focus();
    } catch (error) {
      alert('X ' + error.message);
    } finally {
      loadingMsg.remove();
    }
  });
  
  document.getElementById('searchBars').addEventListener('click', handleSearchBars);
  
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step);
      if (!btn.disabled) {
        goToStep(step);
      }
    });
  });
  
  document.getElementById('nextToCriteria').addEventListener('click', () => {
    goToStep(2);
  });
  
  window.removeParticipant = removeParticipant;
  window.showBarRoutes = showBarRoutes;
  window.openBarPopup = openBarPopup;
  window.handleSearchBars = handleSearchBars;
  
  loadFromURL();
  
  document.getElementById('shareBtn').addEventListener('click', shareSession);
  
  document.getElementById('togglePanel').addEventListener('click', () => {
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.getElementById('togglePanel');
    const isHidden = mainContent.classList.toggle('hidden');
    
    const isMobile = window.innerWidth <= 1000;
    if (isMobile) {
      toggleBtn.textContent = isHidden ? '▲' : '▼';
    } else {
      toggleBtn.textContent = isHidden ? '▶' : '◀';
    }
  });
  
  window.addEventListener('resize', () => {
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.getElementById('togglePanel');
    const isHidden = mainContent.classList.contains('hidden');
    const isMobile = window.innerWidth <= 1000;
    
    if (isMobile) {
      toggleBtn.textContent = isHidden ? '▲' : '▼';
    } else {
      toggleBtn.textContent = isHidden ? '▶' : '◀';
    }
  });
  
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.transportMode = e.target.dataset.mode;
      clearResults();
      updateTransportModeUI();
      showToast(`${t('toast.modeChanged')}${e.target.textContent}`);
    });
  });
  
  ['filterBar', 'filterPub', 'filterWineBar', 'filterBiergarten'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      updateEstablishmentTypes();
      clearResults();
    });
  });
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.dataset.lang) {
        switchLanguage(e.target.dataset.lang);
      }
    });
  });
  
  document.getElementById('infoBtn').addEventListener('click', () => {
    document.getElementById('infoModal').style.display = 'flex';
  });
  
  document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('infoModal').style.display = 'none';
  });
  
  document.getElementById('infoModal').addEventListener('click', (e) => {
    if (e.target.id === 'infoModal') {
      document.getElementById('infoModal').style.display = 'none';
    }
  });
  
  applyTranslations();
  
  const initToggleArrow = () => {
    const toggleBtn = document.getElementById('togglePanel');
    const isMobile = window.innerWidth <= 1000;
    toggleBtn.textContent = isMobile ? '▼' : '◀';
  };
  initToggleArrow();
  
  updateTransportModeUI();
  updateWorkflowButtons();
});
