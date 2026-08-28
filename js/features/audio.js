(() => {
  const APP = window.PCARIOCA_APP;
  const { $, $$ } = APP.helpers;
  const PIANO_SAMPLES = {
    C3: "./audio/c3.mp3",
    E3: "./audio/e3.mp3",
    G3: "./audio/g3.mp3",
    D4: "./audio/d4.mp3",
    E4: "./audio/e4.mp3",
    F4: "./audio/f4.mp3",
    G4: "./audio/g4.mp3",
    D5: "./audio/d5.mp3",
    B5: "./audio/b5.mp3"
  };
  const RESUME_JINGLE = [PIANO_SAMPLES.C3, PIANO_SAMPLES.E3, PIANO_SAMPLES.G3, PIANO_SAMPLES.D5, PIANO_SAMPLES.G4];

  function playNote(freq, dur, opts = {}) {
    if (!APP.state.audioUnlocked) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;
    APP.state.audioCtx = APP.state.audioCtx || new AudioContextCtor();
    const oscillator = APP.state.audioCtx.createOscillator();
    const gain = APP.state.audioCtx.createGain();
    const now = APP.state.audioCtx.currentTime;
    oscillator.type = opts.type || "sine";
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(opts.volume ?? 0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    oscillator.connect(gain);
    gain.connect(APP.state.audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + dur + 0.02);
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

  function playPianoSample(src, opts = {}) {
    if (!APP.state.audioUnlocked || !src) return;
    const clip = ensurePianoSample(src).cloneNode(true);
    clip.volume = opts.volume ?? 0.2;
    clip.playbackRate = opts.playbackRate ?? 1;
    clip.currentTime = 0;
    clip.play()?.catch(() => {});
  }

  function playSequence(sequence, opts = {}) {
    if (!APP.state.audioUnlocked) return;
    const stepMs = opts.stepMs ?? 80;
    sequence.forEach((src, index) => {
      setTimeout(() => playPianoSample(src, { volume: opts.volume ?? 0.18 }), index * stepMs);
    });
  }

  function playResumeJingle() {
    playSequence(RESUME_JINGLE, { stepMs: 78, volume: 0.18 });
  }

  function playGenericClick(target) {
    const key = target?.dataset?.holdKey || target?.id || target?.className || "click";
    let hash = 0;
    for (let i = 0; i < String(key).length; i += 1) hash = (hash * 31 + String(key).charCodeAt(i)) >>> 0;
    const notes = [392, 440, 523.25, 587.33, 659.25];
    playNote(notes[hash % notes.length], 0.045, { type: "triangle", volume: 0.055 });
  }

  function playHoldMotif(kind) {
    const motifs = {
      game: [PIANO_SAMPLES.C3, PIANO_SAMPLES.E3, PIANO_SAMPLES.G3],
      success: [PIANO_SAMPLES.E3, PIANO_SAMPLES.G3, PIANO_SAMPLES.D5],
      utility: [PIANO_SAMPLES.E4],
      copy: [PIANO_SAMPLES.G4],
      pulse: [PIANO_SAMPLES.D4]
    };
    playSequence(motifs[kind] || motifs.utility, { stepMs: 76, volume: 0.14 });
  }

  function playHoldChargeTick() {
    // Intentionally silent: timed hold progress must not create background audio.
  }

  function interactiveTarget(target) {
    return target?.closest?.("#btnGithub, #btnWca, #btnLinkedIn, #btnMail, .hero-action, .resource-link, .education-institution, .teaching-item-title, .language-primary, .tag, .bullets li, .left-whoami-section-title, .left-whoami-pill, .langbar a[data-lang], .scramble-btn");
  }

  function wireInteractiveSounds() {
    if (APP.state.interactionSoundWired) return;
    APP.state.interactionSoundWired = true;
    document.addEventListener("click", (event) => {
      const target = interactiveTarget(event.target);
      if (!target || target.id === "audioPill" || target.closest("#audioPill")) return;
      if (target.matches("#resumeLink, #heroResume")) {
        playResumeJingle();
        return;
      }
      playGenericClick(target);
    });
  }

  async function initAudio() {
    if (APP.state.audioInitialized) {
      wireInteractiveSounds();
      return;
    }
    APP.state.audioUnlocked = false;
    APP.state.pianoSamples = {};
    try {
      APP.state.audioUnlocked = localStorage.getItem("audioUnlocked") === "1";
    } catch (err) {
      console.warn("[app] Could not read sound preference", err);
    }

    Object.values(PIANO_SAMPLES).forEach(ensurePianoSample);
    APP.refs.audioPill = $("#audioPill");
    APP.refs.audioClose = $("#audioClose");
    const hideAudioPill = () => {
      if (APP.refs.audioPill) APP.refs.audioPill.style.display = "none";
    };
    if (APP.state.audioUnlocked) hideAudioPill();

    APP.refs.audioClose?.addEventListener("click", (event) => {
      event.stopPropagation();
      hideAudioPill();
    });
    APP.refs.audioPill?.addEventListener("click", async () => {
      try {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (AudioContextCtor) {
          APP.state.audioCtx = APP.state.audioCtx || new AudioContextCtor();
          await APP.state.audioCtx.resume();
        }
        APP.state.audioUnlocked = true;
        localStorage.setItem("audioUnlocked", "1");
        hideAudioPill();
        playSequence([PIANO_SAMPLES.C3, PIANO_SAMPLES.E3], { stepMs: 80, volume: 0.12 });
      } catch (err) {
        console.warn("[app] Audio unlock failed", err);
        hideAudioPill();
      }
    });

    APP.state.audioInitialized = true;
    wireInteractiveSounds();
  }

  APP.api.playNote = playNote;
  APP.api.playPianoSample = playPianoSample;
  APP.api.playHoldMotif = playHoldMotif;
  APP.api.playHoldChargeTick = playHoldChargeTick;
  APP.api.playResumeJingle = playResumeJingle;
  APP.api.wireInteractiveSounds = wireInteractiveSounds;
  APP.api.initAudio = initAudio;
})();
