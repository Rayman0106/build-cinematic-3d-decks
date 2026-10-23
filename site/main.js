'use strict';
const films = {
  showcase: {src:'media/showcase-25s.mp4',title:'Cinematic 3D Decks · 25-second showcase',caption:'Real F1 project excerpts and archived Reaction Time character motion. The closing card is an editorial graphic. Silent; source details and version boundaries are in Media & credits.'},
  f1: {src:'media/f1-handoff.mp4',title:'F1 Economics · from race to reading',caption:'Saved final-deck recording, source 22–31 seconds. The track gives way to a readable slide. Silent; this does not demonstrate the current engine sound.'},
  reaction: {src:'media/reaction-motion.mp4',title:'Reaction Time · archived character motion',caption:'Genuine development capture: sitting, standing and bowing. Original 831 × 467 GIF, approximately 11.2 seconds. Typography and slide numbering predate the final presentation. No new browser recording.'}
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
