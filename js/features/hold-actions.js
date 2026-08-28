(() => {
  const APP = window.PCARIOCA_APP;
  const { $, $$, toast, clamp } = APP.helpers;

  const HOLD_DELAY_MS = 350;
  const MOUSE_MOVE_TOLERANCE = 12;
  const TOUCH_MOVE_TOLERANCE = 18;
  const HOLD_FIRED_MARK_MS = 520;
  const HOLD_UTILITY_VIBRATE = [45, 30, 70];
  const HOLD_GAME_VIBRATE = [35, 20, 35, 20, 90];
  const HOLD_WIRE_SELECTOR = [
    "[data-hold-key]",
    ".tag",
    ".bullets li",
    ".resource-link",
    ".left-whoami-section-title",
    ".left-whoami-pill",
    ".langbar a[data-lang]",
    ".icbtn",
    ".resume",
    "#card",
    "#bg",
    "#profileImg",
    "#audioPill"
  ].join(", ");
  const HOLD_NOTE_POOL = [
    "./audio/c3.mp3",
    "./audio/d4.mp3",
    "./audio/e4.mp3",
    "./audio/f4.mp3",
    "./audio/g4.mp3",
    "./audio/a3.mp3",
    "./audio/b5.mp3",
    "./audio/d5.mp3"
  ];
  const MAIL_DRAFTS = [
    {
      subject: "Collaboration Inquiry",
      body: "Hi Paul-Andrei,%0D%0A%0D%0AI found your portfolio and would like to connect regarding a potential collaboration."
    },
    {
      subject: "Interview Invitation",
      body: "Hi Paul-Andrei,%0D%0A%0D%0AWe would like to invite you for a technical interview about an engineering role."
    },
    {
      subject: "Project Discussion",
      body: "Hi Paul-Andrei,%0D%0A%0D%0AI am interested in discussing an AI/computer-vision project with you."
    }
  ];

  function ensureState() {
    APP.state.holdEngine = APP.state.holdEngine || {
      active: null,
      hudVisible: false,
      refsWired: false,
      autoKeyCounter: 0,
      tagFilters: new Map(),
      pinnedPills: new Map(),
      starredResources: new Map(),
      mailDraftIndex: 0,
      holdSoundProfile: "classic",
      orbitModeUntil: 0,
      orbitTrailWired: false,
      activeGame: null
    };
    APP.state.holdModes = APP.state.holdModes || {};
    APP.state.holdGameState = APP.state.holdGameState || null;
    return APP.state.holdEngine;
  }

  function currentLangContent() {
    const lang = APP.state.currentLang || "en";
    return APP.data.content?.[lang] || APP.data.content?.en || {};
  }

  function t(key, fallback = "") {
    const value = currentLangContent()[key];
    return typeof value === "string" ? value : fallback;
  }

  function dispatch(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function ensureRefs() {
    APP.refs.holdHud = $("#holdHud");
    APP.refs.holdHudLabel = $("#holdHudLabel");
    APP.refs.holdGameLayer = $("#holdGameLayer");
    APP.refs.holdGameCanvas = $("#holdGameCanvas");
    APP.refs.holdGameUi = $("#holdGameUi");
    APP.refs.holdGameOrbs = $("#holdGameOrbs");
    APP.refs.quickTray = $("#quickTray");
    APP.refs.quickPinnedList = $("#quickPinnedList");
    APP.refs.quickStarredList = $("#quickStarredList");
  }

  function showHud(label) {
    ensureRefs();
    const hud = APP.refs.holdHud;
    const hudLabel = APP.refs.holdHudLabel;
    if (!hud || !hudLabel) return;

    hud.hidden = false;
    hud.setAttribute("aria-hidden", "false");
    hud.classList.add("show");
    hud.style.setProperty("--hold-progress", "0");
    hudLabel.textContent = label || t("holdHudDefault", "Hold...");
    ensureState().hudVisible = true;
  }

  function updateHudProgress(progress) {
    const hud = APP.refs.holdHud;
    if (!hud) return;
    hud.style.setProperty("--hold-progress", String(clamp(progress, 0, 1)));
  }

  function hideHud() {
    const hud = APP.refs.holdHud;
    if (!hud) return;
    hud.classList.remove("show");
    hud.style.setProperty("--hold-progress", "0");
    setTimeout(() => {
      if (!hud.classList.contains("show")) {
        hud.hidden = true;
        hud.setAttribute("aria-hidden", "true");
      }
    }, 180);
    ensureState().hudVisible = false;
  }

  function notify(key, fallback) {
    toast(t(key, fallback));
  }

  function pulseBodyClass(cls, duration = 560) {
    document.body.classList.add(cls);
    setTimeout(() => {
      document.body.classList.remove(cls);
    }, duration);
  }

  function vibrate(pattern) {
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (err) {
      console.warn("[app] navigator.vibrate failed", err);
    }
  }

  function hashString(input) {
    const text = String(input || "");
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h >>> 0);
  }

  function noteByKey(key) {
    const idx = hashString(key) % HOLD_NOTE_POOL.length;
    return HOLD_NOTE_POOL[idx];
  }

  async function copyText(text, toastKey, fallbackToast) {
    const value = String(text || "").trim();
    if (!value) return;

    try {
      if (typeof APP.api.copyToClipboard === "function") {
        await APP.api.copyToClipboard(value);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      notify(toastKey, fallbackToast);
      APP.api.playHoldMotif?.("copy");
    } catch (err) {
      console.warn("[app] Copy failed", err);
      toast(value);
    }
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchesKeyword(text, keyword) {
    const source = normalizeText(text);
    const tokens = normalizeText(keyword).split(" ").filter(Boolean);
    if (!tokens.length) return false;
    return tokens.some((tok) => source.includes(tok));
  }

  function refreshTagFilterMarkers() {
    const hold = ensureState();
    const tags = $$(".tag[data-hold-key]");
    tags.forEach((el) => {
      const key = el.dataset.holdKey;
      if (hold.tagFilters.has(key)) el.classList.add("hold-filter-active");
      else el.classList.remove("hold-filter-active");
    });
  }

  function applyTagFilters() {
    const hold = ensureState();
    const activeEntries = [...hold.tagFilters.entries()]
      .map(([key]) => {
        const el = document.querySelector(`[data-hold-key="${key}"]`);
        return el ? el.textContent : "";
      })
      .filter(Boolean);

    const bullets = $$(".bullets li");
    const resources = $$(".resource-item");

    if (!activeEntries.length) {
      bullets.forEach((el) => el.classList.remove("hold-filter-hidden"));
      resources.forEach((el) => el.classList.remove("hold-filter-hidden"));
      refreshTagFilterMarkers();
      return;
    }

    bullets.forEach((el) => {
      const text = el.textContent || "";
      const visible = activeEntries.every((tag) => matchesKeyword(text, tag));
      el.classList.toggle("hold-filter-hidden", !visible);
    });

    resources.forEach((el) => {
      const text = el.textContent || "";
      const visible = activeEntries.every((tag) => matchesKeyword(text, tag));
      el.classList.toggle("hold-filter-hidden", !visible);
    });

    refreshTagFilterMarkers();
  }

  function refreshPinnedLabelsFromDom() {
    const hold = ensureState();
    if (!hold.pinnedPills.size) return;

    const next = new Map();
    hold.pinnedPills.forEach((value, key) => {
      const el = document.querySelector(`[data-hold-key="${key}"]`);
      next.set(key, el?.textContent?.trim() || value);
    });
    hold.pinnedPills = next;
  }

  function updateQuickTray() {
    ensureRefs();
    const hold = ensureState();
    const tray = APP.refs.quickTray;
    const pinnedList = APP.refs.quickPinnedList;
    const starredList = APP.refs.quickStarredList;
    if (!tray || !pinnedList || !starredList) return;

    refreshPinnedLabelsFromDom();

    pinnedList.innerHTML = "";
    starredList.innerHTML = "";

    hold.pinnedPills.forEach((label) => {
      const li = document.createElement("li");
      li.className = "quick-chip";
      li.textContent = label;
      pinnedList.appendChild(li);
    });

    hold.starredResources.forEach((entry) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = "quick-chip resource";
      a.href = entry.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = entry.label;
      li.appendChild(a);
      starredList.appendChild(li);
    });

    const hasAny = hold.pinnedPills.size > 0 || hold.starredResources.size > 0;
    tray.hidden = !hasAny;
    tray.setAttribute("aria-hidden", hasAny ? "false" : "true");
  }

  function flashResourceGroupByIndex(idx) {
    const groups = $$(".resource-group");
    if (!groups.length) return;
    const target = groups[Math.abs(idx) % groups.length];
    target.classList.remove("hold-flash");
    requestAnimationFrame(() => {
      target.classList.add("hold-flash");
    });
    setTimeout(() => {
      target.classList.remove("hold-flash");
    }, 620);
  }

  function startOrbitTrail() {
    const hold = ensureState();
    if (hold.orbitTrailWired) return;
    hold.orbitTrailWired = true;

    const handler = (e) => {
      if (Date.now() > hold.orbitModeUntil) return;
      const x = e.clientX;
      const y = e.clientY;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const dot = document.createElement("span");
      dot.className = "hold-orbit-dot";
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 700);
    };

    hold.orbitTrailHandler = handler;
    window.addEventListener("pointermove", handler);
  }

  function stopOrbitTrail() {
    const hold = ensureState();
    if (!hold.orbitTrailHandler) return;
    window.removeEventListener("pointermove", hold.orbitTrailHandler);
    hold.orbitTrailHandler = null;
    hold.orbitTrailWired = false;
  }

  function toggleOrbitMode() {
    const hold = ensureState();
    const enabled = Date.now() < hold.orbitModeUntil;
    if (enabled) {
      hold.orbitModeUntil = 0;
      document.body.classList.remove("orbit-cursor");
      stopOrbitTrail();
      notify("holdOrbitOff", "Orbit cursor mode off.");
      return;
    }

    hold.orbitModeUntil = Date.now() + 20000;
    document.body.classList.add("orbit-cursor");
    startOrbitTrail();
    APP.api.playHoldMotif?.("pulse");
    notify("holdOrbitOn", "Orbit cursor mode for 20s.");
    setTimeout(() => {
      if (Date.now() >= hold.orbitModeUntil) {
        document.body.classList.remove("orbit-cursor");
        stopOrbitTrail();
      }
    }, 20100);
  }

  function clearGameLayer() {
    const layer = APP.refs.holdGameLayer;
    const ui = APP.refs.holdGameUi;
    const orbs = APP.refs.holdGameOrbs;
    const canvas = APP.refs.holdGameCanvas;

    if (orbs) orbs.innerHTML = "";
    if (ui) ui.textContent = "";
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (layer) {
      layer.classList.remove("active");
      setTimeout(() => {
        if (!layer.classList.contains("active")) {
          layer.hidden = true;
          layer.setAttribute("aria-hidden", "true");
        }
      }, 180);
    }
  }

  function activateGameLayer() {
    ensureRefs();
    const layer = APP.refs.holdGameLayer;
    if (!layer) return;
    layer.hidden = false;
    layer.setAttribute("aria-hidden", "false");
    layer.classList.add("active");
  }

  function sizeGameCanvas() {
    const canvas = APP.refs.holdGameCanvas;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function stopActiveGame() {
    const hold = ensureState();
    const game = hold.activeGame;
    if (!game) return;

    if (game.timers) {
      game.timers.forEach((id) => clearInterval(id));
      game.timers.forEach((id) => clearTimeout(id));
    }
    if (game.raf) cancelAnimationFrame(game.raf);
    if (typeof game.cleanup === "function") game.cleanup();

    dispatch("pcarioca:hold:game-end", { kind: game.kind, score: game.score || 0 });
    hold.activeGame = null;
    APP.state.holdGameState = null;
    clearGameLayer();
  }

  function setGameUi(text) {
    if (!APP.refs.holdGameUi) return;
    APP.refs.holdGameUi.textContent = text;
  }

  function startLegacyOrbCatchGame() {
    stopActiveGame();
    activateGameLayer();
    sizeGameCanvas();

    const hold = ensureState();
    const layer = APP.refs.holdGameLayer;
    const canvas = APP.refs.holdGameCanvas;
    const ui = APP.refs.holdGameUi;
    if (!layer || !canvas || !ui) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const readBest = () => {
      try { return Number(localStorage.getItem("debugSystemBest") || 0); } catch { return 0; }
    };
    const writeBest = (value) => {
      try { localStorage.setItem("debugSystemBest", String(value)); } catch { /* preference storage is optional */ }
    };
    const game = {
      kind: "debug-system",
      score: 0,
      best: readBest(),
      level: 1,
      phase: "ready",
      packets: [],
      keys: new Set(),
      player: { x: window.innerWidth / 2, y: window.innerHeight - 92, size: 24 },
      lastFrame: 0,
      spawnElapsed: 0,
      raf: 0,
      cleanup: null
    };
    const gameText = (key, fallback) => t(key, fallback);
    hold.activeGame = game;
    APP.state.holdGameState = game;
    dispatch("pcarioca:hold:game-start", { kind: game.kind });

    const renderUi = () => {
      const action = game.phase === "ready" ? gameText("debugGameStart", "Start") : gameText("debugGameRestart", "Restart");
      const status = game.phase === "over" ? gameText("debugGameCorrupted", "SYSTEM CORRUPTED") : gameText("debugGameHelp", "Collect blue packets. Avoid red bugs. Use ← → or A / D.");
      ui.innerHTML = `<div class="debug-game-title">${gameText("debugGameTitle", "DEBUG THE SYSTEM")}</div><div class="debug-game-score">${gameText("debugGameScore", "Score")} ${game.score} · ${gameText("debugGameBest", "Best")} ${game.best} · ${gameText("debugGameLevel", "Level")} ${game.level}</div><div class="debug-game-help">${status}</div><div class="debug-game-actions"><button type="button" data-debug-action="start">${action}</button><button type="button" data-debug-action="left" aria-label="${gameText("debugGameMoveLeft", "Move left")}">←</button><button type="button" data-debug-action="right" aria-label="${gameText("debugGameMoveRight", "Move right")}">→</button><button type="button" data-debug-action="exit">${gameText("debugGameExit", "Exit")}</button></div>`;
    };
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "rgba(3, 8, 16, .58)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.strokeStyle = "rgba(96,165,250,.13)";
      ctx.lineWidth = 1;
      for (let x = 0; x < window.innerWidth; x += 42) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, window.innerHeight); ctx.stroke(); }
      for (let y = 0; y < window.innerHeight; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(window.innerWidth, y); ctx.stroke(); }
      game.packets.forEach((packet) => {
        ctx.fillStyle = packet.bad ? "rgba(248,113,113,.92)" : "rgba(96,165,250,.92)";
        ctx.fillRect(packet.x - packet.size / 2, packet.y - packet.size / 2, packet.size, packet.size);
        ctx.strokeStyle = packet.bad ? "rgba(254,202,202,.9)" : "rgba(224,242,254,.9)";
        ctx.strokeRect(packet.x - packet.size / 2, packet.y - packet.size / 2, packet.size, packet.size);
      });
      ctx.fillStyle = "rgba(16,185,129,.96)";
      ctx.fillRect(game.player.x - game.player.size / 2, game.player.y - game.player.size / 2, game.player.size, game.player.size);
      ctx.strokeStyle = "rgba(236,253,245,.95)";
      ctx.strokeRect(game.player.x - game.player.size / 2, game.player.y - game.player.size / 2, game.player.size, game.player.size);
    };
    const reset = () => {
      game.score = 0;
      game.level = 1;
      game.packets = [];
      game.spawnElapsed = 0;
      game.player.x = window.innerWidth / 2;
      game.player.y = window.innerHeight - 92;
      game.phase = "running";
      game.lastFrame = performance.now();
      renderUi();
      APP.api.playHoldMotif?.("game");
    };
    const end = () => {
      game.phase = "over";
      game.keys.clear();
      game.best = Math.max(game.best, game.score);
      writeBest(game.best);
      renderUi();
      notify("holdOrbGameEnd", `Debug score: ${game.score}`);
    };
    const step = (now) => {
      const dt = Math.min(48, now - game.lastFrame || 16);
      game.lastFrame = now;
      if (game.phase === "running") {
        const direction = (game.keys.has("arrowright") || game.keys.has("d")) - (game.keys.has("arrowleft") || game.keys.has("a"));
        game.player.x = clamp(game.player.x + direction * (0.34 * dt), 24, window.innerWidth - 24);
        game.level = 1 + Math.floor(game.score / 6);
        game.spawnElapsed += dt;
        const spawnEvery = Math.max(260, 760 - (game.level * 55));
        if (game.spawnElapsed >= spawnEvery) {
          game.spawnElapsed = 0;
          game.packets.push({ x: 22 + Math.random() * Math.max(20, window.innerWidth - 44), y: 72, size: 14 + Math.random() * 8, speed: 0.10 + game.level * 0.026, bad: Math.random() < Math.min(.34, .12 + game.level * .025) });
        }
        game.packets.forEach((packet) => { packet.y += packet.speed * dt; });
        game.packets = game.packets.filter((packet) => packet.y < window.innerHeight + 36);
        for (let i = game.packets.length - 1; i >= 0; i -= 1) {
          const packet = game.packets[i];
          const hit = Math.abs(packet.x - game.player.x) < (packet.size + game.player.size) / 2 && Math.abs(packet.y - game.player.y) < (packet.size + game.player.size) / 2;
          if (!hit) continue;
          game.packets.splice(i, 1);
          if (packet.bad) { end(); break; }
          game.score += 1;
          APP.api.playPianoSample?.("./audio/g4.mp3", { volume: 0.11 });
          renderUi();
        }
      }
      draw();
      game.raf = requestAnimationFrame(step);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); stopActiveGame(); return; }
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(key) && game.phase === "running") {
        event.preventDefault();
        game.keys.add(key);
      }
    };
    const onKeyUp = (event) => game.keys.delete(event.key.toLowerCase());
    const onUiClick = (event) => {
      const button = event.target.closest("[data-debug-action]");
      if (!button) return;
      const action = button.dataset.debugAction;
      if (action === "start") reset();
      if (action === "exit") stopActiveGame();
      if (action === "left" && game.phase === "running") game.player.x = clamp(game.player.x - 42, 24, window.innerWidth - 24);
      if (action === "right" && game.phase === "running") game.player.x = clamp(game.player.x + 42, 24, window.innerWidth - 24);
    };
    const onResize = () => sizeGameCanvas();
    const onVisibilityChange = () => {
      if (document.hidden) stopActiveGame();
    };
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    ui.addEventListener("click", onUiClick);
    game.cleanup = () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      ui.removeEventListener("click", onUiClick);
    };
    renderUi();
    draw();
    game.raf = requestAnimationFrame(step);
  }

  function startOrbCatchGame() {
    stopActiveGame();
    activateGameLayer();

    const hold = ensureState();
    const layer = APP.refs.holdGameLayer;
    const ui = APP.refs.holdGameUi;
    if (!layer || !ui) return;

    const game = {
      kind: "d-latch",
      placed: { not: false, upper: false, lower: false, norUpper: false, norLower: false },
      selectedGate: null,
      d: 0,
      enabled: 0,
      q: 0,
      cleanup: null
    };
    const text = (key, fallback) => t(key, fallback);
    const slotGate = { not: "not", upper: "and", lower: "and", norUpper: "nor", norLower: "nor" };
    let restoreOverflow = "";
    const previousFocus = document.activeElement;

    hold.activeGame = game;
    APP.state.holdGameState = game;
    layer.classList.add("latch-open");
    restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dispatch("pcarioca:hold:game-start", { kind: game.kind });

    const signalClass = (on) => on ? " is-high" : "";
    const wire = (name, path, on) => `<path class="latch-wire${signalClass(on)}" data-wire="${name}" d="${path}" />`;
    const node = (x, y, on) => `<circle class="latch-node${signalClass(on)}" cx="${x}" cy="${y}" r="4" />`;
    const notGate = (x, y, placed) => placed
      ? `<g class="latch-gate-svg"><path d="M ${x} ${y} L ${x} ${y + 48} L ${x + 48} ${y + 24} Z"/><circle cx="${x + 55}" cy="${y + 24}" r="6"/><text x="${x + 17}" y="${y + 30}">NOT</text></g>`
      : `<rect class="latch-slot-svg" x="${x - 8}" y="${y - 8}" width="76" height="64" rx="8"/><text class="latch-slot-label" x="${x + 18}" y="${y + 31}">NOT</text>`;
    const andGate = (x, y, placed, label) => placed
      ? `<g class="latch-gate-svg"><path d="M ${x} ${y} H ${x + 32} A 30 30 0 0 1 ${x + 32} ${y + 60} H ${x} Z"/><text x="${x + 10}" y="${y + 36}">AND</text></g>`
      : `<rect class="latch-slot-svg" x="${x - 8}" y="${y - 8}" width="76" height="66" rx="8"/><text class="latch-slot-label" x="${x + 14}" y="${y + 32}">${label}</text>`;
    const norGate = (x, y, placed) => placed
      ? `<g class="latch-gate-svg latch-fixed-gate"><path d="M ${x} ${y} Q ${x + 20} ${y + 25} ${x} ${y + 50} Q ${x + 48} ${y + 50} ${x + 58} ${y + 25} Q ${x + 48} ${y} ${x} ${y} Z"/><circle cx="${x + 64}" cy="${y + 25}" r="5"/><text x="${x + 15}" y="${y + 30}">NOR</text></g>`
      : `<rect class="latch-slot-svg" x="${x - 8}" y="${y - 8}" width="82" height="66" rx="8"/><text class="latch-slot-label" x="${x + 17}" y="${y + 31}">NOR</text>`;

    const isComplete = () => game.placed.not && game.placed.upper && game.placed.lower && game.placed.norUpper && game.placed.norLower;
    const syncLatch = () => {
      if (game.enabled) game.q = game.d;
    };
    const play = (src, volume = 0.12) => APP.api.playPianoSample?.(src, { volume });

    const circuitSvg = () => {
      const dn = Number(!game.d);
      const r = Number(game.enabled && dn);
      const s = Number(game.enabled && game.d);
      const qbar = Number(!game.q);
      return `<svg class="latch-circuit" viewBox="0 0 760 340" role="img" aria-label="Gated D latch schematic. D is ${game.d}; Enable is ${game.enabled}; Q is ${game.q}; Q bar is ${qbar}.">
        <text class="latch-signal-label" x="14" y="96">D</text>
        <text class="latch-signal-label" x="14" y="176">E</text>
        ${wire("d", "M 55 90 H 280 V 104 H 320 M 130 90 V 234 H 180", game.d)}
        ${wire("enable-upper", "M 55 170 H 122 M 138 170 H 260 V 146 H 320", game.enabled)}
        ${wire("enable-bridge", "M 122 170 C 126 162 134 162 138 170", game.enabled)}
        ${wire("enable-lower", "M 260 170 V 276 H 320", game.enabled)}
        ${wire("not-d", "M 241 234 H 320", dn)}
        ${wire("s", "M 382 120 H 440 V 104 H 480", s)}
        ${wire("r", "M 382 250 H 440 V 254 H 480", r)}
        ${wire("cross-q", "M 549 115 H 610 V 210 H 450 V 276 H 480", game.q)}
        ${wire("cross-qbar", "M 549 265 H 650 V 55 H 430 V 126 H 480", qbar)}
        ${wire("q", "M 549 115 H 690", game.q)}
        ${wire("qbar", "M 549 265 H 690", qbar)}
        ${node(55, 90, game.d)}${node(55, 170, game.enabled)}${node(130, 90, game.d)}${node(260, 170, game.enabled)}${node(690, 115, game.q)}${node(690, 265, qbar)}
        ${notGate(180, 210, game.placed.not)}
        ${andGate(320, 90, game.placed.upper, "AND")}
        ${andGate(320, 220, game.placed.lower, "AND")}
        ${norGate(480, 90, game.placed.norUpper)}${norGate(480, 240, game.placed.norLower)}
        <text class="latch-output-label" x="704" y="121">Q</text><text class="latch-output-label" x="704" y="271">Q̅</text>
        <text class="latch-net-label" x="274" y="221">D̅</text><text class="latch-net-label" x="418" y="98">S</text><text class="latch-net-label" x="418" y="248">R</text>
      </svg>`;
    };

    const render = () => {
      const complete = isComplete();
      const qbar = Number(!game.q);
      const status = complete ? text("latchComplete", "Circuit complete. Try it.") : text("latchPrompt", "Place the three gates, then test the latch.");
      ui.innerHTML = `<div class="latch-modal" role="dialog" aria-modal="true" aria-labelledby="latchTitle" aria-describedby="latchInstructions" tabindex="-1">
        <header class="latch-modal-head"><div><h2 id="latchTitle">${text("latchTitle", "Build the D Latch")}</h2><p id="latchInstructions">${text("latchSubtitle", "Drag the logic gates into place, then test D and Enable.")}</p></div><button class="latch-close" type="button" data-latch-action="close" aria-label="${text("latchClose", "Close D latch puzzle")}">×</button></header>
        <div class="latch-body">
          <section class="latch-tray" aria-label="${text("latchTray", "Gate tray")}"><h3>${text("latchTray", "Gate tray")}</h3>
            <button type="button" class="latch-gate${game.placed.not ? " is-placed" : ""}${game.selectedGate === "not" ? " is-selected" : ""}" data-latch-gate="not" draggable="${!game.placed.not}" ${game.placed.not ? "disabled" : ""} aria-pressed="${game.selectedGate === "not"}"><span class="latch-mini not">▷○</span>NOT</button>
            <button type="button" class="latch-gate${game.placed.upper ? " is-placed" : ""}${game.selectedGate === "and-1" ? " is-selected" : ""}" data-latch-gate="and-1" draggable="${!game.placed.upper}" ${game.placed.upper ? "disabled" : ""} aria-pressed="${game.selectedGate === "and-1"}"><span class="latch-mini">D</span>AND</button>
            <button type="button" class="latch-gate${game.placed.lower ? " is-placed" : ""}${game.selectedGate === "and-2" ? " is-selected" : ""}" data-latch-gate="and-2" draggable="${!game.placed.lower}" ${game.placed.lower ? "disabled" : ""} aria-pressed="${game.selectedGate === "and-2"}"><span class="latch-mini">D</span>AND</button>
            <button type="button" class="latch-gate${game.placed.norUpper ? " is-placed" : ""}${game.selectedGate === "nor-1" ? " is-selected" : ""}" data-latch-gate="nor-1" draggable="${!game.placed.norUpper}" ${game.placed.norUpper ? "disabled" : ""} aria-pressed="${game.selectedGate === "nor-1"}"><span class="latch-mini">N</span>NOR</button>
            <button type="button" class="latch-gate${game.placed.norLower ? " is-placed" : ""}${game.selectedGate === "nor-2" ? " is-selected" : ""}" data-latch-gate="nor-2" draggable="${!game.placed.norLower}" ${game.placed.norLower ? "disabled" : ""} aria-pressed="${game.selectedGate === "nor-2"}"><span class="latch-mini">N</span>NOR</button>
          </section>
          <section class="latch-schematic" aria-label="${text("latchCircuit", "D latch circuit")}">
            <div class="latch-drop-layer">
              <button type="button" class="latch-slot slot-not${game.placed.not ? " is-filled" : ""}" data-latch-slot="not" aria-label="${text("latchNotSlot", "NOT gate position")}" ${game.placed.not ? "disabled" : ""}></button>
              <button type="button" class="latch-slot slot-upper${game.placed.upper ? " is-filled" : ""}" data-latch-slot="upper" aria-label="${text("latchUpperSlot", "Upper AND gate position")}" ${game.placed.upper ? "disabled" : ""}></button>
              <button type="button" class="latch-slot slot-lower${game.placed.lower ? " is-filled" : ""}" data-latch-slot="lower" aria-label="${text("latchLowerSlot", "Lower AND gate position")}" ${game.placed.lower ? "disabled" : ""}></button>
              <button type="button" class="latch-slot slot-nor-upper${game.placed.norUpper ? " is-filled" : ""}" data-latch-slot="norUpper" aria-label="Upper NOR gate position" ${game.placed.norUpper ? "disabled" : ""}></button>
              <button type="button" class="latch-slot slot-nor-lower${game.placed.norLower ? " is-filled" : ""}" data-latch-slot="norLower" aria-label="Lower NOR gate position" ${game.placed.norLower ? "disabled" : ""}></button>
            </div>${circuitSvg()}
          </section>
        </div>
        <footer class="latch-footer"><p class="latch-status" aria-live="polite">${status}</p><div class="latch-controls"><button type="button" data-latch-action="toggle-d" ${complete ? "" : "disabled"} aria-label="${text("latchToggleD", "Toggle D")}: ${game.d}">${text("latchD", "D")}: <strong>${game.d}</strong></button><button type="button" data-latch-action="toggle-enable" ${complete ? "" : "disabled"} aria-label="${text("latchToggleEnable", "Toggle Enable")}: ${game.enabled}">${text("latchEnable", "Enable")}: <strong>${game.enabled}</strong></button></div><div class="latch-leds" aria-label="${text("latchOutputs", "Latch outputs")}"><span>Q: ${game.q}<i class="latch-led${game.q ? " is-on" : ""}"></i></span><span>Q̅: ${qbar}<i class="latch-led${qbar ? " is-on" : ""}"></i></span></div></footer>
      </div>`;
    };

    const reject = (slot) => {
      slot?.classList.add("latch-reject");
      setTimeout(() => slot?.classList.remove("latch-reject"), 280);
      play("./audio/d4.mp3", 0.08);
    };
    const placeGate = (gateId, slotId, slot) => {
      const gateType = gateId === "not" ? "not" : gateId.startsWith("nor") ? "nor" : "and";
      if (slotGate[slotId] !== gateType || game.placed[slotId]) return reject(slot);
      game.placed[slotId] = true;
      game.selectedGate = null;
      play("./audio/g4.mp3", 0.1);
      render();
      if (isComplete()) play("./audio/e4.mp3", 0.1);
    };
    const onUiClick = (event) => {
      const close = event.target.closest("[data-latch-action='close']");
      if (close) { stopActiveGame(); return; }
      const gate = event.target.closest("[data-latch-gate]");
      if (gate && !gate.disabled) { game.selectedGate = gate.dataset.latchGate; render(); return; }
      const slot = event.target.closest("[data-latch-slot]");
      if (slot) { if (game.selectedGate) placeGate(game.selectedGate, slot.dataset.latchSlot, slot); else reject(slot); return; }
      const action = event.target.closest("[data-latch-action]")?.dataset.latchAction;
      if (action === "toggle-d" && isComplete()) { game.d = Number(!game.d); syncLatch(); play("./audio/e4.mp3", 0.08); render(); }
      if (action === "toggle-enable" && isComplete()) { game.enabled = Number(!game.enabled); syncLatch(); play("./audio/f4.mp3", 0.08); render(); }
    };
    const onDragStart = (event) => {
      const gate = event.target.closest("[data-latch-gate]");
      if (!gate || gate.disabled) return;
      event.dataTransfer?.setData("text/plain", gate.dataset.latchGate);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      game.selectedGate = gate.dataset.latchGate;
    };
    const onDragOver = (event) => {
      if (event.target.closest("[data-latch-slot]")) event.preventDefault();
    };
    const onDrop = (event) => {
      const slot = event.target.closest("[data-latch-slot]");
      if (!slot) return;
      event.preventDefault();
      placeGate(event.dataTransfer?.getData("text/plain") || game.selectedGate, slot.dataset.latchSlot, slot);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); stopActiveGame(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...ui.querySelectorAll("button:not([disabled])")];
      if (!focusable.length) return;
      const index = focusable.indexOf(document.activeElement);
      if (index === -1) { event.preventDefault(); focusable[0].focus(); return; }
      if (event.shiftKey && index <= 0) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
      if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
    };
    const onVisibilityChange = () => { if (document.hidden) stopActiveGame(); };

    ui.addEventListener("click", onUiClick);
    ui.addEventListener("dragstart", onDragStart);
    ui.addEventListener("dragover", onDragOver);
    ui.addEventListener("drop", onDrop);
    window.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    game.cleanup = () => {
      ui.removeEventListener("click", onUiClick);
      ui.removeEventListener("dragstart", onDragStart);
      ui.removeEventListener("dragover", onDragOver);
      ui.removeEventListener("drop", onDrop);
      window.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.body.style.overflow = restoreOverflow;
      layer.classList.remove("latch-open");
      previousFocus?.focus?.();
    };
    render();
    requestAnimationFrame(() => ui.querySelector(".latch-close")?.focus());
  }

  function startTraceGame() {
    stopActiveGame();
    activateGameLayer();
    sizeGameCanvas();

    const hold = ensureState();
    const layer = APP.refs.holdGameLayer;
    const canvas = APP.refs.holdGameCanvas;
    if (!layer || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodes = new Array(12).fill(0).map(() => ({
      x: 30 + Math.random() * Math.max(40, window.innerWidth - 60),
      y: 100 + Math.random() * Math.max(40, window.innerHeight - 160),
      hit: false
    }));
    const path = [];

    const game = {
      kind: "constellation-trace",
      score: 0,
      timeLeft: 8,
      timers: [],
      raf: 0,
      pointerX: -9999,
      pointerY: -9999,
      cleanup: null
    };
    hold.activeGame = game;
    APP.state.holdGameState = game;
    dispatch("pcarioca:hold:game-start", { kind: game.kind });
    APP.api.playHoldMotif?.("game", 1);
    notify("holdTraceGameStart", "Constellation Trace started.");

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (path.length > 1) {
        ctx.strokeStyle = "rgba(96,165,250,.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i += 1) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      }

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.hit ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = node.hit ? "rgba(167,139,250,.92)" : "rgba(255,255,255,.75)";
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(game.pointerX, game.pointerY, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(16,185,129,.56)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      game.raf = requestAnimationFrame(draw);
    };

    const onPointer = (x, y) => {
      game.pointerX = x;
      game.pointerY = y;

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.hit) continue;
        const dx = x - node.x;
        const dy = y - node.y;
        if ((dx * dx) + (dy * dy) <= (32 * 32)) {
          node.hit = true;
          game.score += 1;
          path.push({ x: node.x, y: node.y });
          APP.api.playHoldChargeTick?.(Math.min(1, game.score / nodes.length));
          break;
        }
      }
    };

    const pointerHandler = (e) => {
      onPointer(e.clientX, e.clientY);
    };
    const touchHandler = (e) => {
      const touch = e.touches?.[0];
      if (!touch) return;
      onPointer(touch.clientX, touch.clientY);
    };

    layer.addEventListener("pointermove", pointerHandler);
    layer.addEventListener("touchmove", touchHandler, { passive: true });
    game.cleanup = () => {
      layer.removeEventListener("pointermove", pointerHandler);
      layer.removeEventListener("touchmove", touchHandler);
    };

    const tickUi = () => {
      setGameUi(`${t("holdTraceGameStart", "Constellation Trace")} · ${game.timeLeft}s · ${game.score}`);
    };

    tickUi();
    draw();

    const timerInterval = setInterval(() => {
      game.timeLeft -= 1;
      tickUi();
      if (game.timeLeft <= 0) {
        clearInterval(timerInterval);
        notify("holdTraceGameEnd", `Trace score: ${game.score}`);
        stopActiveGame();
      }
    }, 1000);
    game.timers.push(timerInterval);
  }

  function startInspectionCountdown() {
    stopActiveGame();
    activateGameLayer();
    sizeGameCanvas();

    const hold = ensureState();
    const game = {
      kind: "inspection",
      score: 0,
      timeLeft: 15,
      timers: []
    };
    hold.activeGame = game;
    APP.state.holdGameState = game;
    dispatch("pcarioca:hold:game-start", { kind: game.kind });
    notify("holdInspectionStart", "Inspection timer started.");

    const tickUi = () => {
      setGameUi(`${t("holdInspectionStart", "Inspection")} · ${game.timeLeft}s`);
    };

    tickUi();
    const timerInterval = setInterval(() => {
      game.timeLeft -= 1;
      APP.api.playHoldChargeTick?.(1 - (game.timeLeft / 15));
      tickUi();
      if (game.timeLeft <= 0) {
        clearInterval(timerInterval);
        notify("holdInspectionEnd", "Inspection complete.");
        stopActiveGame();
      }
    }, 1000);
    game.timers.push(timerInterval);
  }

  function runSectionMemoryPulse(sectionEl) {
    if (!sectionEl) return;
    const pills = [...sectionEl.querySelectorAll(".left-whoami-pill")];
    if (!pills.length) return;
    pills.forEach((pill, idx) => {
      setTimeout(() => {
        pill.classList.add("hold-memory-pulse");
        APP.api.playHoldChargeTick?.((idx + 1) / pills.length);
        setTimeout(() => pill.classList.remove("hold-memory-pulse"), 260);
      }, idx * 140);
    });
  }

  function runRhythmPulse(sectionEl) {
    if (!sectionEl) return;
    sectionEl.classList.add("hold-rhythm-pulse");
    APP.api.playHoldMotif?.("pulse", 3);
    setTimeout(() => {
      sectionEl.classList.remove("hold-rhythm-pulse");
    }, 3200);
  }

  function refreshHoldSoundProfile() {
    const hold = ensureState();
    APP.state.holdSoundProfile = hold.holdSoundProfile;
  }

  function toggleHoldSoundProfile() {
    const hold = ensureState();
    hold.holdSoundProfile = hold.holdSoundProfile === "classic" ? "arcade" : "classic";
    refreshHoldSoundProfile();
    if (hold.holdSoundProfile === "classic") {
      notify("holdSoundClassic", "Hold sound profile: classic.");
    } else {
      notify("holdSoundArcade", "Hold sound profile: arcade.");
    }
    APP.api.playHoldMotif?.("utility", hold.holdSoundProfile === "arcade" ? 2 : 0);
  }

  function setAccentFromKey(el, key) {
    if (!el) return;
    const hue = hashString(key) % 360;
    const color = `hsla(${hue}, 85%, 65%, .32)`;
    el.style.setProperty("--hold-glow", color);
    setTimeout(() => {
      el.style.removeProperty("--hold-glow");
    }, 1500);
  }

  function resourceEntryFromKey(resourceKey, target) {
    const url = APP.data.CONFIG?.resourceLinks?.[resourceKey] || target?.href || "";
    const label = target?.textContent?.trim() || resourceKey;
    return { key: resourceKey, url, label };
  }

  async function handleResourceHold(holdKey, target) {
    const hold = ensureState();
    const resourceKey = holdKey.split(":")[1] || "";
    const entry = resourceEntryFromKey(resourceKey, target);
    if (!entry.url) return;

    await copyText(entry.url, "holdResumeCopied", "Resource URL copied.");

    if (hold.starredResources.has(resourceKey)) {
      hold.starredResources.delete(resourceKey);
      notify("holdResourceUnstarred", "Resource removed from quick tray.");
    } else {
      hold.starredResources.set(resourceKey, entry);
      notify("holdResourceStarred", "Resource added to quick tray.");
    }
    APP.api.playHoldMotif?.("star", hashString(resourceKey));
    updateQuickTray();
  }

  async function handleBulletHold(holdKey, target) {
    const idx = Number(holdKey.split(":")[1] || 0);
    const text = target?.textContent?.trim() || "";
    await copyText(text, "holdBulletCopied", "Bullet copied.");
    flashResourceGroupByIndex(idx);
    APP.api.playHoldMotif?.("utility", idx);
  }

  function handleTagHold(holdKey, target) {
    const hold = ensureState();
    if (!target) return;

    if (hold.tagFilters.has(holdKey)) {
      hold.tagFilters.delete(holdKey);
      notify("holdTagFilterOff", "Tag filter removed.");
    } else {
      hold.tagFilters.set(holdKey, target.textContent || holdKey);
      notify("holdTagFilterOn", "Tag filter applied.");
    }

    setAccentFromKey(target, holdKey);
    target.style.borderColor = `hsla(${hashString(holdKey) % 360}, 85%, 66%, .45)`;
    setTimeout(() => target.style.removeProperty("border-color"), 500);
    APP.api.playPianoSample?.(noteByKey(holdKey), { volume: 0.24 });
    applyTagFilters();
  }

  function handlePillHold(holdKey, target) {
    const hold = ensureState();
    const label = target?.textContent?.trim() || holdKey;

    if (hold.pinnedPills.has(holdKey)) {
      hold.pinnedPills.delete(holdKey);
      notify("holdPillUnpinned", "Pill removed from quick tray.");
    } else {
      hold.pinnedPills.set(holdKey, label);
      notify("holdPillPinned", "Pill pinned.");
    }

    APP.api.playPianoSample?.(noteByKey(holdKey), { volume: 0.24, playbackRate: 1.02 });
    updateQuickTray();
  }

  function handleSectionHold(holdKey, target) {
    const idx = Number(holdKey.split(":")[1] || 0);
    const section = target?.closest(".left-whoami-section");
    if (idx === 0) {
      runSectionMemoryPulse(section);
      APP.api.playHoldMotif?.("utility", 0);
      return;
    }
    if (idx === 1) {
      APP.api.startMatrixMode?.(4200);
      APP.api.playHoldMotif?.("pulse", 1);
      return;
    }
    if (idx === 2) {
      document.body.classList.add("hold-color-morph");
      APP.api.playHoldMotif?.("pulse", 2);
      setTimeout(() => {
        document.body.classList.remove("hold-color-morph");
      }, 6200);
      return;
    }
    runRhythmPulse(section);
  }

  function holdLabelForKey(key, target) {
    if (!key) return t("holdHudDefault", "Hold...");
    if (key.startsWith("tag:")) return target?.textContent?.trim() || "Tag action";
    if (key.startsWith("whoami-pill:")) return target?.textContent?.trim() || "Pin pill";
    if (key.startsWith("whoami-section:")) return target?.textContent?.trim() || "Section action";
    if (key.startsWith("resource:")) return target?.textContent?.trim() || "Resource action";
    if (key.startsWith("bullet:")) return "Bullet action";
    if (key === "card") return t("holdOrbGameStart", "Start Orb Catch");
    if (key === "bg") return t("holdTraceGameStart", "Start Constellation Trace");
    if (key === "btnWca") return t("holdInspectionStart", "Inspection timer");
    if (key === "audioPill") return "Toggle hold audio profile";
    if (key.startsWith("lang:")) return `Switch to ${key.slice(5).toUpperCase()}`;
    return target?.getAttribute("aria-label") || target?.textContent?.trim() || t("holdHudDefault", "Hold...");
  }

  function classifyActionType(key) {
    if (key === "card" || key === "bg") return "game";
    if (key === "btnWca") return "game";
    return "utility";
  }

  async function triggerHoldAction(holdKey, ctx = {}) {
    const hold = ensureState();
    const key = String(holdKey || "");
    const target = ctx.target || document.querySelector(`[data-hold-key="${key}"]`);

    if (!key) return { actionType: "utility" };

    if (key === "btnGithub") {
      await copyText(APP.data.CONFIG?.links?.github || "", "holdGithubCopied", "GitHub link copied.");
      pulseBodyClass("hold-blue-sweep", 520);
      APP.api.playHoldMotif?.("utility", 0);
      return { actionType: "utility" };
    }

    if (key === "btnMail") {
      const draft = MAIL_DRAFTS[hold.mailDraftIndex % MAIL_DRAFTS.length];
      hold.mailDraftIndex += 1;
      const email = APP.data.CONFIG?.email || "";
      const mailto = `mailto:${email}?subject=${encodeURIComponent(draft.subject)}&body=${draft.body}`;
      await copyText(mailto, "holdMailDraftCopied", "Mail draft copied.");
      APP.api.playHoldMotif?.("utility", hold.mailDraftIndex);
      return { actionType: "utility" };
    }

    if (key === "btnWca") {
      APP.api.openScramblePanel?.();
      startInspectionCountdown();
      APP.api.playHoldMotif?.("game", 2);
      return { actionType: "game" };
    }

    if (key === "btnLinkedIn") {
      const url = APP.data.CONFIG?.links?.linkedin || target?.href || "";
      await copyText(url, "holdLinkedInCopied", "LinkedIn link copied.");
      pulseBodyClass("hold-cyan-flash", 520);
      APP.api.playHoldMotif?.("utility", 3);
      return { actionType: "utility" };
    }

    if (key === "audioPill") {
      toggleHoldSoundProfile();
      return { actionType: "utility" };
    }

    if (key === "profileImg") {
      toggleOrbitMode();
      return { actionType: "utility" };
    }

    if (key === "resumeLink") {
      await copyText(APP.data.CONFIG?.cvUrl || "", "holdResumeCopied", "Resume link copied.");
      const center = $(".center");
      const resourcesHeading = $("#resourcesHeading");
      if (center && resourcesHeading) {
        center.scrollTo({
          top: Math.max(0, resourcesHeading.offsetTop - 10),
          behavior: "smooth"
        });
      }
      pulseBodyClass("hold-blue-sweep", 500);
      APP.api.playHoldMotif?.("utility", 4);
      return { actionType: "utility" };
    }

    if (key === "card") {
      startOrbCatchGame();
      return { actionType: "game" };
    }

    if (key === "bg") {
      startTraceGame();
      return { actionType: "game" };
    }

    if (key === "scrambleRegenerate") {
      APP.api.refreshScramble?.();
      APP.api.startMatrixMode?.(2400);
      APP.api.playHoldMotif?.("pulse", 4);
      return { actionType: "utility" };
    }

    if (key === "scrambleCopy") {
      const text = $("#scrambleText")?.textContent || "";
      await copyText(text, "eggScrambleCopied", "Scramble copied.");
      return { actionType: "utility" };
    }

    if (key === "scrambleClose") {
      APP.api.closeScramblePanel?.();
      APP.api.playHoldMotif?.("utility", 5);
      return { actionType: "utility" };
    }

    if (key.startsWith("lang:")) {
      const lang = key.split(":")[1];
      APP.api.setLang?.(lang);
      if (lang === "en") pulseBodyClass("hold-blue-sweep", 520);
      if (lang === "ro") pulseBodyClass("hold-green-burst", 520);
      if (lang === "de") pulseBodyClass("hold-violet-burst", 520);
      APP.api.playHoldMotif?.("lang", hashString(lang));
      return { actionType: "utility" };
    }

    if (key.startsWith("tag:")) {
      handleTagHold(key, target);
      return { actionType: "utility" };
    }

    if (key.startsWith("bullet:")) {
      await handleBulletHold(key, target);
      return { actionType: "utility" };
    }

    if (key.startsWith("resource:")) {
      await handleResourceHold(key, target);
      return { actionType: "utility" };
    }

    if (key.startsWith("whoami-section:")) {
      handleSectionHold(key, target);
      return { actionType: "utility" };
    }

    if (key.startsWith("whoami-pill:")) {
      handlePillHold(key, target);
      return { actionType: "utility" };
    }

    APP.api.playHoldMotif?.("utility", hashString(key));
    pulseBodyClass("hold-blue-sweep", 400);
    notify("holdHudDefault", "Hold action triggered.");
    return { actionType: classifyActionType(key) };
  }

  function getPointFromEvent(e) {
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    if (touch) {
      return { x: touch.clientX, y: touch.clientY, pointerType: "touch" };
    }
    return {
      x: e.clientX,
      y: e.clientY,
      pointerType: e.pointerType || (e.type.startsWith("touch") ? "touch" : "mouse")
    };
  }

  function clearArmingVisual(target) {
    if (!target) return;
    target.dataset.holdArming = "0";
    target.style.removeProperty("--hold-progress");
  }

  function markHoldFired(target) {
    if (!target) return;
    target.dataset.holdFired = "1";
    setTimeout(() => {
      if (target.dataset.holdFired === "1") {
        target.dataset.holdFired = "0";
      }
    }, HOLD_FIRED_MARK_MS);
  }

  function cancelActiveHold(reason = "cancel") {
    const hold = ensureState();
    const active = hold.active;
    if (!active) return;

    clearTimeout(active.timer);
    if (active.raf) cancelAnimationFrame(active.raf);
    clearArmingVisual(active.target);
    hideHud();
    hold.active = null;

    if (reason === "fire") return;
  }

  function fireActiveHold() {
    const hold = ensureState();
    const active = hold.active;
    if (!active) return;
    if (active.fired) return;
    active.fired = true;

    clearArmingVisual(active.target);
    markHoldFired(active.target);
    hideHud();

    const actionType = classifyActionType(active.key);
    vibrate(actionType === "game" ? HOLD_GAME_VIBRATE : HOLD_UTILITY_VIBRATE);
    dispatch("pcarioca:hold:triggered", { key: active.key, actionType });

    Promise.resolve(triggerHoldAction(active.key, {
      target: active.target,
      pointerType: active.pointerType,
      source: "hold"
    }))
      .catch((err) => {
        console.warn("[app] Hold action failed", active.key, err);
      })
      .finally(() => {
        cancelActiveHold("fire");
      });
  }

  function armProgressLoop() {
    const hold = ensureState();
    const active = hold.active;
    if (!active) return;

    const elapsed = performance.now() - active.startedAt;
    const progress = clamp(elapsed / HOLD_DELAY_MS, 0, 1);
    active.target.style.setProperty("--hold-progress", String(progress));
    updateHudProgress(progress);
    APP.api.playHoldChargeTick?.(progress);

    if (progress >= 1) {
      fireActiveHold();
      return;
    }
    active.raf = requestAnimationFrame(armProgressLoop);
  }

  function beginHold(target, event) {
    if (!target) return;

    const hold = ensureState();
    cancelActiveHold();

    const point = getPointFromEvent(event);
    const pointerType = point.pointerType || "mouse";

    hold.active = {
      target,
      key: target.dataset.holdKey || "",
      pointerType,
      startedAt: performance.now(),
      startX: point.x,
      startY: point.y,
      fired: false,
      timer: null,
      raf: 0
    };

    target.dataset.holdArming = "1";
    showHud(holdLabelForKey(hold.active.key, target));

    hold.active.timer = setTimeout(() => {
      fireActiveHold();
    }, HOLD_DELAY_MS);
    hold.active.raf = requestAnimationFrame(armProgressLoop);
  }

  function shouldCancelForMovement(event) {
    const hold = ensureState();
    const active = hold.active;
    if (!active) return false;

    const point = getPointFromEvent(event);
    const dx = point.x - active.startX;
    const dy = point.y - active.startY;
    const moved = Math.hypot(dx, dy);
    const tol = active.pointerType === "touch" ? TOUCH_MOVE_TOLERANCE : MOUSE_MOVE_TOLERANCE;
    return moved > tol;
  }

  function onGlobalMove(event) {
    const hold = ensureState();
    if (!hold.active) return;
    if (hold.active.fired) return;
    if (shouldCancelForMovement(event)) {
      cancelActiveHold("move");
    }
  }

  function onGlobalUp() {
    const hold = ensureState();
    if (!hold.active) return;
    if (!hold.active.fired) {
      cancelActiveHold("release");
    }
  }

  function onClickCapture(event) {
    const el = event.target?.closest?.("[data-hold-fired='1']");
    if (!el) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  function onContextMenu(event) {
    const hold = ensureState();
    if (!hold.active) return;
    event.preventDefault();
  }

  function autoAssignHoldKeys() {
    const hold = ensureState();
    const candidates = $$(HOLD_WIRE_SELECTOR);
    candidates.forEach((el, idx) => {
      if (el.dataset.holdKey) return;
      const auto =
        (el.id && `auto:id:${el.id}`) ||
        (el.dataset.lang && `lang:${el.dataset.lang}`) ||
        (el.className && `auto:cls:${String(el.className).split(" ").filter(Boolean).join(".")}:${idx}`) ||
        `auto:${hold.autoKeyCounter += 1}`;
      el.dataset.holdKey = auto;
    });
  }

  function bindHoldTarget(el) {
    if (!el || el.dataset.holdBound === "1") return;
    el.dataset.holdBound = "1";

    const pointerDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      if (el.hidden) return;
      beginHold(el, e);
    };

    el.addEventListener("pointerdown", pointerDown);
    if (!window.PointerEvent) {
      el.addEventListener("mousedown", pointerDown);
      el.addEventListener("touchstart", pointerDown, { passive: true });
    }
  }

  function wireHoldActions() {
    ensureRefs();
    autoAssignHoldKeys();
    $$(HOLD_WIRE_SELECTOR).forEach((el) => bindHoldTarget(el));
    applyTagFilters();
    updateQuickTray();
  }

  function cancelAllHoldModes() {
    const hold = ensureState();
    cancelActiveHold("cancelAll");
    stopActiveGame();

    document.body.classList.remove(
      "hold-blue-sweep",
      "hold-cyan-flash",
      "hold-green-burst",
      "hold-violet-burst",
      "hold-color-morph",
      "orbit-cursor"
    );
    stopOrbitTrail();
    hold.orbitModeUntil = 0;
    hold.tagFilters.clear();
    applyTagFilters();
    hideHud();
  }

  function initHoldActions() {
    const hold = ensureState();
    ensureRefs();
    refreshHoldSoundProfile();

    if (!hold.refsWired) {
      hold.refsWired = true;
      window.addEventListener("pointermove", onGlobalMove, true);
      window.addEventListener("pointerup", onGlobalUp, true);
      window.addEventListener("pointercancel", onGlobalUp, true);
      window.addEventListener("touchmove", onGlobalMove, { passive: true, capture: true });
      window.addEventListener("touchend", onGlobalUp, { capture: true });
      window.addEventListener("touchcancel", onGlobalUp, { capture: true });
      window.addEventListener("mousemove", onGlobalMove, true);
      window.addEventListener("mouseup", onGlobalUp, true);
      document.addEventListener("click", onClickCapture, true);
      document.addEventListener("contextmenu", onContextMenu, true);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cancelAllHoldModes();
      });
    }

    wireHoldActions();
  }

  APP.api.triggerHoldAction = triggerHoldAction;
  APP.api.wireHoldActions = wireHoldActions;
  APP.api.cancelAllHoldModes = cancelAllHoldModes;
  APP.api.initHoldActions = initHoldActions;
})();
