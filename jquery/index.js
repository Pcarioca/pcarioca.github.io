// full JS file - parent/iframe aware, single subtle hint, GOOD icon sounds, deliberately "bad" background li sounds
// Requires jQuery

$(document).ready(function () {
  const IS_TOP = (window === window.top);
  const ORIGIN = location.origin; // assume same-origin iframe

  // -------------------------
  // GLOBAL: audio unlock (top only) + hint pill (top only)
  // -------------------------
  let audioUnlocked = false;
  let AUDIO_CTX = null; // keep for WebAudio processing

  function insertStylesOnce() {
    if (!IS_TOP) return;
    if (document.getElementById('audio-hint-styles')) return;
    const css = `
      #audio-hint-pill {
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.6);
        color: #fff;
        padding: 8px 14px;
        border-radius: 999px;
        font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        font-size: 13px;
        z-index: 9998;
        display: flex;
        gap: 10px;
        align-items: center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.35);
        backdrop-filter: blur(4px);
        cursor: pointer; /* clicking the pill also unlocks */
        user-select: none;
      }
      #audio-hint-pill .x {
        margin-left: 8px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: inline-grid;
        place-items: center;
        background: rgba(255,255,255,0.08);
        font-size: 11px;
        cursor: pointer;
      }
      .jingle-step {
        outline: 2px solid rgba(255,255,255,0.12);
        transform: scale(1.03);
        transition: transform .12s, outline .12s;
      }
    `;
    const s = document.createElement('style');
    s.id = 'audio-hint-styles';
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function showHintPill() {
    if (!IS_TOP) return;            // never show inside iframe
    if (audioUnlocked) return;
    if (document.getElementById('audio-hint-pill')) return;
    const pill = document.createElement('div');
    pill.id = 'audio-hint-pill';
    pill.innerHTML = `🔊 <span style="opacity:.95">Tip: click <strong>here</strong> to enable sounds</span> <span class="x" title="hide">✕</span>`;
    document.body.appendChild(pill);
    pill.addEventListener('click', (e) => {
      if (e.target.classList.contains('x')) {
        pill.remove();
        return;
      }
      doUnlock();
    });
    setTimeout(() => { pill && pill.remove(); }, 8000);
  }

  function hideHintPill() {
    const pill = document.getElementById('audio-hint-pill');
    if (pill) pill.remove();
  }

  function doUnlock() {
    if (!IS_TOP) return;
    if (audioUnlocked) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        AUDIO_CTX = ctx; // keep for "bad" FX chain
        if (ctx.state === 'suspended') { ctx.resume().catch(()=>{}); }
        // tiny confirm blip
        try {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = 880;
          g.gain.value = 0.0001; o.connect(g); g.connect(ctx.destination);
          const now = ctx.currentTime;
          g.gain.setValueAtTime(0.0001, now);
          g.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
          o.start(now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
          o.stop(now + 0.09);
        } catch {}
      }
    } catch {}
    audioUnlocked = true;
    hideHintPill();
    console.log('Audio unlocked (top).');
  }

  // clicks on empty spots unlock (top only)
  if (IS_TOP) {
    insertStylesOnce();
    showHintPill();
    document.addEventListener('click', function onDocClick(e){
      if (audioUnlocked) return;
      const interactive = 'a, button, input, textarea, select, label, iframe, svg, path, audio, video';
      if (!e.target.closest(interactive)) {
        doUnlock();
      }
    }, true);
  }

  // -------------------------
  // Messaging: iframe -> top (forward play requests)
  // -------------------------
  if (IS_TOP) {
    window.addEventListener('message', (e) => {
      if (e.origin !== ORIGIN) return;
      const data = e.data || {};
      if (data.type === 'PLAY_ID') {
        const el = idToAudio[data.id];
        if (el) tryPlayElement(el);
      }
    });
  } else {
    try { parent.postMessage({ type: 'UNLOCK_REQUEST' }, ORIGIN); } catch {}
  }

  function tryPlayElement(el) {
    if (!IS_TOP) {
      try { parent.postMessage({ type: 'PLAY_ID', id: el && el.dataset && el.dataset.playId }, ORIGIN); } catch {}
      return;
    }
    if (!audioUnlocked) { showHintPill(); return; }
    try { const p = el.play(); if (p && p.catch) p.catch(()=>{}); } catch {}
  }

  // -------------------------
  // Part A: your original audio elements — only create in TOP window
  // -------------------------
  let audioElement1, audioElement2, audioElement3, audioElement4, audioElement5, audioElement6;
  const idToAudio = {};

  if (IS_TOP) {
    audioElement1 = document.createElement('audio');
    audioElement1.setAttribute('id', 'play1');
    audioElement1.setAttribute('src', 'audio/c3.mp3');
    audioElement1.preload = 'auto';
    audioElement1.dataset.playId = 'github';
    document.body.appendChild(audioElement1);
    $("#github").on('mouseenter', () => tryPlayElement(audioElement1));
    idToAudio['github'] = audioElement1;

    audioElement2 = document.createElement('audio');
    audioElement2.setAttribute('id', 'play2');
    audioElement2.setAttribute('src', 'audio/e3.mp3');
    audioElement2.preload = 'auto';
    audioElement2.dataset.playId = 'mail';
    document.body.appendChild(audioElement2);
    $("#mail").on('mouseenter', () => tryPlayElement(audioElement2));
    idToAudio['mail'] = audioElement2;

    audioElement3 = document.createElement('audio');
    audioElement3.setAttribute('id', 'play3');
    audioElement3.setAttribute('src', 'audio/g3.mp3');
    audioElement3.preload = 'auto';
    audioElement3.dataset.playId = 'linkedin';
    document.body.appendChild(audioElement3);
    $("#linkedin").on('mouseenter', () => tryPlayElement(audioElement3));
    idToAudio['linkedin'] = audioElement3;

    audioElement4 = document.createElement('audio');
    audioElement4.setAttribute('id', 'play4');
    audioElement4.setAttribute('src', 'audio/g3.mp3');
    audioElement4.preload = 'auto';
    audioElement4.dataset.playId = 'facebook';
    document.body.appendChild(audioElement4);
    $("#facebook").on('mouseenter', () => tryPlayElement(audioElement4));
    idToAudio['facebook'] = audioElement4;

    audioElement5 = document.createElement('audio');
    audioElement5.setAttribute('id', 'play5');
    audioElement5.setAttribute('src', 'audio/e3.mp3'); // (you preferred e3 here)
    audioElement5.preload = 'auto';
    audioElement5.dataset.playId = 'instagram';
    document.body.appendChild(audioElement5);
    $("#instagram").on('mouseenter', () => tryPlayElement(audioElement5));
    idToAudio['instagram'] = audioElement5;

    audioElement6 = document.createElement('audio');
    audioElement6.setAttribute('id', 'play6');
    audioElement6.setAttribute('src', 'audio/e3.mp3'); // (you preferred e3 here)
    audioElement6.preload = 'auto';
    audioElement6.dataset.playId = 'wca';
    document.body.appendChild(audioElement6);
    $("#wca").on('mouseenter', () => tryPlayElement(audioElement6));
    idToAudio['wca'] = audioElement6;
  } else {
    const forward = (id) => { try { parent.postMessage({ type: 'PLAY_ID', id }, ORIGIN); } catch {} };
    $("#github").on('mouseenter', () => forward('github'));
    $("#mail").on('mouseenter', () => forward('mail'));
    $("#linkedin").on('mouseenter', () => forward('linkedin'));
    $("#facebook").on('mouseenter', () => forward('facebook'));
    $("#instagram").on('mouseenter', () => forward('instagram'));
    $("#wca").on('mouseenter', () => forward('wca'));
    return; // iframe stops here (parent handles sounds)
  }

  // -------------------------
  // Part B (TOP only): load all /audio/*.mp3, build sequences, jingle + "bad" FX for background li
  // -------------------------
  (function(){
    function parseMp3FromHtml(html) {
      const re = /(?:href=|src=|["'])?([^\s"'>]+?\.mp3)(?:["'>\s])/ig;
      const files = new Set(); let m;
      while ((m = re.exec(html)) !== null) files.add(m[1]);
      return Array.from(files);
    }
    function normalizePath(p) {
      if (!p) return null;
      if (/^https?:\/\//i.test(p) || p.startsWith('/')) return p;
      if (p.startsWith('audio/')) return '/' + p;
      return '/audio/' + p;
    }

    if (!IS_TOP) return;

    $.get('/audio/').done(function(data){
      let files = parseMp3FromHtml(data);
      if (!files.length) {
        const alt = (data.match(/([a-z0-9_\-\/]+\.mp3)/ig) || []);
        files = Array.from(new Set(alt));
      }
      bootWithFiles(files.map(normalizePath).filter(Boolean));
    }).fail(function(){
      const existingEls = $('audio').get();
      if (existingEls.length) { bootWithAudioElements(existingEls); return; }
      const candidates = [
        'a3.mp3','b5.mp3','c3.mp3','d4.mp3','d5.mp3','e3.mp3','e4.mp3','f4.mp3','f5.mp3','g3.mp3','g4.mp3','g5.mp3',
        'c4.mp3','b4.mp3','a4.mp3'
      ].map(normalizePath);
      bootWithFiles(candidates);
    });

    function bootWithAudioElements(audioElements) {
      audioElements.forEach(n => { try { n.preload = 'auto'; } catch(e){} });
      setupSequencer(audioElements);
    }
    function bootWithFiles(paths) {
      const unique = Array.from(new Set(paths)).filter(Boolean);
      const existing = $('audio').get();
      const notes = [];
      unique.forEach(p => {
        const match = existing.find(el => {
          const src = (el.getAttribute('src') || el.src || '').toString();
          return src.endsWith(p) || src.endsWith(p.replace(/^\/+/,''));
        });
        if (match) notes.push(match);
        else {
          try {
            const a = document.createElement('audio');
            a.src = p; a.preload = 'auto'; a.style.display = 'none'; a.volume = 0.95;
            document.body.appendChild(a); notes.push(a);
          } catch {}
        }
      });
      if (!notes.length) {
        const fallback = $('audio').get();
        if (fallback.length) { setupSequencer(fallback); return; }
      } else { setupSequencer(notes); }
    }

    const baseNoteMap = { 'c':0,'d':2,'e':4,'f':5,'g':7,'a':9,'b':11 };
    function filenameToKey(src) {
      try {
        const name = (src + '').split('/').pop().toLowerCase();
        const m = name.match(/^([a-g])(#{0,1}|b{0,1})(\d)/);
        if (!m) return null;
        const letter = m[1], octave = parseInt(m[3],10);
        const semitone = baseNoteMap[letter] || 0;
        return octave * 12 + semitone;
      } catch { return null; }
    }

    function setupSequencer(noteElements) {
      const notes = Array.from(new Set(noteElements.filter(Boolean)));
      if (!notes.length) { console.warn('Sequencer: no samples found.'); return; }

      notes.sort((A,B) => {
        const srcA = A.src || (A.getAttribute && A.getAttribute('src')) || '';
        const srcB = B.src || (B.getAttribute && B.getAttribute('src')) || '';
        const kA = filenameToKey(srcA), kB = filenameToKey(srcB);
        if (typeof kA === 'number' && typeof kB === 'number') return kA - kB;
        if (kA === null && kB === null) return String(srcA).localeCompare(String(srcB));
        if (kA === null) return 1; if (kB === null) return -1; return 0;
      });

      const seqs = [], N = notes.length;
      for (let i=0;i<N;i++){ if (i+2<N) seqs.push([i,i+1,i+2]); if (i+3<N) seqs.push([i,i+1,i+2,i+3]); if (i+4<N) seqs.push([i,i+1,i+2,i+3,i+4]); }
      for (let i=0;i<N;i++){ if (i+2<N) seqs.push([i,i+2,i+4].filter(x=>x<N)); if (i+3<N) seqs.push([i,i+2,i+3,i+5].filter(x=>x<N)); }
      for (let i=0;i<N;i++){ if (i+4<N) seqs.push([i,i+2,i+4,i+6,i+8].filter(x=>x<N)); }

      const uniq = [], seen = new Set();
      seqs.forEach(s => { if (s.length<3) return; const k=s.join(','); if (!seen.has(k)) { seen.add(k); uniq.push(s); }});
      if (uniq.length < 8 && N >= 3) {
        for (let t=0;t<20;t++){ const len=3+Math.floor(Math.random()*3); const start=Math.floor(Math.random()*Math.max(1,N-len+1)); const s=Array.from({length:len},(_,i)=>start+i); const k=s.join(','); if(!seen.has(k)){seen.add(k);uniq.push(s);} }
      }

      function rndChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

      // ---------- GOOD playback (used for icons + jingle) ----------
      function playSequence(indices, done) {
        if (!audioUnlocked) { showHintPill(); if (done) done(); return; }
        let i = 0;
        function next() {
          if (i >= indices.length) { if (done) done(); return; }
          const idx = indices[i++], base = notes[idx];
          if (!base) { next(); return; }
          const clone = base.cloneNode(true);
          clone.preload = 'auto'; clone.style.display = 'none'; clone.currentTime = 0;
          document.body.appendChild(clone);
          const cleanup = () => { try{ clone.remove(); }catch{}; next(); };
          clone.addEventListener('ended', cleanup);
          const p = clone.play(); if (p && p.catch) p.catch(()=>{ const fallback=(base.duration&&isFinite(base.duration)&&base.duration>0)?base.duration*1000:600; setTimeout(()=>{ try{ clone.remove(); }catch{}; next(); }, fallback);});
        }
        next();
      }
      window.playSequence = playSequence; // expose if needed

      // ---------- BAD playback (used for .circles li) ----------
      function makeDistortionCurve(amount=32) {
        const n = 44100, curve = new Float32Array(n), deg = Math.PI/180, k = amount;
        for (let i=0;i<n;i++){ const x = i*2/n - 1; curve[i] = (3+k)*x*20*deg/(Math.PI + k*Math.abs(x)); }
        return curve;
      }
      function playBadNote(baseEl, onEnd, layerWithNeighbor) {
        if (!audioUnlocked) { showHintPill(); if (onEnd) onEnd(); return; }
        const clone = baseEl.cloneNode(true);
        clone.preload = 'auto'; clone.style.display = 'none'; clone.currentTime = 0;
        clone.volume = 0.6;
        // slight detune (crusty)
        clone.playbackRate = 0.9 + Math.random()*0.2; // 0.9–1.1
        document.body.appendChild(clone);

        // FX chain if AudioContext available
        try {
          if (AUDIO_CTX) {
            const src = AUDIO_CTX.createMediaElementSource(clone);
            const ws  = AUDIO_CTX.createWaveShaper(); ws.curve = makeDistortionCurve(28 + Math.random()*18);
            const hp  = AUDIO_CTX.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500 + Math.random()*400;
            const lp  = AUDIO_CTX.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = 2200 + Math.random()*400;
            const gn  = AUDIO_CTX.createGain(); gn.gain.value = 0.7;
            if (AUDIO_CTX.createStereoPanner) {
              const pan = AUDIO_CTX.createStereoPanner(); pan.pan.value = (Math.random()*0.6 - 0.3);
              src.connect(ws); ws.connect(hp); hp.connect(lp); lp.connect(pan); pan.connect(gn); gn.connect(AUDIO_CTX.destination);
            } else {
              src.connect(ws); ws.connect(hp); hp.connect(lp); lp.connect(gn); gn.connect(AUDIO_CTX.destination);
            }
          }
        } catch {}

        const cleanup = () => { try{ clone.remove(); }catch{}; if (typeof onEnd==='function') onEnd(); };
        clone.addEventListener('ended', cleanup);
        const p = clone.play();
        if (p && p.catch) p.catch(()=>{ setTimeout(cleanup, 500); });

        // Optional ugly cluster: trigger a neighbor note slightly offset
        if (layerWithNeighbor && typeof layerWithNeighbor === 'function') {
          setTimeout(layerWithNeighbor, 40 + Math.random()*60); // 40–100ms smear
        }
      }

      function buildBadSequenceIndices() {
        // choose "unpleasant" intervals: minor seconds (adjacent), tritone-ish (~6 apart), awkward jumps
        const len = 3 + Math.floor(Math.random()*3); // 3..5
        const start = Math.floor(Math.random()*N);
        let seq = [start];
        for (let i=1;i<len;i++){
          const roll = Math.random();
          let nextIdx;
          if (roll < 0.45) { // cluster (minor 2nd)
            nextIdx = seq[seq.length-1] + (Math.random()<0.5 ? 1 : -1);
          } else if (roll < 0.75) { // harsh leap ~ tritone-ish
            nextIdx = seq[seq.length-1] + (Math.random()<0.5 ? 6 : -6);
          } else { // awkward up-down
            nextIdx = seq[seq.length-1] + (Math.random()<0.5 ? 3 : -4);
          }
          nextIdx = Math.max(0, Math.min(N-1, nextIdx));
          seq.push(nextIdx);
        }
        return seq;
      }

      function playBadSequence(indices, done) {
        let i = 0;
        function next() {
          if (i >= indices.length) { if (done) done(); return; }
          const idx = indices[i++], base = notes[idx];
          if (!base) { next(); return; }
          // 50% chance to smear with adjacent neighbor for extra dissonance
          const neighborIdx = Math.random() > 0.5 ? Math.max(0, Math.min(N-1, idx + (Math.random()<0.5?-1:1))) : null;
          const layer = neighborIdx !== null ? () => {
            const nb = notes[neighborIdx];
            if (nb) playBadNote(nb); // fire-and-forget layer
          } : null;
          playBadNote(base, next, layer);
        }
        next();
      }

      // ----- JINGLE: ordered hover detection (still nice as a reward) -----
      const $lis = $('.circles li');
      $lis.each(function(i){ this.dataset.seqIndex = i; });

      const jLen = Math.min(5, N);
      const center = Math.floor(N / 2);
      const patternMap = [0,2,4,2,0];
      const jingleNoteIndices = [];
      for (let k=0;k<jLen;k++){
        const idx = Math.min(N-1, Math.max(0, center + (patternMap[k]||0)));
        jingleNoteIndices.push(idx);
      }

      function playSingleNoteByIndex(idx, onEnd) {
        if (!audioUnlocked) { showHintPill(); if (onEnd) onEnd(); return; }
        const base = notes[idx]; if (!base) { if (onEnd) onEnd(); return; }
        const clone = base.cloneNode(true);
        clone.preload = 'auto'; clone.style.display = 'none'; clone.currentTime = 0;
        document.body.appendChild(clone);
        const cleanup = () => { try{ clone.remove(); }catch{}; if (typeof onEnd==='function') onEnd(); };
        clone.addEventListener('ended', cleanup);
        const p = clone.play(); if (p && p.catch) p.catch(()=>{ const fallback=(base.duration&&isFinite(base.duration)&&base.duration>0)?base.duration*1000:500; setTimeout(cleanup, fallback);});
      }
      function playJingleSequence(indices, done) {
        let i = 0; (function next(){ if (i>=indices.length){ if (done) done(); return; } playSingleNoteByIndex(indices[i++], next); })();
      }

      let hoverProgress = 0, lastHoverTimestamp = 0;
      const hoverTimeoutMs = 2000;

      $('.circles li').on('mouseenter.sequencer', function() {
        const now = Date.now();
        const $li = $(this);
        if ($li.data('playing')) return;
        const idx = Number(this.dataset.seqIndex || 0);

        if (now - lastHoverTimestamp > hoverTimeoutMs) hoverProgress = 0;
        lastHoverTimestamp = now;

        const expectedIndex = hoverProgress;
        if (idx === expectedIndex && hoverProgress < jLen) {
          // Correct order -> NICE jingle step
          $li.data('playing', true);
          playSingleNoteByIndex(jingleNoteIndices[hoverProgress], () => { $li.data('playing', false); });
          $li.addClass('jingle-step'); setTimeout(()=> $li.removeClass('jingle-step'), 250);
          hoverProgress++;
          if (hoverProgress >= jLen) {
            $('.circles li').data('playing', true);
            playJingleSequence(jingleNoteIndices, function() {
              $('.circles li').data('playing', false); hoverProgress = 0;
            });
            setTimeout(()=> { $('.circles li').data('playing', false); hoverProgress = 0; }, 4000);
          }
        } else {
          // Wrong order / casual hover -> BAD/janky sequence (quiet & crunchy)
          hoverProgress = 0;
          $li.data('playing', true);
          const badSeq = buildBadSequenceIndices();
          playBadSequence(badSeq, () => $li.data('playing', false));

          // safety unflag in case of odd durations
          const estMs = badSeq.length * 650 + 200; // rough estimate
          setTimeout(()=> $li.data('playing', false), estMs);
        }
      });

      console.log('Sequencer ready — samples:', notes.length, 'badSeq palette:', uniq.length, 'jingleLen:', jLen);
    } // end setupSequencer

  })(); // end IIFE
}); // end document ready


  (() => {
    const root = document.documentElement;
    let x = innerWidth / 2, y = innerHeight / 2, raf = null;

    const commit = () => {
      root.style.setProperty('--mx', x + 'px');
      root.style.setProperty('--my', y + 'px');
      raf = null;
    };

    addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(commit);
    }, { passive: true });

    addEventListener('mouseleave', () => {
      root.style.setProperty('--glow-visible', '0');
    });

    addEventListener('mouseenter', () => {
      root.style.setProperty('--glow-visible', '.95');
    });

    commit(); // set initial position
  })();

  // jquery/index.js
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  // Create overlay once
  const ring = document.createElement('div');
  ring.id = 'rgb-iframe-ring';
  document.body.appendChild(ring);

  let activeFrame = null;
  let raf = null;

  const positionRing = () => {
    if (!activeFrame) return;
    const r = activeFrame.getBoundingClientRect();
    // Copy the iframe corner radius so the glow hugs it
    ring.style.borderRadius = getComputedStyle(activeFrame).borderRadius || '16px';
    ring.style.left   = r.left + 'px';
    ring.style.top    = r.top  + 'px';
    ring.style.width  = r.width + 'px';
    ring.style.height = r.height + 'px';
    raf = null;
  };

  const schedulePos = () => { if (!raf) raf = requestAnimationFrame(positionRing); };

  const showRing = (frame) => {
    activeFrame = frame;
    schedulePos();
    ring.classList.add('visible');
    // Hide global cursor glow to avoid the “stuck aura”
    root.style.setProperty('--glow-visible', '0');
    // Debug:
    // console.log('[rgb-ring] show on', frame);
  };

  const hideRing = () => {
    ring.classList.remove('visible');
    activeFrame = null;
    root.style.setProperty('--glow-visible', '.95');
    // console.log('[rgb-ring] hide');
  };

  // Reliable detection for entering/leaving the <iframe>
  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.tagName === 'IFRAME') showRing(e.target);
  }, true); // capture

  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.tagName === 'IFRAME') hideRing();
  }, true);

  // Keep the overlay aligned
  addEventListener('scroll', schedulePos, { passive: true });
  addEventListener('resize', schedulePos, { passive: true });

  // If the iframe resizes due to responsive layout, keep tracking it
  const ro = new ResizeObserver(schedulePos);
  document.querySelectorAll('iframe').forEach(f => ro.observe(f));

  // Safety: if the iframe is already under the mouse when the page finishes loading
  // (can happen on reload), force a position update.
  schedulePos();
});





