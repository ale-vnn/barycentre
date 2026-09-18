// Participant management functions
import { state } from './state.js';
import { updateMap } from './map.js';
import { clearResults } from './results.js';
import { updateWorkflowButtons } from './workflow.js';
import { getCurrentLang } from '../i18n.js';
import { geocodeAddress } from './geocoding.js';
import { getTranslatedModeLabel, escapeHtml } from './utils.js';

export async function addParticipant(name, address, transportMode) {
  try {
    const location = await geocodeAddress(address);

    const participant = {
      id: Date.now(),
      name,
      address: location.displayName,
      lat: location.lat,
      lng: location.lng,
      transportMode: transportMode || 'driving'
    };

    state.participants.push(participant);
    clearResults();
    updateParticipantsList();
    updateMap();
    updateWorkflowButtons();

    return participant;
  } catch (error) {
    throw new Error('Unable to locate this address');
  }
}

export function removeParticipant(id) {
  state.participants = state.participants.filter(p => p.id !== id);
  clearResults();
  updateParticipantsList();
  updateMap();
  updateWorkflowButtons();
}

export function updateParticipantsList() {
  const list = document.getElementById('participantsList');

  if (state.participants.length === 0) {
    list.innerHTML = '<p class="loading">No participant added</p>';
    return;
  }

  const currentLang = getCurrentLang();
  list.innerHTML = state.participants.map(p => `
    <div class="participant-item">
      <div class="participant-info">
        <div class="participant-name">${escapeHtml(p.name)}</div>
        <div class="participant-address">${escapeHtml(p.address)}</div>
        <div class="participant-mode">${getTranslatedModeLabel(p.transportMode, currentLang)}</div>
      </div>
      <button class="btn btn-danger" onclick="window.removeParticipant(${p.id})">
        Delete
      </button>
    </div>
  `).join('');
}
