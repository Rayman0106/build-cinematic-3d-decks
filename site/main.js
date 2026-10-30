'use strict';
const films = {
  technical: {src:'media/technical-55s-v2.mp4',title:'Cinematic 3D Decks · 55-second technical demo · revision 2',caption:'Complete actions, then a transition: lights-out to reading, budget-bar car to development, physical screen to evidence, and dot-plot points to Mean / Median. Silent. Source and sample rates are listed in Media & credits.'},
  f1: {src:'media/f1-handoff.mp4',title:'F1 Economics · from race to reading',caption:'Approved Monza final-deck recording, source 22–31 seconds. Silent; engine audio is excluded.'},
  reaction: {src:'media/dotplot-type.mp4',title:'Reaction Time · the dot plot writes Mean / Median',caption:'The original dot plot supplies coloured particles to Mean / Median. Complete native animation, with a short final hold. Silent.'}
};
const dialog = document.getElementById('film-dialog');
const video = document.getElementById('film-player');
let returnFocus;
for (const button of document.querySelectorAll('[data-film]')) button.addEventListener('click', async () => {
  const film = films[button.dataset.film];
  returnFocus = button;
  document.getElementById('film-title').textContent = film.title;
  document.getElementById('film-caption').textContent = film.caption;
  video.src = film.src;
  video.setAttribute('aria-label', film.title);
  dialog.showModal();
  try { await video.play(); } catch (_) { /* Native controls remain usable if autoplay is denied. */ }
});
document.getElementById('close-film').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  video.pause(); video.removeAttribute('src'); video.load();
  returnFocus?.focus();
});
document.getElementById('copy-install').addEventListener('click', async event => {
  const button = event.currentTarget;
  const command = document.getElementById('install-command').textContent;
  try {
    await navigator.clipboard.writeText(command);
    button.textContent = 'Copied';
    document.getElementById('announcement').textContent = 'Installation command copied.';
    setTimeout(() => {button.textContent = 'Copy';document.getElementById('announcement').textContent = '';}, 2500);
  } catch (_) {
    const range = document.createRange();range.selectNodeContents(document.getElementById('install-command'));
    const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);
    button.textContent = 'Selected';
    document.getElementById('announcement').textContent = 'Command selected. Use your browser’s Copy command.';
    setTimeout(() => {button.textContent = 'Copy';document.getElementById('announcement').textContent = '';}, 6000);
  }
});
