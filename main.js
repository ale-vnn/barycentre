// Main application entry point
import { updateI18n, initLanguageSelector, setLang, getCurrentLang, translations } from './i18n.js';
import { state } from './src/state.js';
import { initMap } from './src/map.js';
import { addParticipant, removeParticipant, updateTransportModeUI, updateParticipantsList } from './src/participants.js';
import { showBarRoutes, openBarPopup } from './src/map.js';
import { handleSearchBars } from './src/search.js';
import { goToStep, updateWorkflowButtons } from './src/workflow.js';
import { showToast, shareSession } from './src/ui.js';
import { loadFromURL } from './src/session.js';
import { initTheme } from './src/theme.js';
import { clearResults } from './src/results.js';
import { getCircleNumber } from './src/utils.js';

function applyTranslations() {
  updateI18n();
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = key.split('.').reduce((obj, k) => obj?.[k], translations[getCurrentLang()]);
    el.placeholder = translation || key;
  });
  document.title = 'Barycentre';
}

function updateStepButtons(lang) {
  document.querySelectorAll('.step-btn').forEach(btn => {
    const step = btn.dataset.step;
    const labelKey = lang === 'fr' ? 'labelFr' : 'labelEn';
    const label = btn.dataset[labelKey];
    const isActive = btn.classList.contains('active');
    const circleNumber = getCircleNumber(step);
    
    btn.textContent = isActive ? `${circleNumber} ${label}` : `${circleNumber}${label.charAt(0)}`;
  });
}

function switchLanguage(lang) {
  setLang(lang);
  applyTranslations();
  updateStepButtons(lang);
  updateParticipantsList();
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initTogglePanel() {
  const toggleBtn = document.getElementById('togglePanel');
  const mainContent = document.querySelector('.main-content');
  
  const updateToggleIcon = () => {
    const isHidden = mainContent.classList.contains('hidden');
    const isMobile = window.innerWidth <= 1000;
    toggleBtn.textContent = isMobile 
      ? (isHidden ? '▲' : '▼')
      : (isHidden ? '▶' : '◀');
  };
  
  updateToggleIcon();
  
  toggleBtn.addEventListener('click', () => {
    mainContent.classList.toggle('hidden');
    updateToggleIcon();
  });
  
  window.addEventListener('resize', updateToggleIcon);
}

function initInfoModal() {
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
}

function initParticipantForm() {
  const form = document.getElementById('participantForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('personName');
    const addressInput = document.getElementById('personAddress');
    const transportModeSelect = document.getElementById('transportMode');
    const name = nameInput.value.trim();
    const address = addressInput.value.trim();
    const transportMode = transportModeSelect.value;
    
    if (!name || !address) return;
    
    const list = document.getElementById('participantsList');
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'loading';
    loadingMsg.textContent = '■ GEOLOCATION...';
    list.appendChild(loadingMsg);
    
    try {
      await addParticipant(name, address, transportMode);
      nameInput.value = '';
      addressInput.value = '';
      nameInput.focus();
    } catch (error) {
      alert('X ' + error.message);
    } finally {
      loadingMsg.remove();
    }
  });
}

function initTransportModeButtons() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.transportMode = e.target.dataset.mode;
      clearResults();
      updateTransportModeUI();
      showToast(`${translations[getCurrentLang()].toast.modeChanged}${e.target.textContent}`);
    });
  });
}

function initWorkflowButtons() {
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
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initParticipantForm();
  initWorkflowButtons();
  initTransportModeButtons();
  initTogglePanel();
  initInfoModal();
  initTheme();
  initLanguageSelector(switchLanguage);
  applyTranslations();
  updateTransportModeUI();
  updateWorkflowButtons();
  
  // Expose functions to window for onclick handlers
  window.removeParticipant = removeParticipant;
  window.showBarRoutes = showBarRoutes;
  window.openBarPopup = openBarPopup;
  window.handleSearchBars = handleSearchBars;
  
  // Share button
  document.getElementById('shareBtn').addEventListener('click', shareSession);
  
  // Load session from URL if present
  loadFromURL();
});
