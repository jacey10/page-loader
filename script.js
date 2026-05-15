let audioCtx = null;
let soundEnabled = true;
let isTyping = false;
let dotInterval = null;

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
    if (!isTyping && el !== valStatus) return;
    el.textContent += char;
    if (Math.random() > 0.5) tick(); // Random tick to avoid audio overlap
    await new Promise(r => setTimeout(r, 70));
  }
  el.classList.remove('typing');
}

async function runSequence() {
  isTyping = true;
  statusComment.classList.remove('loaded');
  statusText.textContent = 'Loading portfolio';
  statusComment.style.opacity = '1';
  data.forEach(item => item.el.textContent = '');
  
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
  isTyping = false;
  stopDots();
  finishLoading();
  revealPortfolio();
}

function resetLoader() {
  isTyping = false;
  stopDots();
  portfolio.classList.remove('show');
  loader.classList.remove('hidden');
  entryScreen.classList.add('hidden');
  setTimeout(runSequence, 100);
}

// ---------------- EVENT LISTENERS ----------------
enterBtn.addEventListener('click', async () => {
  await unlockAudio();
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