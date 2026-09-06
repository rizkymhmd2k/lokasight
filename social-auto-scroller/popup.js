const defaults = {
  distance: 700,
  delay: 1200,
  idleLimit: 20,
  maxMinutes: 60,
  smooth: true,
};

const elements = Object.fromEntries(
  ["site", "statusBadge", "progress", "target", "elapsed", "distance", "distanceValue", "delay", "delayValue", "idleLimit", "maxMinutes", "smooth", "pick", "resetTarget", "notice", "start", "pause", "stop"]
    .map((id) => [id, document.getElementById(id)]),
);

let tabId;
let state;
let pollTimer;

function formatTime(milliseconds = 0) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .slice(hours ? 0 : 1)
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function showNotice(message = "") {
  elements.notice.hidden = !message;
  elements.notice.textContent = message;
}

function settingsFromForm() {
  return {
    distance: Number(elements.distance.value),
    delay: Number(elements.delay.value),
    idleLimit: Number(elements.idleLimit.value),
    maxMinutes: Number(elements.maxMinutes.value),
    smooth: elements.smooth.checked,
  };
}

function updateLabels() {
  elements.distanceValue.value = `${elements.distance.value} px`;
  elements.delayValue.value = `${(Number(elements.delay.value) / 1000).toFixed(1)} dtk`;
}

function render(nextState) {
  if (!nextState) return;
  state = nextState;

  const labels = { idle: "Idle", running: "Jalan", paused: "Jeda", done: "Selesai" };
  elements.statusBadge.textContent = labels[state.phase] || state.phase;
  elements.statusBadge.className = `badge ${state.phase}`;
  elements.site.textContent = state.host;
  elements.progress.textContent = `${state.steps} langkah`;
  elements.target.textContent = state.targetName;
  elements.target.title = state.targetName;
  elements.elapsed.textContent = formatTime(state.elapsedMs);

  const active = state.phase === "running" || state.phase === "paused";
  elements.start.disabled = active;
  elements.pause.disabled = !active;
  elements.pause.textContent = state.phase === "paused" ? "Lanjut" : "Jeda";
  elements.stop.disabled = !active;

  showNotice(state.phase === "done" ? state.reason : "");
}

async function ensureInjected() {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
}

async function send(type, payload = {}) {
  try {
    return await chrome.tabs.sendMessage(tabId, { type, ...payload });
  } catch {
    await ensureInjected();
    return chrome.tabs.sendMessage(tabId, { type, ...payload });
  }
}

async function saveSettings() {
  const settings = settingsFromForm();
  await chrome.storage.local.set({ settings });
  return settings;
}

async function runCommand(command) {
  showNotice();
  try {
    render(await command());
  } catch (error) {
    showNotice(`Perintah gagal: ${error.message}. Reload tab lalu coba lagi.`);
  }
}

async function initialize() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab?.id;
  if (!tabId || !/^https?:/.test(tab.url || "")) {
    showNotice("Halaman ini tidak didukung. Buka website dengan alamat http/https.");
    document.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    return;
  }

  const saved = await chrome.storage.local.get("settings");
  const settings = { ...defaults, ...saved.settings };
  for (const key of ["distance", "delay", "idleLimit", "maxMinutes"]) elements[key].value = settings[key];
  elements.smooth.checked = settings.smooth;
  updateLabels();

  try {
    await ensureInjected();
    render(await send("GET_STATE"));
    pollTimer = setInterval(async () => {
      try { render(await send("GET_STATE")); } catch { clearInterval(pollTimer); }
    }, 700);
  } catch (error) {
    showNotice(`Tidak bisa mengakses halaman: ${error.message}`);
  }
}

for (const input of [elements.distance, elements.delay]) {
  input.addEventListener("input", updateLabels);
}

for (const input of [elements.distance, elements.delay, elements.idleLimit, elements.maxMinutes, elements.smooth]) {
  input.addEventListener("change", saveSettings);
}

elements.start.addEventListener("click", () => runCommand(async () => send("START", { settings: await saveSettings() })));
elements.pause.addEventListener("click", () => runCommand(() => send(state?.phase === "paused" ? "RESUME" : "PAUSE")));
elements.stop.addEventListener("click", () => runCommand(() => send("STOP")));
elements.pick.addEventListener("click", async () => {
  await send("PICK_TARGET");
  window.close();
});
elements.resetTarget.addEventListener("click", () => runCommand(() => send("RESET_TARGET")));

window.addEventListener("unload", () => clearInterval(pollTimer));
initialize();
