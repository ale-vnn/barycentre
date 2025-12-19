// Theme management
import L from 'leaflet';
import { state } from './state.js';

export function initTheme() {
  const themeBtn = document.getElementById('themeBtn');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? '☀' : '☾';
  
  if (savedTheme === 'dark') {
    updateMapTiles('dark');
  }
  
  themeBtn.addEventListener('click', toggleTheme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const themeBtn = document.getElementById('themeBtn');
  themeBtn.textContent = newTheme === 'dark' ? '☀' : '☾';
  
  updateMapTiles(newTheme);
}

function updateMapTiles(theme) {
  state.map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) {
      state.map.removeLayer(layer);
    }
  });
  
  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  
  L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(state.map);
}
