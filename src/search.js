// Bar search functionality
import { translations, t, getCurrentLang } from '../i18n.js';
import { state } from './state.js';
import { displayResults, clearResults } from './results.js';
import { updateWorkflowButtons, goToStep } from './workflow.js';
import { calculateCenter } from './scoring.js';
import { calculateMaxParticipantDistance } from './utils.js';
import { searchBars } from './bar-search.js';
import { calculateBarScores } from './scoring.js';

export async function handleSearchBars(useFallback = false) {
  const resultsDiv = document.getElementById('results');
  const button = document.getElementById('searchBars');
  
  clearResults();
  updateWorkflowButtons();
  
  resultsDiv.innerHTML = `<p class="loading">${t('toast.searching')}</p>`;
  button.disabled = true;
  button.textContent = t('toast.searching');
  
  try {
    const center = calculateCenter(state.participants);
    const maxParticipantDistance = calculateMaxParticipantDistance(state.participants);
    
    const searchRadius = Math.max(3000, (maxParticipantDistance * 1000 / 2) + 2000);
    const bars = await searchBars(
      center,
      searchRadius,
      state.establishmentTypes,
      translations[getCurrentLang()],
      2,
      (attempt, total) => {
        resultsDiv.innerHTML = `<p class="loading">${t('toast.searching')}<br><small>${t('toast.retrying')} (${attempt}/${total})</small></p>`;
      }
    );
    
    if (bars.length === 0) {
      resultsDiv.innerHTML = `<p class="error">X ${getCurrentLang() === 'fr' ? 'Aucun établissement trouvé dans cette zone' : 'No establishments found in this area'}</p>`;
      button.disabled = false;
      button.textContent = t('step2.searchBtn');
      return;
    }
    
    resultsDiv.innerHTML = `<p class="loading">${t('toast.calculating')}</p>`;
    button.textContent = t('toast.calculating');
    
    const scoredBars = await calculateBarScores(bars, state.participants);
    state.bars = scoredBars;
    
    displayResults(scoredBars);
    updateWorkflowButtons();
    goToStep(3);
  } catch (error) {
    console.error('Search error:', error);
    resultsDiv.innerHTML = `
      <div class="error-container">
        <p class="error">X ${t('toast.apiError')}</p>
        <p style="margin: 1rem 0; font-size: 0.9rem;">${error.message}</p>
        <button class="btn" onclick="window.handleSearchBars()" style="margin-top: 1rem;">
          ↻ ${getCurrentLang() === 'fr' ? 'Réessayer' : 'Retry'}
        </button>
      </div>
    `;
  } finally {
    button.disabled = false;
    button.textContent = t('step2.searchBtn');
  }
}
