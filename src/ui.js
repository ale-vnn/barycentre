// UI utilities
import { t } from '../i18n.js';
import { state } from './state.js';

export function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export function shareSession() {
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
