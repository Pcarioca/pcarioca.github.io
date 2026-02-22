(() => {
  const APP = window.PCARIOCA_APP;
  const { $, toast } = APP.helpers;

  const KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  const SCRAMBLE_MOVES = ["U", "D", "L", "R", "F", "B"];
  const SCRAMBLE_SUFFIX = ["", "'", "2"];
  const AXIS = { U: "y", D: "y", L: "x", R: "x", F: "z", B: "z" };
  const MATRIX_CHARS = "01AI[]{}<>/\\";

  function currentLangContent() {
    const lang = APP.state.currentLang || "en";
    return APP.data.content?.[lang] || APP.data.content?.en || {};
  }

  function t(key, fallback = "") {
    const value = currentLangContent()[key];
    return typeof value === "string" ? value : fallback;
  }

  function notify(key, fallback) {
    toast(t(key, fallback));
  }

  function isTypingTarget(target) {
    if (!target) return false;
    if (target.isContentEditable) return true;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  }

  function playPianoRun(samples, stepMs = 95, volume = 0.22) {
    if (!samples?.length || typeof APP.api.playPianoSample !== "function") return;
    samples.forEach((src, idx) => {
      setTimeout(() => {
        APP.api.playPianoSample(src, { volume });
      }, idx * stepMs);
    });
  }

  function setChaosMode(enabled) {
    APP.state.chaosMode = !!enabled;
    document.body.classList.toggle("egg-chaos", APP.state.chaosMode);
  }

  function toggleChaosMode() {
    const willEnable = !APP.state.chaosMode;
    setChaosMode(willEnable);

    if (willEnable) {
      playPianoRun(
        ["./audio/c3.mp3", "./audio/e3.mp3", "./audio/g3.mp3", "./audio/d5.mp3"],
        88,
        0.2
      );
      notify("eggChaosOn", "Chaos mode enabled.");
    } else {
      playPianoRun(
        ["./audio/d5.mp3", "./audio/g3.mp3", "./audio/e3.mp3", "./audio/c3.mp3"],
        82,
        0.18
      );
      notify("eggChaosOff", "Chaos mode disabled.");
    }
  }

  function ensureMatrixState() {
    APP.state.matrixEgg = APP.state.matrixEgg || {
      active: false,
      canvas: null,
      ctx: null,
      fontSize: 14,
      drops: [],
      raf: 0,
      stopTimer: null,
      resizeWired: false
    };
    return APP.state.matrixEgg;
  }

  function resizeMatrix() {
    const matrix = ensureMatrixState();
    if (!matrix.canvas || !matrix.ctx) return;

    matrix.canvas.width = Math.max(320, window.innerWidth);
    matrix.canvas.height = Math.max(320, window.innerHeight);
    const cols = Math.max(12, Math.floor(matrix.canvas.width / matrix.fontSize));
    matrix.drops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * 14));
  }

  function initMatrixCanvas() {
    const matrix = ensureMatrixState();
    if (matrix.canvas && matrix.ctx) return true;

    matrix.canvas = $("#matrixRain");
    if (!matrix.canvas) {
      console.warn("[app] Missing selector: #matrixRain");
      return false;
    }

    matrix.ctx = matrix.canvas.getContext("2d", { alpha: true });
    if (!matrix.ctx) {
      console.warn("[app] Matrix canvas context unavailable");
      return false;
    }

    resizeMatrix();
    if (!matrix.resizeWired) {
      matrix.resizeWired = true;
      window.addEventListener("resize", resizeMatrix);
    }
    return true;
  }

  function stopMatrixMode() {
    const matrix = ensureMatrixState();
    matrix.active = false;

    if (matrix.canvas) matrix.canvas.classList.remove("active");
    if (matrix.stopTimer) clearTimeout(matrix.stopTimer);
    matrix.stopTimer = null;

    if (matrix.raf) {
      cancelAnimationFrame(matrix.raf);
      matrix.raf = 0;
    }
  }

  function matrixFrame() {
    const matrix = ensureMatrixState();
    if (!matrix.active || !matrix.ctx || !matrix.canvas) return;

    const { ctx, canvas, fontSize } = matrix;
    ctx.fillStyle = "rgba(3, 6, 13, .12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(96, 165, 250, .84)";
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

    for (let i = 0; i < matrix.drops.length; i += 1) {
      const ch = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      const x = i * fontSize;
      const y = matrix.drops[i] * fontSize;
      ctx.fillText(ch, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        matrix.drops[i] = 0;
      }
      matrix.drops[i] += 1;
    }

    matrix.raf = requestAnimationFrame(matrixFrame);
  }

  function startMatrixMode(durationMs = 9000) {
    if (!initMatrixCanvas()) return;

    const matrix = ensureMatrixState();
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    matrix.active = true;
    matrix.canvas.classList.add("active");
    if (matrix.stopTimer) clearTimeout(matrix.stopTimer);

    if (!reduceMotion && !matrix.raf) {
      matrix.raf = requestAnimationFrame(matrixFrame);
    }

    matrix.stopTimer = setTimeout(() => {
      stopMatrixMode();
    }, durationMs);

    playPianoRun(["./audio/e4.mp3", "./audio/f4.mp3", "./audio/g4.mp3"], 95, 0.17);
    notify("eggMatrixOn", "VISIONAI mode enabled.");
  }

  function randomMove(prevFace, prevAxis) {
    let move = SCRAMBLE_MOVES[Math.floor(Math.random() * SCRAMBLE_MOVES.length)];
    let axis = AXIS[move];
    while (move === prevFace || axis === prevAxis) {
      move = SCRAMBLE_MOVES[Math.floor(Math.random() * SCRAMBLE_MOVES.length)];
      axis = AXIS[move];
    }
    return move;
  }

  function generateScramble(length = 20) {
    const out = [];
    let prevFace = "";
    let prevAxis = "";
    for (let i = 0; i < length; i += 1) {
      const move = randomMove(prevFace, prevAxis);
      const suffix = SCRAMBLE_SUFFIX[Math.floor(Math.random() * SCRAMBLE_SUFFIX.length)];
      out.push(move + suffix);
      prevFace = move;
      prevAxis = AXIS[move];
    }
    return out.join(" ");
  }

  function refreshScramble() {
    const refs = APP.refs;
    if (!refs.scrambleText) return;
    refs.scrambleText.textContent = generateScramble();
  }

  function openScramblePanel() {
    const refs = APP.refs;
    if (!refs.scramblePanel) return;
    if (!refs.scrambleText?.textContent) refreshScramble();

    refs.scramblePanel.hidden = false;
    refs.scramblePanel.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      refs.scramblePanel.classList.add("show");
    });
    playPianoRun(["./audio/c3.mp3", "./audio/g3.mp3", "./audio/d4.mp3"], 88, 0.18);
  }

  function closeScramblePanel() {
    const refs = APP.refs;
    if (!refs.scramblePanel) return;

    refs.scramblePanel.classList.remove("show");
    refs.scramblePanel.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      if (!refs.scramblePanel.classList.contains("show")) {
        refs.scramblePanel.hidden = true;
      }
    }, 200);
  }

  async function copyScrambleToClipboard() {
    const text = APP.refs.scrambleText?.textContent || "";
    if (!text) return;

    try {
      if (typeof APP.api.copyToClipboard === "function") {
        await APP.api.copyToClipboard(text);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      notify("eggScrambleCopied", "Scramble copied.");
      APP.api.playPianoSample?.("./audio/b5.mp3", { volume: 0.24 });
    } catch (err) {
      console.warn("[app] Scramble copy failed", err);
      toast(text);
    }
  }

  function spawnPaw(x, y) {
    const el = document.createElement("span");
    el.className = "paw-trail";
    el.textContent = "\uD83D\uDC3E";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 920);
  }

  function handlePawMove(clientX, clientY) {
    const now = performance.now();
    if (now - APP.state.lastPawAt < 85) return;
    APP.state.lastPawAt = now;
    spawnPaw(clientX, clientY);
  }

  function pawPointerHandler(e) {
    handlePawMove(e.clientX, e.clientY);
  }

  function pawTouchHandler(e) {
    const touch = e.touches?.[0];
    if (!touch) return;
    handlePawMove(touch.clientX, touch.clientY);
  }

  function stopPawMode() {
    if (!APP.state.pawMode) return;
    APP.state.pawMode = false;

    window.removeEventListener("pointermove", pawPointerHandler);
    window.removeEventListener("touchmove", pawTouchHandler);

    if (APP.state.pawTimer) clearTimeout(APP.state.pawTimer);
    APP.state.pawTimer = null;
  }

  function startPawMode(durationMs = 12000) {
    stopPawMode();
    APP.state.pawMode = true;
    APP.state.lastPawAt = 0;

    window.addEventListener("pointermove", pawPointerHandler);
    window.addEventListener("touchmove", pawTouchHandler, { passive: true });

    APP.state.pawTimer = setTimeout(() => {
      stopPawMode();
    }, durationMs);

    playPianoRun(["./audio/g4.mp3", "./audio/e4.mp3", "./audio/c3.mp3"], 90, 0.2);
    notify("eggPawOn", "Paw trail enabled.");
  }

  function spawnSparkleBurst(x, y, count = 12) {
    for (let i = 0; i < count; i += 1) {
      const node = document.createElement("span");
      node.className = "sparkle-burst";

      const angle = (Math.PI * 2 * i) / count;
      const distance = 10 + Math.random() * 26;
      node.style.left = `${x + Math.cos(angle) * distance}px`;
      node.style.top = `${y + Math.sin(angle) * distance}px`;

      document.body.appendChild(node);
      setTimeout(() => node.remove(), 680);
    }
  }

  function handleMelodyPerfect() {
    const target = $("#leftWhoAmIScroll") || $("#card");
    const rect = target?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth * 0.5;
    const y = rect ? rect.top + Math.min(120, rect.height * 0.4) : window.innerHeight * 0.4;

    spawnSparkleBurst(x, y, 14);
    playPianoRun(["./audio/c3.mp3", "./audio/e4.mp3", "./audio/g4.mp3", "./audio/b5.mp3"], 80, 0.22);
    notify("eggMelodyPerfect", "Perfect melody run.");
  }

  function closeAllEggModes() {
    setChaosMode(false);
    stopMatrixMode();
    stopPawMode();
    closeScramblePanel();
  }

  function bindWcaLongPress() {
    const btn = APP.refs.btnWca || $("#btnWca");
    if (!btn || btn.dataset.eggLongpress === "1") return;
    btn.dataset.eggLongpress = "1";

    let timer = null;
    const start = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        openScramblePanel();
      }, 560);
    };
    const cancel = () => clearTimeout(timer);

    btn.addEventListener("mousedown", start);
    btn.addEventListener("touchstart", start, { passive: true });
    btn.addEventListener("mouseup", cancel);
    btn.addEventListener("mouseleave", cancel);
    btn.addEventListener("touchend", cancel, { passive: true });
    btn.addEventListener("touchcancel", cancel, { passive: true });
  }

  function bindAvatarMultiTap() {
    const avatar = APP.refs.profileImg || $("#profileImg");
    if (!avatar || avatar.dataset.eggTapWired === "1") return;
    avatar.dataset.eggTapWired = "1";

    APP.state.avatarTapCount = 0;
    APP.state.avatarTapTimer = null;

    avatar.addEventListener("touchstart", () => {
      APP.state.avatarTapCount += 1;
      if (APP.state.avatarTapTimer) clearTimeout(APP.state.avatarTapTimer);
      APP.state.avatarTapTimer = setTimeout(() => {
        APP.state.avatarTapCount = 0;
      }, 1200);

      if (APP.state.avatarTapCount >= 4) {
        APP.state.avatarTapCount = 0;
        startPawMode();
      }
    }, { passive: true });
  }

  function initScramblePanelRefs() {
    const refs = APP.refs;
    refs.scramblePanel = $("#scramblePanel");
    refs.scrambleText = $("#scrambleText");
    refs.scrambleRegenerate = $("#scrambleRegenerate");
    refs.scrambleCopy = $("#scrambleCopy");
    refs.scrambleClose = $("#scrambleClose");

    if (!refs.scramblePanel || !refs.scrambleText) {
      console.warn("[app] Scramble panel elements missing");
      return;
    }

    if (refs.scrambleRegenerate && refs.scrambleRegenerate.dataset.eggWired !== "1") {
      refs.scrambleRegenerate.dataset.eggWired = "1";
      refs.scrambleRegenerate.addEventListener("click", () => {
        refreshScramble();
        APP.api.playPianoSample?.("./audio/f4.mp3", { volume: 0.18 });
      });
    }

    if (refs.scrambleCopy && refs.scrambleCopy.dataset.eggWired !== "1") {
      refs.scrambleCopy.dataset.eggWired = "1";
      refs.scrambleCopy.addEventListener("click", () => {
        copyScrambleToClipboard();
      });
    }

    if (refs.scrambleClose && refs.scrambleClose.dataset.eggWired !== "1") {
      refs.scrambleClose.dataset.eggWired = "1";
      refs.scrambleClose.addEventListener("click", () => {
        closeScramblePanel();
      });
    }
  }

  function bindGlobalEggShortcuts() {
    if (APP.state.eggKeysWired) return;
    APP.state.eggKeysWired = true;
    APP.state.konamiIdx = 0;
    APP.state.typedEggBuffer = "";

    window.addEventListener("keydown", (e) => {
      if (isTypingTarget(e.target)) return;

      if (e.key === "Escape") {
        closeAllEggModes();
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        openScramblePanel();
      }

      const konamiExpected = KONAMI[APP.state.konamiIdx];
      const keyLower = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (keyLower === konamiExpected) {
        APP.state.konamiIdx += 1;
        if (APP.state.konamiIdx >= KONAMI.length) {
          APP.state.konamiIdx = 0;
          toggleChaosMode();
        }
      } else {
        APP.state.konamiIdx = keyLower === KONAMI[0] ? 1 : 0;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        APP.state.typedEggBuffer = (APP.state.typedEggBuffer + e.key.toUpperCase()).slice(-18);
        if (APP.state.typedEggBuffer.endsWith("VISIONAI")) {
          APP.state.typedEggBuffer = "";
          startMatrixMode();
        } else if (APP.state.typedEggBuffer.endsWith("MEOW")) {
          APP.state.typedEggBuffer = "";
          startPawMode();
        }
      }
    });
  }

  function initEasterEggs() {
    if (APP.state.easterEggsInitialized) return;

    initMatrixCanvas();
    initScramblePanelRefs();
    bindWcaLongPress();
    bindAvatarMultiTap();
    bindGlobalEggShortcuts();

    window.addEventListener("pcarioca:melody-perfect", handleMelodyPerfect);

    refreshScramble();
    APP.state.easterEggsInitialized = true;
  }

  APP.api.initEasterEggs = initEasterEggs;
})();
