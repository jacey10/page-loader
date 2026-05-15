let audioCtx = null;
let soundEnabled = true;
let isTyping = false;
let dotInterval = null;
let isResetting = false; // Prevents rapid replay spam

// DOM Elements
const entryScreen = document.getElementById('entryScreen');
const loader = document.getElementById('loader');
const portfolio = document.getElementById('portfolio');
const enterBtn = document.getElementById('enterBtn');
const skipBtn = document.getElementById('skipBtn');
const replayBtn = document.getElementById('replayBtn');
const soundBtn = document.getElementById('soundBtn');
const statusComment = document.getElementById('status-comment');
const statusText = statusComment.querySelector('.status-text');
const dots = statusComment.querySelector('.dots');
const valName = document.getElementById('val-name');
const valRole = document.getElementById('val-role');
const valStatus = document.getElementById('val-status');

const data = [
  { el: valName, text: '"Jay Cee"' },
  { el: valRole, text: '"Frontend Developer"' },
  { el: valStatus, text: '"Available for work"' }
];

// Check if user already entered this session
const hasEntered = sessionStorage.getItem('portfolio_entered') === 'true';

if (hasEntered) {
  entryScreen.classList.add('hidden');
  runSequence(); // Auto-start loader on refresh
}

// ---------------- AUDIO LOGIC ----------------
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

async function unlockAudio() {
  initAudio();
  if (audioCtx.state === "suspended") await audioCtx.resume();
}

function tick() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = 800;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
  osc.stop(audioCtx.currentTime + 0.04);
}

function toggleSound(buttonEl) {
  soundEnabled = !soundEnabled;
  if (buttonEl) buttonEl.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
}

// ---------------- LOADER LOGIC ----------------
function startDots() {
  statusComment.style.opacity = '1';
  let count = 0;
  clearInterval(dotInterval); // Safety clear
  dotInterval = setInterval(() => {
    count = (count % 3) + 1;
    dots.textContent = '.'.repeat(count);
  }, 450);
}

function stopDots() {
  clearInterval(dotInterval);
  dots.textContent = '';
}

function finishLoading() {
  stopDots();
  statusComment.classList.add('loaded');
  statusText.textContent = '✅ Portfolio loaded';
}

async function typeElement(el, text) {
  el.textContent = '';
  el.classList.add('typing');
  for (let char of text) {
    if (!isTyping) break; // Abort immediately if reset/skip fired
    el.textContent += char;
    if (Math.random() > 0.5) tick();
    await new Promise(r => setTimeout(r, 70));
  }
  el.classList.remove('typing');
}

// ---------------- SEQUENCE CONTROL ----------------
async function runSequence() {
  if (isResetting) return;
  isTyping = true;
  
  // Reset DOM
  data.forEach(item => item.el.textContent = '');
  statusComment.classList.remove('loaded');
  statusText.textContent = 'Loading portfolio';
  statusComment.style.opacity = '1';

  startDots();

  for (let item of data) {
    await typeElement(item.el, item.text);
    if (!isTyping) break;
    await new Promise(r => setTimeout(r, 300));
  }

  if (isTyping) {
    finishLoading();
    await new Promise(r => setTimeout(r, 800));
    revealPortfolio();
  }
}

function revealPortfolio() {
  loader.classList.add('hidden');
  portfolio.classList.add('show');
}

function skipLoader() {
  if (isResetting) return;
  isTyping = false;
  stopDots();
  finishLoading();
  revealPortfolio();
}

function resetLoader() {
  if (isResetting) return; // Block spam clicks
  isResetting = true;

  // 1. Stop all active processes
  isTyping = false;
  clearInterval(dotInterval);

  // 2. Reset UI state
  portfolio.classList.remove('show');
  loader.classList.remove('hidden');

  // 3. Wait for CSS transition to finish before restarting
  setTimeout(() => {
    isResetting = false;
    runSequence();
  }, 400); // Matches your 0.6s transition with a small buffer
}

// ---------------- EVENT LISTENERS ----------------

enterBtn.addEventListener('click', async () => {
  await unlockAudio();
  sessionStorage.setItem('portfolio_entered', 'true'); // <-- Add this
  entryScreen.classList.add('hidden');
  runSequence();
});

skipBtn.addEventListener('click', skipLoader);
replayBtn.addEventListener('click', async () => {
  await unlockAudio();
  resetLoader();
});

soundBtn.addEventListener('click', async () => {
  await unlockAudio();
  toggleSound(soundBtn);
});