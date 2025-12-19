// Session management (URL import/export)
import { state } from './state.js';
import { updateParticipantsList, updateTransportModeUI } from './participants.js';
import { updateMap } from './map.js';
import { updateWorkflowButtons, goToStep } from './workflow.js';
import { showToast } from './ui.js';
import { t } from '../i18n.js';
import { handleSearchBars } from './search.js';

export async function loadFromURL() {
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
      console.error('URL import error:', error);
    }
  }
}
