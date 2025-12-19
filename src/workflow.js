// Workflow and step navigation
import { state } from './state.js';
import { t, getCurrentLang } from '../i18n.js';
import { showToast } from './ui.js';
import { getCircleNumber } from './utils.js';

export function goToStep(stepNumber) {
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
    const labelKey = getCurrentLang() === 'fr' ? 'labelFr' : 'labelEn';
    const label = btn.dataset[labelKey];
    const circleNumber = getCircleNumber(step);
    
    if (step === stepNumber.toString()) {
      btn.classList.add('active');
      btn.classList.remove('compact');
      btn.textContent = `${circleNumber} ${label}`;
    } else {
      btn.classList.remove('active');
      btn.classList.add('compact');
      const firstLetter = label ? label.charAt(0) : '';
      btn.textContent = `${circleNumber}${firstLetter}`;
    }
  });
  
  const stepEl = document.getElementById(`step${stepNumber}`);
  if (stepEl) stepEl.classList.add('active');
}

export function updateWorkflowButtons() {
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
