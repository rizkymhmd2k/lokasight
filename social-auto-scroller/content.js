(() => {
  if (globalThis.__SOCIAL_AUTO_SCROLLER_INSTALLED__) return;
  globalThis.__SOCIAL_AUTO_SCROLLER_INSTALLED__ = true;

  const defaults = {
    distance: 700,
    delay: 1200,
    idleLimit: 20,
    maxMinutes: 60,
    smooth: true,
  };

  const state = {
    phase: "idle",
    reason: "",
    settings: { ...defaults },
    steps: 0,
    idleChecks: 0,
    startedAt: 0,
    elapsedBeforePause: 0,
    timer: null,
    target: null,
    targetName: "Otomatis",
    autoTargetName: "Otomatis",
    autoTarget: null,
    picker: null,
    lastTop: -1,
    lastHeight: -1,
    hud: null,
  };

  function isDocumentTarget(target) {
    return !target || target === document.scrollingElement || target === document.documentElement || target === document.body;
  }

  function metrics(target) {
    if (isDocumentTarget(target)) {
      const root = document.scrollingElement || document.documentElement;
      return {
        top: root.scrollTop,
        height: Math.max(root.scrollHeight, document.body?.scrollHeight || 0),
        viewport: window.innerHeight,
      };
    }

    return { top: target.scrollTop, height: target.scrollHeight, viewport: target.clientHeight };
  }

  function canScroll(element) {
    if (!(element instanceof HTMLElement)) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return /(auto|scroll|overlay)/.test(style.overflowY)
      && element.scrollHeight > element.clientHeight + 80
      && rect.width > 180
      && rect.height > 160
      && rect.bottom > 0
      && rect.top < window.innerHeight;
  }

  function findBestTarget(preferInternal = false) {
    const root = document.scrollingElement || document.documentElement;
    const page = metrics(root);
    const rootOverflow = getComputedStyle(root).overflowY;
    if (!preferInternal && page.height > page.viewport + 80 && !/(hidden|clip)/.test(rootOverflow)) return root;

    let best = root;
    let bestScore = 0;

    for (const element of document.querySelectorAll("[role='feed'], [role='main'], main, section, div")) {
      if (!canScroll(element)) continue;
      const rect = element.getBoundingClientRect();
      const score = rect.width * rect.height + Math.min(element.scrollHeight - element.clientHeight, 10000) * 30;
      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    }

    return best;
  }

  function activeTarget() {
    if (state.target?.isConnected && (isDocumentTarget(state.target) || canScroll(state.target))) return state.target;
    if (state.autoTarget?.isConnected && (isDocumentTarget(state.autoTarget) || canScroll(state.autoTarget))) {
      return state.autoTarget;
    }
    state.autoTarget = findBestTarget();
    return state.autoTarget;
  }

  function targetLabel(target) {
    if (isDocumentTarget(target)) return "Halaman utama";
    const role = target.getAttribute("role");
    const id = target.id ? `#${target.id}` : "";
    return `${target.tagName.toLowerCase()}${id}${role ? ` [${role}]` : ""}`;
  }

  function elapsedMs() {
    if (state.phase === "running") return state.elapsedBeforePause + Date.now() - state.startedAt;
    return state.elapsedBeforePause;
  }

  function publicState() {
    return {
      phase: state.phase,
      reason: state.reason,
      steps: state.steps,
      idleChecks: state.idleChecks,
      elapsedMs: elapsedMs(),
      targetName: state.target ? state.targetName : state.autoTargetName,
      host: location.hostname || location.protocol,
      settings: state.settings,
    };
  }

  function clearTimer() {
    clearTimeout(state.timer);
    state.timer = null;
  }

  function updateHud() {
    if (!state.hud) {
      const host = document.createElement("div");
      host.id = "social-auto-scroller-status";
      Object.assign(host.style, {
        position: "fixed", right: "18px", bottom: "18px", zIndex: "2147483647",
      });
      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = `
        <style>
          .box { display:flex;align-items:center;gap:10px;padding:9px 10px 9px 12px;border:1px solid #3b3f45;border-radius:12px;background:#111;color:#f7f7f7;box-shadow:0 10px 35px #0008;font:600 12px system-ui,sans-serif }
          .dot { width:8px;height:8px;border-radius:50%;background:#54df8a;box-shadow:0 0 0 4px #54df8a22 }
          button { border:0;border-radius:7px;padding:6px 9px;background:#2a2d32;color:#fff;font:700 11px system-ui,sans-serif;cursor:pointer }
        </style>
        <div class="box"><i class="dot"></i><span></span><button type="button">Stop</button></div>`;
      shadow.querySelector("button").addEventListener("click", stop);
      document.documentElement.append(host);
      state.hud = { host, text: shadow.querySelector("span"), dot: shadow.querySelector(".dot") };
    }

    state.hud.text.textContent = state.phase === "running"
      ? `Auto-scroll aktif · ${state.steps} langkah`
      : state.phase === "paused" ? "Auto-scroll dijeda" : state.reason;
    state.hud.dot.style.background = state.phase === "running" ? "#54df8a" : "#ffd60a";
  }

  function removeHud() {
    state.hud?.host.remove();
    state.hud = null;
  }

  function finish(reason, phase = "done") {
    clearTimer();
    if (state.phase === "running") state.elapsedBeforePause = elapsedMs();
    state.phase = phase;
    state.reason = reason;
    if (phase === "idle") removeHud();
    else updateHud();
  }

  function tick() {
    if (state.phase !== "running") return;

    const maxMs = state.settings.maxMinutes * 60_000;
    if (maxMs && elapsedMs() >= maxMs) {
      finish("Batas waktu tercapai");
      return;
    }

    const target = activeTarget();
    state.autoTargetName = targetLabel(target);
    const before = metrics(target);
    const unchanged = before.top === state.lastTop && before.height === state.lastHeight;
    const atBottom = before.top + before.viewport >= before.height - 24;

    if (state.lastTop >= 0 && before.top !== state.lastTop) state.steps += 1;

    if (unchanged) state.idleChecks += 1;
    else state.idleChecks = 0;

    if (!state.target && unchanged && !atBottom && state.idleChecks === 2) {
      const fallback = findBestTarget(true);
      if (!isDocumentTarget(fallback) && fallback !== target) {
        state.autoTarget = fallback;
        state.autoTargetName = targetLabel(fallback);
        state.idleChecks = 0;
        state.lastTop = -1;
        state.lastHeight = -1;
        state.timer = setTimeout(tick, 100);
        return;
      }
    }

    if (state.idleChecks >= state.settings.idleLimit) {
      finish("Tidak ada konten baru");
      return;
    }

    state.lastTop = before.top;
    state.lastHeight = before.height;

    const nextTop = before.top + state.settings.distance;
    const options = { top: nextTop, behavior: state.settings.smooth ? "smooth" : "auto" };
    if (typeof target.scrollTo === "function") target.scrollTo(options);
    else target.scrollTop = nextTop;

    updateHud();
    state.timer = setTimeout(tick, state.settings.delay);
  }

  function start(settings) {
    clearTimer();
    state.settings = { ...defaults, ...settings };
    state.phase = "running";
    state.reason = "";
    state.steps = 0;
    state.idleChecks = 0;
    state.elapsedBeforePause = 0;
    state.startedAt = Date.now();
    state.lastTop = -1;
    state.lastHeight = -1;
    state.autoTarget = null;
    updateHud();
    tick();
  }

  function pause() {
    if (state.phase !== "running") return;
    state.elapsedBeforePause = elapsedMs();
    state.phase = "paused";
    state.reason = "Dijeda";
    clearTimer();
    updateHud();
  }

  function resume() {
    if (state.phase !== "paused") return;
    state.phase = "running";
    state.reason = "";
    state.startedAt = Date.now();
    updateHud();
    tick();
  }

  function stop() {
    finish("Dihentikan", "idle");
  }

  function cleanupPicker() {
    if (!state.picker) return;
    const { hovered, oldOutline, move, click, keydown, banner } = state.picker;
    if (hovered && !isDocumentTarget(hovered)) hovered.style.outline = oldOutline;
    banner.remove();
    document.removeEventListener("mousemove", move, true);
    document.removeEventListener("click", click, true);
    document.removeEventListener("keydown", keydown, true);
    state.picker = null;
  }

  function armPicker() {
    cleanupPicker();

    const banner = document.createElement("div");
    banner.textContent = "Arahkan ke area feed lalu klik · Esc untuk batal";
    Object.assign(banner.style, {
      position: "fixed", zIndex: "2147483647", top: "16px", left: "50%", transform: "translateX(-50%)",
      padding: "10px 14px", borderRadius: "9px", background: "#111", color: "#ffd60a",
      font: "600 13px system-ui, sans-serif", boxShadow: "0 8px 30px #0008", pointerEvents: "none",
    });
    document.documentElement.append(banner);

    const picker = { hovered: null, oldOutline: "", banner };

    picker.move = (event) => {
      let candidate = event.target;
      while (candidate && candidate !== document.body && !canScroll(candidate)) candidate = candidate.parentElement;
      candidate = candidate && canScroll(candidate) ? candidate : document.scrollingElement;
      if (candidate === picker.hovered) return;
      if (picker.hovered && !isDocumentTarget(picker.hovered)) picker.hovered.style.outline = picker.oldOutline;
      picker.hovered = candidate;
      if (!isDocumentTarget(candidate)) {
        picker.oldOutline = candidate.style.outline;
        candidate.style.outline = "3px solid #ffd60a";
      }
    };

    picker.click = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const selected = picker.hovered || document.scrollingElement;
      state.target = selected;
      state.targetName = targetLabel(selected);
      cleanupPicker();
    };

    picker.keydown = (event) => {
      if (event.key === "Escape") cleanupPicker();
    };

    state.picker = picker;
    document.addEventListener("mousemove", picker.move, true);
    document.addEventListener("click", picker.click, true);
    document.addEventListener("keydown", picker.keydown, true);
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case "GET_STATE": break;
      case "START": start(message.settings); break;
      case "PAUSE": pause(); break;
      case "RESUME": resume(); break;
      case "STOP": stop(); break;
      case "PICK_TARGET": armPicker(); break;
      case "RESET_TARGET":
        state.target = null;
        state.targetName = "Otomatis";
        break;
      default:
        sendResponse({ error: "Perintah tidak dikenal" });
        return;
    }
    sendResponse(publicState());
  });
})();
