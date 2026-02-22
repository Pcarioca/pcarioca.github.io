(() => {
  const APP = window.PCARIOCA_APP;
  const { $, $$ } = APP.helpers;
  const PIANO_SAMPLES = {
    C3: "./audio/c3.mp3",
    D4: "./audio/d4.mp3",
    E4: "./audio/e4.mp3",
    F4: "./audio/f4.mp3",
    G4: "./audio/g4.mp3",
    B5: "./audio/b5.mp3",
    A3: "./audio/a3.mp3",
    D5: "./audio/d5.mp3",
    E3: "./audio/e3.mp3",
    F5: "./audio/f5.mp3",
    G3: "./audio/g3.mp3"
  };
  const PIANO_NOTES = Object.values(PIANO_SAMPLES);
  const WHOAMI_MELODY_SEQUENCE = [
    PIANO_SAMPLES.C3, PIANO_SAMPLES.E3, PIANO_SAMPLES.G3, PIANO_SAMPLES.E3,
    PIANO_SAMPLES.D4, PIANO_SAMPLES.F4, PIANO_SAMPLES.G4, PIANO_SAMPLES.F4,
    PIANO_SAMPLES.E4, PIANO_SAMPLES.G4, PIANO_SAMPLES.D5, PIANO_SAMPLES.B5,
    PIANO_SAMPLES.G4, PIANO_SAMPLES.F4, PIANO_SAMPLES.E4, PIANO_SAMPLES.C3,
    PIANO_SAMPLES.E3
  ];
  const WHOAMI_MELODY_RESET_MS = 1800;

  function playNote(freq, dur, opts = {}) {
    if (!APP.state.audioUnlocked) return;

    APP.state.audioCtx = APP.state.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = APP.state.audioCtx.createOscillator();
    const g = APP.state.audioCtx.createGain();

    o.type = opts.type || "sine";
    o.frequency.value = freq;

    const now = APP.state.audioCtx.currentTime;
    const peakGain = opts.volume == null ? 0.08 : opts.volume;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peakGain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    o.connect(g);
    g.connect(APP.state.audioCtx.destination);

    o.start(now);
    o.stop(now + dur + 0.02);
  }

  function playInteractionSound(spec, isHover = false) {
    if (!APP.state.audioUnlocked || !spec) return;

    if (isHover) {
      const now = performance.now();
      if (now - APP.state.lastHoverSoundAt < 55) return;
      APP.state.lastHoverSoundAt = now;
    }

    playNote(spec.freq, spec.dur || 0.04, {
      type: spec.type || "sine",
      volume: spec.volume == null ? 0.08 : spec.volume
    });
  }

  function bindSound(el, hoverSpec, clickSpec) {
    if (!el || el.dataset.soundWired === "1") return;
    el.dataset.soundWired = "1";

    if (hoverSpec) {
      el.addEventListener("mouseenter", () => {
        playInteractionSound(hoverSpec, true);
      });
    }

    if (clickSpec) {
      el.addEventListener("click", () => {
        playInteractionSound(clickSpec, false);
      });
    }
  }

  function pickRandom(items) {
    if (!items || !items.length) return null;
    const idx = Math.floor(Math.random() * items.length);
    return items[idx];
  }

  function ensurePianoSample(src) {
    APP.state.pianoSamples = APP.state.pianoSamples || {};
    if (!APP.state.pianoSamples[src]) {
      const audio = new Audio(src);
      audio.preload = "auto";
      APP.state.pianoSamples[src] = audio;
    }
    return APP.state.pianoSamples[src];
  }

  function preloadPianoSamples() {
    PIANO_NOTES.forEach((src) => {
      ensurePianoSample(src);
    });
  }

  function playPianoSample(src, opts = {}) {
    if (!APP.state.audioUnlocked || !src) return;

    const now = performance.now();
    if (opts.isHover) {
      if (now - APP.state.lastPianoHoverSoundAt < 90) return;
      APP.state.lastPianoHoverSoundAt = now;
    }

    const base = ensurePianoSample(src);
    const clip = base.cloneNode(true);
    clip.volume = opts.volume == null ? 0.25 : opts.volume;
    clip.playbackRate = opts.playbackRate == null ? 1 : opts.playbackRate;
    clip.currentTime = 0;
    const p = clip.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  }

  function ensureWhoAmIMelodyState() {
    APP.state.whoAmIMelody = APP.state.whoAmIMelody || {
      expectedIndex: 0,
      noteIndex: 0,
      totalPills: 0,
      completed: false,
      inactivityTimer: null
    };
    return APP.state.whoAmIMelody;
  }

  function resetWhoAmIMelody(opts = {}) {
    const melody = ensureWhoAmIMelodyState();
    clearTimeout(melody.inactivityTimer);
    melody.inactivityTimer = null;
    melody.expectedIndex = 0;
    melody.noteIndex = 0;
    melody.completed = false;

    if (!opts.silent) {
      const src = WHOAMI_MELODY_SEQUENCE[0];
      if (src) {
        playPianoSample(src, {
          volume: opts.volume == null ? 0.2 : opts.volume,
          playbackRate: 1.02
        });
      }
    }
  }

  function scheduleWhoAmIMelodyReset() {
    const melody = ensureWhoAmIMelodyState();
    clearTimeout(melody.inactivityTimer);
    melody.inactivityTimer = setTimeout(() => {
      resetWhoAmIMelody({ silent: true });
    }, WHOAMI_MELODY_RESET_MS);
  }

  function playWhoAmIMelodyStep(el, source = "hover") {
    if (!APP.state.audioUnlocked || !el) return;

    const idx = Number(el.dataset.melodyIndex);
    if (!Number.isFinite(idx)) return;

    const melody = ensureWhoAmIMelodyState();
    if (!melody.totalPills) return;

    if (source === "hover") {
      const now = performance.now();
      if (now - APP.state.lastMelodyHoverAt < 90) return;
      APP.state.lastMelodyHoverAt = now;
    }

    if (melody.completed) {
      if (idx === 0) resetWhoAmIMelody({ silent: true });
      else return;
    }

    if (idx === 0 && melody.expectedIndex !== 0) {
      resetWhoAmIMelody({ silent: true });
    }

    if (idx !== melody.expectedIndex) return;

    const src = WHOAMI_MELODY_SEQUENCE[melody.noteIndex % WHOAMI_MELODY_SEQUENCE.length];
    playPianoSample(src, {
      volume: source === "touch" ? 0.28 : 0.22,
      playbackRate: source === "touch" ? 1 : 1.01
    });

    melody.expectedIndex += 1;
    melody.noteIndex += 1;
    scheduleWhoAmIMelodyReset();

    if (melody.expectedIndex >= melody.totalPills) {
      melody.completed = true;
      window.dispatchEvent(
        new CustomEvent("pcarioca:melody-perfect", {
          detail: { totalPills: melody.totalPills }
        })
      );
    }
  }

  function bindPianoSound(el, hoverSamples, clickSamples, opts = {}) {
    if (!el || el.dataset.pianoWired === "1") return;
    el.dataset.pianoWired = "1";

    if (hoverSamples?.length) {
      el.addEventListener("mouseenter", () => {
        const src = pickRandom(hoverSamples);
        playPianoSample(src, {
          isHover: true,
          volume: opts.hoverVolume == null ? 0.22 : opts.hoverVolume,
          playbackRate: opts.hoverRate == null ? 1.04 : opts.hoverRate
        });
      });
    }

    if (clickSamples?.length) {
      el.addEventListener("click", () => {
        const src = pickRandom(clickSamples);
        playPianoSample(src, {
          volume: opts.clickVolume == null ? 0.28 : opts.clickVolume,
          playbackRate: opts.clickRate == null ? 1 : opts.clickRate
        });
      });
    }
  }

  function bindWhoAmIPillMelody(el) {
    if (!el || el.dataset.melodyWired === "1") return;
    el.dataset.melodyWired = "1";

    el.addEventListener("mouseenter", () => {
      playWhoAmIMelodyStep(el, "hover");
    });

    el.addEventListener(
      "touchstart",
      () => {
        playWhoAmIMelodyStep(el, "touch");
      },
      { passive: true }
    );
  }

  function wireWhoAmIMelody() {
    const pills = $$(".left-whoami-pill");
    const melody = ensureWhoAmIMelodyState();
    melody.totalPills = pills.length;
    resetWhoAmIMelody({ silent: true });

    pills.forEach((el, idx) => {
      el.dataset.melodyIndex = String(idx);
      bindWhoAmIPillMelody(el);
    });

    const scroll = $("#leftWhoAmIScroll");
    if (scroll && scroll.dataset.melodyLeaveWired !== "1") {
      scroll.dataset.melodyLeaveWired = "1";
      scroll.addEventListener("mouseleave", () => {
        resetWhoAmIMelody({ silent: true });
      });
      scroll.addEventListener("touchcancel", () => {
        resetWhoAmIMelody({ silent: true });
      });
      scroll.addEventListener(
        "touchend",
        () => {
          scheduleWhoAmIMelodyReset();
        },
        { passive: true }
      );
    }
  }

  function wireInteractiveSounds() {
    const refs = APP.refs;
    const iconSoundTargets = [
      {
        el: refs.btnGithub,
        selector: "#btnGithub",
        hover: { freq: 392.0, dur: 0.04, type: "triangle", volume: 0.055 },
        click: { freq: 784.0, dur: 0.05, type: "triangle", volume: 0.08 }
      },
      {
        el: refs.btnWca,
        selector: "#btnWca",
        hover: { freq: 440.0, dur: 0.04, type: "sine", volume: 0.055 },
        click: { freq: 880.0, dur: 0.05, type: "sine", volume: 0.08 }
      },
      {
        el: refs.btnLinkedIn,
        selector: "#btnLinkedIn",
        hover: { freq: 523.25, dur: 0.04, type: "triangle", volume: 0.055 },
        click: { freq: 1046.5, dur: 0.05, type: "triangle", volume: 0.08 }
      },
      {
        el: refs.btnMail,
        selector: "#btnMail",
        hover: { freq: 659.25, dur: 0.04, type: "sine", volume: 0.055 },
        click: { freq: 1318.5, dur: 0.05, type: "sine", volume: 0.08 }
      }
    ];

    for (const target of iconSoundTargets) {
      if (!target.el) {
        console.warn(`[app] Missing selector: ${target.selector} (sound disabled)`);
        continue;
      }
      bindSound(target.el, target.hover, target.click);
    }

    const langHover = { freq: 523.25, dur: 0.03, type: "triangle", volume: 0.045 };
    const langClick = { freq: 698.46, dur: 0.05, type: "triangle", volume: 0.07 };
    $$(".langbar a[data-lang]").forEach((el) => bindSound(el, langHover, langClick));

    const linkHover = { freq: 587.33, dur: 0.03, type: "sine", volume: 0.05 };
    const linkClick = { freq: 783.99, dur: 0.05, type: "triangle", volume: 0.075 };
    $$(".resume, .resource-link").forEach((el) => bindSound(el, linkHover, linkClick));

    const tagHover = { freq: 349.23, dur: 0.03, type: "sine", volume: 0.04 };
    const tagClick = { freq: 493.88, dur: 0.045, type: "triangle", volume: 0.065 };
    $$(".tag").forEach((el) => bindSound(el, tagHover, tagClick));

    const cardHover = { freq: 293.66, dur: 0.025, type: "sine", volume: 0.035 };
    const cardClick = { freq: 392.0, dur: 0.045, type: "triangle", volume: 0.06 };
    $$(".bullets li").forEach((el) => bindSound(el, cardHover, cardClick));
    wireWhoAmIMelody();

    const groupTitleHovers = ["./audio/d4.mp3", "./audio/f4.mp3"];
    const groupTitleClicks = ["./audio/g4.mp3", "./audio/b5.mp3"];
    $$(".left-whoami-section-title").forEach((el) =>
      bindPianoSound(el, groupTitleHovers, groupTitleClicks, {
        hoverVolume: 0.16,
        clickVolume: 0.24,
        hoverRate: 1.05,
        clickRate: 1.02
      })
    );
  }

  async function initAudio() {
    if (APP.state.audioInitialized) {
      wireInteractiveSounds();
      return;
    }

    APP.state.audioCtx = null;
    APP.state.audioUnlocked = false;
    APP.state.lastHoverSoundAt = 0;
    APP.state.lastPianoHoverSoundAt = 0;
    APP.state.lastMelodyHoverAt = 0;
    APP.state.pianoSamples = {};
    APP.state.whoAmIMelody = null;

    try {
      APP.state.audioUnlocked = localStorage.getItem("audioUnlocked") === "1";
    } catch (e) {
      console.warn("[app] localStorage.getItem('audioUnlocked') failed", e);
    }

    preloadPianoSamples();

    APP.refs.audioPill = $("#audioPill");
    if (!APP.refs.audioPill) console.warn("[app] Missing selector: #audioPill");

    APP.refs.audioClose = $("#audioClose");
    if (!APP.refs.audioClose) console.warn("[app] Missing selector: #audioClose");

    function hideAudioPill() {
      if (APP.refs.audioPill) APP.refs.audioPill.style.display = "none";
    }

    function showAudioPill() {
      if (APP.refs.audioPill) APP.refs.audioPill.style.display = "flex";
    }

    if (APP.refs.audioPill) {
      if (APP.state.audioUnlocked) hideAudioPill();
      else showAudioPill();
    }

    if (APP.refs.audioClose) {
      APP.refs.audioClose.addEventListener("click", (e) => {
        e.stopPropagation();
        hideAudioPill();
      });
    }

    if (APP.refs.audioPill) {
      APP.refs.audioPill.addEventListener("click", async () => {
        try {
          APP.state.audioCtx = APP.state.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
          await APP.state.audioCtx.resume();
          APP.state.audioUnlocked = true;

          try {
            localStorage.setItem("audioUnlocked", "1");
          } catch (e) {
            console.warn("[app] localStorage.setItem('audioUnlocked') failed", e);
          }

          hideAudioPill();
          playNote(523.25, 0.06); // C5
          setTimeout(() => playNote(659.25, 0.06), 80); // E5
        } catch (e) {
          console.warn("[app] Audio unlock failed", e);
          hideAudioPill();
        }
      });
    }

    APP.state.audioInitialized = true;
    wireInteractiveSounds();
  }

  APP.api.playNote = playNote;
  APP.api.playPianoSample = playPianoSample;
  APP.api.resetWhoAmIMelody = resetWhoAmIMelody;
  APP.api.wireInteractiveSounds = wireInteractiveSounds;
  APP.api.initAudio = initAudio;
})();
