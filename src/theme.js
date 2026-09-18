// Theme management
// The basemap follows the theme through a CSS filter on the tile pane,
// so switching theme never touches the map layers.

export function initTheme() {
  const themeBtn = document.getElementById('themeBtn');
  const savedTheme = localStorage.getItem('theme') || 'light';

  document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn.textContent = savedTheme === 'dark' ? '\u2600' : '\u263e';
  themeBtn.addEventListener('click', toggleTheme);
}

export function toggleTheme() {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  document.getElementById('themeBtn').textContent = newTheme === 'dark' ? '\u2600' : '\u263e';
}
