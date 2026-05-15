const enterBtn = document.getElementById("enterBtn");

const entryScreen = document.getElementById("entryScreen");
const loader = document.getElementById("loader");

const portfolio = document.getElementById("portfolio");

const values = document.querySelectorAll(".value");

const soundBtn = document.getElementById("soundBtn");
const skipBtn = document.getElementById("skipBtn");
const replayBtn = document.getElementById("replayBtn");

let soundEnabled = true;
let skipped = false;

const delay = (ms) => new Promise(res => setTimeout(res, ms));

/* AUDIO */

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function tick() {
  if (!soundEnabled) return;
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = 800;

  gain.gain.value = 0.03;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + 0.04
  );

  osc.stop(audioCtx.currentTime + 0.04);
}

/* TYPE */

async function typeLine(el) {

  const text = el.dataset.value;

  el.textContent = "";
  el.classList.add("typing");

  for (const char of text) {

    if (skipped) {
      el.textContent = text;
      break;
    }

    el.textContent += char;

    tick();

    await delay(50);
  }

  el.classList.remove("typing");
}

/* LOADER */

async function runLoader() {

  skipped = false;

  values.forEach(el => {
    el.textContent = "";
  });

  for (const el of values) {
    await typeLine(el);
    await delay(150);
  }

  const done = document.createElement("div");

  done.textContent = "// Portfolio loaded";
  done.style.color = "#00B48A";

  document.querySelector(".code-block").appendChild(done);

  await delay(600);

  loader.classList.add("hidden");

  portfolio.classList.add("show");
}

/* SKIP */

function skipLoader() {

  skipped = true;

  values.forEach(el => {
    el.textContent = el.dataset.value;
  });

  loader.classList.add("hidden");

  portfolio.classList.add("show");
}

/* SOUND */

soundBtn.addEventListener("click", async () => {

  initAudio();

  await audioCtx.resume();

  soundEnabled = !soundEnabled;

  soundBtn.textContent =
    soundEnabled
      ? "Sound: On"
      : "Sound: Off";
});

/* REPLAY */

replayBtn.addEventListener("click", () => {
  location.reload();
});

/* SKIP */

skipBtn.addEventListener("click", skipLoader);

/* ENTER */

enterBtn.addEventListener("click", async () => {

  initAudio();

  await audioCtx.resume();

  entryScreen.classList.add("hidden");

  loader.classList.remove("hidden");

  runLoader();
});