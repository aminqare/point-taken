const STORAGE_KEY = 'point-taken-rulings';
const SCORE_KEY = 'point-taken-score';
const defaultRulings = [
  { change: 1, category: 'Funny', icon: '☻', reason: 'sent a meme that was actually good', time: 'Today, 10:42' },
  { change: -1, category: 'Cringe funny', icon: '◌', reason: 'said “we listen and we don’t judge” unironically', time: 'Yesterday, 21:08' },
  { change: 1, category: 'Kind', icon: '♡', reason: 'checked in at exactly the right time', time: 'Yesterday, 15:30' }
];
let rulings = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultRulings;
let score = Number(localStorage.getItem(SCORE_KEY) || 42);
let selectedCategory = { name: 'Funny', icon: '☻' };
const $ = (id) => document.getElementById(id);
const AUTH_KEY = 'point-taken-authenticated';

function showApp() { $('login-screen').hidden = true; $('app-shell').hidden = false; }
function showLogin() { $('login-screen').hidden = false; $('app-shell').hidden = true; }
if (sessionStorage.getItem(AUTH_KEY) === 'true') showApp();
else showLogin();

$('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = $('login-username').value.trim().toLowerCase();
  const password = $('login-password').value;
  if (username === 'asal' && password === 'asal123321') {
    sessionStorage.setItem(AUTH_KEY, 'true');
    $('login-error').textContent = '';
    showApp();
  } else {
    $('login-error').textContent = 'That login does not match the scorecard.';
  }
});
$('logout-button').addEventListener('click', () => { sessionStorage.removeItem(AUTH_KEY); showLogin(); $('login-password').value = ''; });

function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(rulings)); localStorage.setItem(SCORE_KEY, String(score)); }
function renderScore() { $('score').textContent = score; $('meter-fill').style.width = `${Math.min(100, Math.max(5, score))}%`; $('score-note').textContent = score >= 80 ? 'Certified excellent company.' : score >= 50 ? 'A remarkably respectable human.' : score >= 0 ? 'Currently under friendly review.' : 'A little redemption arc never hurt.'; }
function formatTime() { return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date()); }
function renderActivity() {
  if (!rulings.length) { $('activity-list').innerHTML = '<div class="empty">No rulings yet. The record is suspiciously clean.</div>'; return; }
  $('activity-list').innerHTML = rulings.slice(0, 6).map((item) => `<article class="activity-item"><div class="activity-icon ${item.change < 0 ? 'down' : ''}">${item.icon}</div><div class="activity-text"><strong>${escapeHtml(item.category)}</strong><span class="activity-reason">${escapeHtml(item.reason)}</span><span class="activity-time">${escapeHtml(item.time)}</span></div><div class="activity-change ${item.change < 0 ? 'down' : ''}">${item.change > 0 ? '+' : ''}${item.change}</div></article>`).join('');
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function showToast(message) { const toast = $('toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }

document.querySelectorAll('.category').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.category').forEach((item) => item.classList.remove('active')); button.classList.add('active'); selectedCategory = { name: button.dataset.category, icon: button.dataset.icon }; }));
document.querySelectorAll('.action').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); const reason = $('reason').value.trim(); if (!reason) { $('reason').focus(); showToast('Add a reason before ruling.'); return; } const amount = Math.min(10, Math.max(1, Number($('amount').value) || 1)); const change = Number(button.dataset.change) * amount; score += change; rulings.unshift({ change, category: selectedCategory.name, icon: selectedCategory.icon, reason, time: `Today, ${formatTime()}` }); persist(); renderScore(); renderActivity(); $('reason').value = ''; showToast(change > 0 ? `${amount} point${amount === 1 ? '' : 's'} awarded.` : `${amount} point${amount === 1 ? '' : 's'} deducted.`); }));
$('clear-button').addEventListener('click', () => { if (!rulings.length) return; rulings = []; persist(); renderActivity(); showToast('History cleared. A fresh chapter.'); });
renderScore(); renderActivity();
