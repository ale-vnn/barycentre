// Session management (URL import/export)
import { state } from './state.js';
import { updateParticipantsList } from './participants.js';
import { updateMap } from './map.js';
import { updateWorkflowButtons, goToStep } from './workflow.js';
import { showToast } from './ui.js';
import { t } from '../i18n.js';
import { handleSearchBars } from './search.js';

const MAX_PARTICIPANTS = 20;
const MAX_TEXT_LENGTH = 200;
const TRANSPORT_MODES = ['driving', 'cycling', 'walking'];

// A shared link is untrusted input: rebuild every participant from validated fields only.
// Ids in particular end up inside an inline onclick handler, so they must stay numeric.
function sanitizeParticipant(raw, index) {
  if (!raw || typeof raw !== 'object') return null;

  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return null;

  const id = Number(raw.id);

  return {
    id: Number.isFinite(id) ? id : Date.now() + index,
    name: String(raw.name ?? '').slice(0, MAX_TEXT_LENGTH),
    address: String(raw.address ?? '').slice(0, MAX_TEXT_LENGTH),
    lat,
    lng,
    transportMode: TRANSPORT_MODES.includes(raw.transportMode) ? raw.transportMode : 'driving'
  };
}

export async function loadFromURL() {
  const data = new URLSearchParams(window.location.search).get('data');
  if (!data) return;

  let participants;
  try {
    const decoded = JSON.parse(atob(data));
    if (!Array.isArray(decoded.participants)) return;

    participants = decoded.participants
      .slice(0, MAX_PARTICIPANTS)
      .map(sanitizeParticipant)
      .filter(Boolean);
  } catch (error) {
    console.error('URL import error:', error);
    return;
  }

  if (participants.length === 0) return;

  state.participants = participants;
  updateParticipantsList();
  updateMap();
  updateWorkflowButtons();
  showToast(t('toast.sessionImported'));

  goToStep(2);
  setTimeout(async () => {
    await handleSearchBars();
    goToStep(3);
  }, 500);
}
