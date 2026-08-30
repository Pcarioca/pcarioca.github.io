(() => {
  const APP = window.PCARIOCA_APP;
  const { $ } = APP.helpers;

  function initCanvas() {
    if (APP.state.canvasInitialized) return;
    const canvas = $("#bg");
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    let W = 0; let H = 0; let DPR = 1; let raf = 0; let tick = 0; let renderErrorReported = false;
    const points = [];
    const ripples = [];
    const trails = [];
    const sparks = [];
    const gestureEffects = [];
    const dragMarks = [];
    const sceneFields = [];
    const sceneDynamics = { energy: 0, rotation: 0, rotationVelocity: 0, scale: 1, scaleVelocity: 0, panX: 0, panY: 0, panVX: 0, panVY: 0, timeDirection: 1 };
    let activeGesture = null;
    let lastTrailX = -9999;
    let lastTrailY = -9999;
    const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const color = () => APP.state.currentTheme?.art || "96 165 250";
    const type = () => APP.state.currentTheme?.backgroundType || "network";
    const gestureProfiles = {
      network: ["node-pop", "web-bloom", "electric-thread"], oscilloscope: ["wave-ping", "signal-storm", "wave-pen"], pcb: ["via-pop", "board-boot", "copper-route"], logic: ["bit-burst", "logic-clock", "square-signal"], aurora: ["ribbon-pop", "sky-bloom", "aurora-brush"], silicon: ["chip-pop", "die-scan", "silicon-trace"], terminal: ["glyph-pop", "terminal-boot", "cursor-stream"], constellation: ["star-pop", "constellation-bloom", "starlight-thread"], blueprint: ["measure-pop", "blueprint-scan", "drafting-line"], bubbles: ["bubble-pop", "bubble-party", "bubble-stream"], neon: ["neon-pop", "circuit-overload", "neon-route"], paper: ["doodle-pop", "paper-orbit", "pencil-line"], gravity: ["orbit-pop", "gravity-collapse", "spiral-thread"], fireflies: ["firefly-pop", "lantern-swarm", "glow-stream"], koi: ["pond-ripple", "koi-circle", "water-ribbon"], candy: ["candy-pop", "sugar-rush", "sprinkle-stream"], magnetic: ["pole-pop", "field-flip", "flux-line"], garden: ["flower-pop", "garden-bloom", "vine-line"], "star-tunnel": ["warp-pop", "hyper-jump", "warp-stream"], lava: ["lava-pop", "lava-eruption", "molten-ribbon"], snow: ["snow-pop", "snow-globe", "frost-stream"], hex: ["hex-pop", "hive-wave", "hex-chain"], pong: ["ball-pop", "multi-ball", "pong-streak"], atoms: ["atom-pop", "molecule-bloom", "electron-trail"], jellyfish: ["jelly-pop", "jelly-party", "tentacle-ribbon"], sprouts: ["seed-pop", "instant-garden", "growing-vine"], comets: ["comet-pop", "meteor-shower", "comet-tail"], sonar: ["sonar-ping", "deep-scan", "radar-sweep"], kaleido: ["prism-pop", "kaleido-bloom", "prism-ribbon"], pinball: ["bumper-pop", "bonus-round", "pinball-streak"], clockwork: ["gear-pop", "clockwork-wind", "cog-chain"], plasma: ["plasma-pop", "energy-orb", "plasma-ribbon"]
    };

    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.width = Math.floor(innerWidth * DPR);
      H = canvas.height = Math.floor(innerHeight * DPR);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      const target = Math.min(110, Math.max(72, Math.floor((innerWidth * innerHeight) / 18000)));
      while (points.length < target) points.push(makePoint());
      points.length = Math.max(target, Math.min(points.length, target + 24));
    }

    function makePoint(x = Math.random() * W, y = Math.random() * H) {
      return { x, y, vx: (Math.random() - .5) * .17 * DPR, vy: (Math.random() - .5) * .17 * DPR, r: (Math.random() * .9 + .8) * DPR };
    }

    function rgbaChannels(value, alpha) {
      const channels = String(value || "96 165 250").trim().split(/[,\s]+/).slice(0, 3).join(",");
      return `rgba(${channels},${Math.max(0, Math.min(1, alpha))})`;
    }
    function ink(alpha = .7) { return rgbaChannels(color(), alpha); }
    function inkSecondary(alpha = .7) { return rgbaChannels(APP.state.currentTheme?.purple || "167 139 250", alpha); }
    function pointer() { return { x: (APP.state.mx ?? innerWidth * .5) * DPR, y: (APP.state.my ?? innerHeight * .4) * DPR }; }
    function line(x1, y1, x2, y2, alpha = .25, width = 1) { ctx.strokeStyle = ink(alpha); ctx.lineWidth = width * DPR; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

    function updatePoints() {
      const p = pointer();
      points.forEach((dot) => {
        const dx = p.x - dot.x; const dy = p.y - dot.y; const d = Math.hypot(dx, dy) || 1;
        if (d < 245 * DPR) {
          const force = (1 - d / (245 * DPR)) * (.014 + (APP.state.pointerEnergy || 0) * .04);
          dot.vx += dx / d * force;
          dot.vy += dy / d * force;
        }
        sceneFields.forEach((field) => {
          const fx = dot.x - field.x; const fy = dot.y - field.y; const distance = Math.hypot(fx, fy) || 1; const reach = field.radius * DPR;
          if (distance >= reach) return;
          const power = (1 - distance / reach) * field.life * field.strength;
          if (field.action === "drag") { dot.vx += field.dx * power * .018; dot.vy += field.dy * power * .018; }
          else if (field.action === "hold") { dot.vx += (-fy / distance) * power * .12 - (fx / distance) * power * .035; dot.vy += (fx / distance) * power * .12 - (fy / distance) * power * .035; }
          else { const sign = field.seed % 2 ? 1 : -1; dot.vx += fx / distance * power * .18 * sign; dot.vy += fy / distance * power * .18 * sign; }
        });
        dot.x += dot.vx; dot.y += dot.vy; dot.vx *= .995; dot.vy *= .995;
        if (dot.x < -20) dot.x = W + 20; if (dot.x > W + 20) dot.x = -20;
        if (dot.y < -20) dot.y = H + 20; if (dot.y > H + 20) dot.y = -20;
      });
    }

    function sceneHot(x, y, radius = 240) {
      const p = pointer(); let hot = Math.max(0, 1 - Math.hypot(x - p.x, y - p.y) / (radius * DPR));
      sceneFields.forEach((field) => { hot = Math.max(hot, Math.max(0, 1 - Math.hypot(x - field.x, y - field.y) / (field.radius * DPR)) * field.life * 1.25); });
      return Math.min(1, hot + sceneDynamics.energy * .08);
    }

    function drawPointerField() {
      const p = pointer();
      const energy = APP.state.pointerEnergy || 0;
      const radius = (150 + energy * 120) * DPR;
      if (Math.hypot(p.x - lastTrailX, p.y - lastTrailY) > 10 * DPR) {
        trails.push({ x: p.x, y: p.y, life: 1, size: 10 + energy * 15 });
        lastTrailX = p.x; lastTrailY = p.y;
      }
      while (trails.length > 26) trails.shift();
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      glow.addColorStop(0, ink(.34 + energy * .22));
      glow.addColorStop(.24, inkSecondary(.16));
      glow.addColorStop(.5, ink(.075));
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
      ctx.strokeStyle = ink(.3 + energy * .28);
      ctx.lineWidth = DPR;
      ctx.beginPath(); ctx.arc(p.x, p.y, (23 + energy * 16) * DPR, tick * 1.5, tick * 1.5 + Math.PI * 1.55); ctx.stroke();
      ctx.strokeStyle = inkSecondary(.34 + energy * .3);
      ctx.beginPath(); ctx.arc(p.x, p.y, (41 + Math.sin(tick * 3) * 5 + energy * 14) * DPR, -tick, -tick + Math.PI * 1.25); ctx.stroke();
      for (let node = 0; node < 4; node += 1) {
        const a = tick * 1.8 + node * Math.PI / 2;
        const r = (50 + energy * 22) * DPR;
        ctx.fillStyle = node % 2 ? inkSecondary(.75) : ink(.72); ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, (2.8 + energy * 1.8) * DPR, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = trails.length - 1; i >= 0; i -= 1) {
        const trail = trails[i]; trail.life -= .035;
        if (trail.life <= 0) { trails.splice(i, 1); continue; }
        ctx.fillStyle = ink(trail.life * .23); ctx.beginPath(); ctx.arc(trail.x, trail.y, trail.size * (1.35 - trail.life) * DPR, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const ripple = ripples[i]; ripple.life -= .018;
        if (ripple.life <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = ink(ripple.life * .35); ctx.lineWidth = DPR;
        ctx.beginPath(); ctx.arc(ripple.x, ripple.y, (1 - ripple.life) * 115 * DPR, 0, Math.PI * 2); ctx.stroke();
      }
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i]; spark.life -= .025; spark.x += spark.vx * DPR; spark.y += spark.vy * DPR;
        if (spark.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = i % 2 ? inkSecondary(spark.life * .8) : ink(spark.life * .8);
        ctx.beginPath(); ctx.arc(spark.x, spark.y, (1.2 + spark.life * 2.4) * DPR, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawNetwork(constellation = false) {
      updatePoints(); const p = pointer(); const max = (constellation ? 170 : 135) * DPR;
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i]; const hot = sceneHot(a.x, a.y, 245);
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < max) line(a.x, a.y, b.x, b.y, (1 - d / max) * (constellation ? .58 : .46));
        }
        if (hot > .08) line(a.x, a.y, p.x, p.y, hot * .42, .8 + hot);
        ctx.fillStyle = i % 4 === 0 ? inkSecondary((constellation ? .74 : .56) + hot * .25) : ink((constellation ? .82 : .62) + hot * .18);
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r + hot * 2.2 * DPR, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawOscilloscope() {
      const p = pointer();
      for (let row = 0; row < 5; row += 1) {
        const base = H * (.18 + row * .16); ctx.strokeStyle = row % 2 ? inkSecondary(.26 + row * .025) : ink(.28 + row * .03); ctx.lineWidth = (row === 2 ? 1.8 : 1.15) * DPR; ctx.beginPath();
        for (let x = 0; x <= W; x += 8 * DPR) {
          const influence = Math.exp(-Math.pow((x - p.x) / (160 * DPR), 2)) * Math.sin((x - p.x) / (18 * DPR));
          const y = base + Math.sin(x / (42 * DPR) + tick * (1 + row * .08)) * (18 + row * 4) * DPR + influence * (30 + (APP.state.pointerEnergy || 0) * 22) * DPR;
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = inkSecondary(.85); ctx.beginPath(); ctx.arc(p.x, p.y, (4 + (APP.state.pointerEnergy || 0) * 3) * DPR, 0, Math.PI * 2); ctx.fill();
    }

    function drawPCB(neon = false) {
      const step = 78 * DPR; const p = pointer();
      for (let x = 28 * DPR; x < W; x += step) for (let y = 32 * DPR; y < H; y += step) {
        const glow = sceneHot(x, y, 230);
        ctx.fillStyle = ((x / step + y / step) % 3 < 1) ? inkSecondary(.22 + glow * .44) : ink(.22 + glow * .44); ctx.beginPath(); ctx.arc(x, y, (2.8 + glow * 2.3) * DPR, 0, Math.PI * 2); ctx.fill();
        line(x, y, x + step * .56, y, .16 + glow * .38, neon ? 1.8 : 1.25); line(x + step * .56, y, x + step * .56, y + step * .4, .14 + glow * .32, neon ? 1.8 : 1.25);
        const packet = (tick * 54 + x / DPR + y / DPR) % (step * .56); ctx.fillStyle = glow > .08 ? inkSecondary(.75) : ink(.42); ctx.beginPath(); ctx.arc(x + packet, y, (1.8 + glow) * DPR, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawLogic() {
      const p = pointer(); const step = 44 * DPR;
      for (let x = 0; x < W; x += step) line(x, 0, x, H, .11 + Math.max(0, 1 - Math.abs(x - p.x) / (210 * DPR)) * .27);
      for (let y = 0; y < H; y += step) line(0, y, W, y, .11 + Math.max(0, 1 - Math.abs(y - p.y) / (210 * DPR)) * .27);
      for (let i = 0; i < 24; i += 1) { const x = ((i * 151 + tick * 55) % W); const y = ((i * 97) % H); const hot = sceneHot(x, y, 230); ctx.strokeStyle = i % 3 ? ink(.28 + hot * .5) : inkSecondary(.28 + hot * .5); ctx.lineWidth = (1 + hot) * DPR; ctx.strokeRect(x, y, 26 * DPR, 17 * DPR); line(x + 26 * DPR, y + 8 * DPR, x + 50 * DPR, y + 8 * DPR, .3 + hot * .42); ctx.fillStyle = i % 2 ? ink(.55) : inkSecondary(.55); ctx.font = `${9 * DPR}px monospace`; ctx.fillText(i % 2 ? "1" : "0", x + 9 * DPR, y + 12 * DPR); }
    }

    function drawAurora() {
      const p = pointer();
      for (let band = 0; band < 4; band += 1) {
        const gradient = ctx.createLinearGradient(0, 0, W, H); gradient.addColorStop(0, ink(.035)); gradient.addColorStop(.45, band % 2 ? inkSecondary(.2) : ink(.21)); gradient.addColorStop(1, "transparent");
        ctx.strokeStyle = gradient; ctx.lineWidth = (42 - band * 7) * DPR; ctx.beginPath();
        for (let x = -30 * DPR; x <= W + 30 * DPR; x += 18 * DPR) { const y = H * (.17 + band * .18) + Math.sin(x / (105 * DPR) + tick + band) * 42 * DPR + Math.exp(-Math.pow((x - p.x) / (260 * DPR), 2)) * Math.sin(tick * 3 + band) * 42 * DPR; x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }

    function drawSilicon() {
      const p = pointer(); const size = 86 * DPR;
      ctx.lineWidth = DPR;
      for (let x = -size; x < W + size; x += size) for (let y = -size; y < H + size; y += size) {
        const ox = x + (y / size % 2) * size * .3; const hot = sceneHot(ox, y, 270);
        ctx.strokeStyle = ((x + y) / size) % 3 ? ink(.2 + hot * .48) : inkSecondary(.2 + hot * .48);
        ctx.lineWidth = (1 + hot * 1.4) * DPR; ctx.strokeRect(ox, y, size * .72, size * .72);
        line(ox, y + size * .36, ox + size * .72, y + size * .36, .18 + hot * .4);
        ctx.fillStyle = hot > .1 ? inkSecondary(.14 + hot * .35) : ink(.09); ctx.fillRect(ox + size * .23, y + size * .23, size * .25, size * .25);
      }
      const pulse = (28 + Math.sin(tick * 4) * 8) * DPR; ctx.strokeStyle = inkSecondary(.62); ctx.beginPath(); ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2); ctx.stroke();
    }

    function drawTerminal() {
      const p = pointer();
      for (let y = 20 * DPR; y < H; y += 24 * DPR) line(0, y, W, y, .11);
      const scan = (Math.sin(tick * 1.2) * .5 + .5) * W; line(scan, 0, scan, H, .34, 1.7); line(p.x, 0, p.x, H, .34 + (APP.state.pointerEnergy || 0) * .36, 1.4);
      ctx.font = `${12 * DPR}px monospace`;
      for (let i = 0; i < 20; i += 1) {
        const x = (i * 137 * DPR + tick * 34 * DPR) % W; const y = (i * 71 % Math.max(1, H / DPR)) * DPR; const hot = Math.max(0, 1 - Math.hypot(x - p.x, y - p.y) / (220 * DPR));
        ctx.fillStyle = i % 3 ? ink(.25 + hot * .55) : inkSecondary(.28 + hot * .55); ctx.fillText(i % 2 ? ">" : "_", x, y);
      }
      ctx.fillStyle = ink(.72); ctx.fillRect(22 * DPR, 28 * DPR, 8 * DPR, 15 * DPR);
    }

    function drawBlueprint() {
      const p = pointer(); const step = 52 * DPR;
      for (let x = 0; x < W; x += step) line(x, 0, x, H, .12 + Math.max(0, 1 - Math.abs(x - p.x) / (210 * DPR)) * .28);
      for (let y = 0; y < H; y += step) line(0, y, W, y, .12 + Math.max(0, 1 - Math.abs(y - p.y) / (210 * DPR)) * .28);
      ctx.setLineDash([4 * DPR, 6 * DPR]); ctx.strokeStyle = inkSecondary(.34); ctx.strokeRect(W * .18, H * .28, W * .25, H * .18); ctx.setLineDash([]);
      line(W * .18, H * .5, W * .43, H * .5, .35); line(p.x - 70 * DPR, p.y, p.x + 70 * DPR, p.y, .58); line(p.x, p.y - 70 * DPR, p.x, p.y + 70 * DPR, .58);
      ctx.strokeStyle = inkSecondary(.55); ctx.beginPath(); ctx.arc(p.x, p.y, (32 + Math.sin(tick * 4) * 6) * DPR, 0, Math.PI * 2); ctx.stroke();
    }

    function drawBubbles() {
      updatePoints(); const p = pointer();
      points.forEach((dot, i) => {
        const dx = dot.x - p.x; const dy = dot.y - p.y; const distance = Math.hypot(dx, dy) || 1; const glow = sceneHot(dot.x, dot.y, 230);
        if (glow > 0) { dot.x += dx / distance * glow * 1.7 * DPR; dot.y += dy / distance * glow * 1.7 * DPR; }
        const r = (9 + (i % 5) * 2.6 + glow * 5) * DPR;
        ctx.fillStyle = i % 3 ? ink(.13 + glow * .25) : inkSecondary(.14 + glow * .27); ctx.strokeStyle = i % 3 ? ink(.4 + glow * .42) : inkSecondary(.42 + glow * .42); ctx.lineWidth = (1.1 + glow) * DPR;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (i % 4 === 0 && r > 11 * DPR) {
          ctx.fillStyle = inkSecondary(.8); ctx.beginPath(); ctx.arc(dot.x - r * .28, dot.y - r * .08, 1.4 * DPR, 0, Math.PI * 2); ctx.arc(dot.x + r * .28, dot.y - r * .08, 1.4 * DPR, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = ink(.65); ctx.beginPath(); ctx.arc(dot.x, dot.y + r * .06, r * .3, .15, Math.PI - .15); ctx.stroke();
        }
      });
    }

    function drawPaper() {
      const p = pointer(); ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(0, 0, W, H);
      for (let y = 30 * DPR; y < H; y += 28 * DPR) line(0, y, W, y, .15 + Math.max(0, 1 - Math.abs(y - p.y) / (190 * DPR)) * .28);
      ctx.strokeStyle = inkSecondary(.36); ctx.strokeRect(W * .14, H * .2, W * .22, H * .15); line(W * .36, H * .275, W * .5, H * .275, .36);
      for (let i = 0; i < 12; i += 1) { const angle = tick * (i % 2 ? 1 : -1) + i; const radius = (45 + i * 11) * DPR; ctx.fillStyle = i % 2 ? ink(.62) : inkSecondary(.62); ctx.beginPath(); ctx.arc(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius * .55, 2.2 * DPR, 0, Math.PI * 2); ctx.fill(); }
      ctx.setLineDash([5 * DPR, 4 * DPR]); ctx.strokeStyle = ink(.58); ctx.beginPath(); ctx.arc(p.x, p.y, (72 + Math.sin(tick * 3) * 9) * DPR, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }

    function hotAt(x, y, radius = 240) { return sceneHot(x, y, radius); }
    function disc(x, y, radius, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
    function polygon(x, y, radius, sides, rotation = 0) {
      ctx.beginPath();
      for (let i = 0; i <= sides; i += 1) { const angle = rotation + i * Math.PI * 2 / sides; const px = x + Math.cos(angle) * radius; const py = y + Math.sin(angle) * radius; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    }

    function drawGravity() {
      const p = pointer();
      for (let ring = 1; ring <= 8; ring += 1) { ctx.strokeStyle = ring % 2 ? ink(.13 + ring * .018) : inkSecondary(.13 + ring * .018); ctx.lineWidth = (1 + (8 - ring) * .08) * DPR; ctx.beginPath(); ctx.ellipse(p.x, p.y, ring * 40 * DPR, ring * 22 * DPR, tick * .22, 0, Math.PI * 2); ctx.stroke(); }
      for (let i = 0; i < 54; i += 1) { const radius = (34 + (i % 14) * 24) * DPR; const angle = tick * (1.4 - radius / (900 * DPR)) + i * 2.399; const x = p.x + Math.cos(angle) * radius; const y = p.y + Math.sin(angle) * radius * .56; disc(x, y, (1.3 + i % 4 * .55) * DPR, i % 3 ? ink(.72) : inkSecondary(.82)); }
      const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 54 * DPR); core.addColorStop(0, inkSecondary(.82)); core.addColorStop(.25, ink(.35)); core.addColorStop(1, "transparent"); ctx.fillStyle = core; ctx.fillRect(p.x - 54 * DPR, p.y - 54 * DPR, 108 * DPR, 108 * DPR);
    }

    function drawFireflies() {
      updatePoints(); const p = pointer();
      points.forEach((dot, i) => { const hot = hotAt(dot.x, dot.y, 260); const wobble = Math.sin(tick * 4 + i) * 5 * DPR; const x = dot.x + Math.cos(i) * wobble; const y = dot.y + Math.sin(i * 1.7) * wobble; const radius = (12 + hot * 17) * DPR; const glow = ctx.createRadialGradient(x, y, 0, x, y, radius); glow.addColorStop(0, i % 4 ? ink(.9) : inkSecondary(.95)); glow.addColorStop(.16, ink(.45 + hot * .3)); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); disc(x, y, (1.5 + hot * 2.2) * DPR, ink(.9)); if (hot > .25) line(x, y, p.x, p.y, hot * .18, .7); });
    }

    function drawKoi() {
      const p = pointer();
      for (let wave = 0; wave < 7; wave += 1) { ctx.strokeStyle = wave % 2 ? ink(.11) : inkSecondary(.09); ctx.beginPath(); ctx.arc(p.x, p.y, (36 + wave * 31 + Math.sin(tick * 4 + wave) * 6) * DPR, 0, Math.PI * 2); ctx.stroke(); }
      for (let i = 0; i < 14; i += 1) { const direction = i % 2 ? 1 : -1; const x = ((i * 173 * DPR + direction * tick * 48 * DPR) % (W + 180 * DPR) + W + 180 * DPR) % (W + 180 * DPR) - 90 * DPR; const baseY = (70 + (i * 97) % Math.max(100, H / DPR - 100)) * DPR; const y = baseY + Math.sin(tick * 2 + i) * 22 * DPR + (p.y - baseY) * hotAt(x, baseY, 230) * .16; const angle = Math.atan2((p.y - y) * hotAt(x, y, 210), direction * 230 * DPR); ctx.save(); ctx.translate(x, y); ctx.rotate(angle + (direction < 0 ? Math.PI : 0)); ctx.fillStyle = i % 3 ? ink(.3) : inkSecondary(.48); ctx.beginPath(); ctx.ellipse(0, 0, 25 * DPR, 10 * DPR, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-20 * DPR, 0); ctx.lineTo(-37 * DPR, -12 * DPR); ctx.lineTo(-34 * DPR, 12 * DPR); ctx.closePath(); ctx.fill(); disc(14 * DPR, -2 * DPR, 1.6 * DPR, inkSecondary(.9)); ctx.restore(); }
    }

    function drawCandy() {
      const p = pointer();
      for (let i = 0; i < 46; i += 1) { const lane = (i * 83 % Math.max(1, W / DPR)) * DPR; const y = ((i * 61 * DPR + tick * (42 + i % 5 * 10) * DPR) % (H + 100 * DPR)) - 50 * DPR; const hot = hotAt(lane, y, 210); const x = lane + (lane < p.x ? -1 : 1) * hot * 52 * DPR + Math.sin(tick * 3 + i) * 8 * DPR; ctx.save(); ctx.translate(x, y); ctx.rotate(tick * (i % 2 ? 1 : -1) + i); ctx.fillStyle = i % 3 === 0 ? inkSecondary(.52 + hot * .3) : ink(.42 + hot * .36); ctx.fillRect(-12 * DPR, -6 * DPR, 24 * DPR, 12 * DPR); ctx.beginPath(); ctx.moveTo(-12 * DPR, 0); ctx.lineTo(-22 * DPR, -8 * DPR); ctx.lineTo(-22 * DPR, 8 * DPR); ctx.closePath(); ctx.moveTo(12 * DPR, 0); ctx.lineTo(22 * DPR, -8 * DPR); ctx.lineTo(22 * DPR, 8 * DPR); ctx.closePath(); ctx.fill(); ctx.restore(); }
    }

    function drawMagnetic() {
      const p = pointer(); const gap = 74 * DPR;
      for (let i = -6; i <= 6; i += 1) { const offset = i * 18 * DPR; ctx.strokeStyle = i % 2 ? ink(.2 + Math.abs(i) * .012) : inkSecondary(.2 + Math.abs(i) * .012); ctx.lineWidth = (1.1 + (6 - Math.abs(i)) * .09) * DPR; ctx.beginPath(); ctx.moveTo(0, p.y + offset); ctx.bezierCurveTo(p.x - gap * 2, p.y + offset * 2.1, p.x - gap, p.y - offset * 1.2, p.x, p.y); ctx.bezierCurveTo(p.x + gap, p.y + offset * 1.2, p.x + gap * 2, p.y - offset * 2.1, W, p.y - offset); ctx.stroke(); }
      ctx.fillStyle = ink(.72); ctx.fillRect(p.x - 54 * DPR, p.y - 15 * DPR, 45 * DPR, 30 * DPR); ctx.fillStyle = inkSecondary(.72); ctx.fillRect(p.x + 9 * DPR, p.y - 15 * DPR, 45 * DPR, 30 * DPR);
      for (let i = 0; i < 30; i += 1) { const a = i * 2.1 + tick; const r = (80 + i % 8 * 27) * DPR; disc(p.x + Math.cos(a) * r, p.y + Math.sin(a * 1.4) * r * .42, 2 * DPR, i % 2 ? ink(.7) : inkSecondary(.7)); }
    }

    function drawGarden() {
      const step = 74 * DPR; const p = pointer();
      for (let x = 35 * DPR; x < W; x += step) for (let y = 45 * DPR; y < H; y += step) { const hot = hotAt(x, y, 235); const stem = (12 + hot * 24 + Math.sin(tick * 3 + x / step) * 3) * DPR; line(x, y + 22 * DPR, x, y + 22 * DPR - stem, .3 + hot * .35, 2); const top = y + 22 * DPR - stem; const bloom = (3 + hot * 6) * DPR; for (let petal = 0; petal < 4; petal += 1) { const a = petal * Math.PI / 2 + tick * .3; ctx.fillStyle = petal % 2 ? inkSecondary(.55 + hot * .3) : ink(.5 + hot * .35); ctx.fillRect(x + Math.cos(a) * bloom - 3 * DPR, top + Math.sin(a) * bloom - 3 * DPR, 6 * DPR, 6 * DPR); } disc(x, top, 2.8 * DPR, inkSecondary(.9)); }
      disc(p.x, p.y, 6 * DPR, ink(.6));
    }

    function drawStarTunnel() {
      const p = pointer();
      for (let i = 0; i < 100; i += 1) { const phase = (tick * (36 + i % 7 * 5) + i * 23) % 100; const scale = phase / 100; const angle = i * 2.399; const radius = scale * Math.max(W, H) * .72; const x = p.x + Math.cos(angle) * radius; const y = p.y + Math.sin(angle) * radius; const previous = Math.max(0, scale - .045); ctx.strokeStyle = i % 4 ? ink(.25 + scale * .65) : inkSecondary(.28 + scale * .65); ctx.lineWidth = (1 + scale * 2.4) * DPR; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(angle) * previous * Math.max(W, H) * .72, p.y + Math.sin(angle) * previous * Math.max(W, H) * .72); ctx.lineTo(x, y); ctx.stroke(); }
    }

    function drawLava() {
      const p = pointer();
      for (let i = 0; i < 16; i += 1) { const baseX = (i * 149 % Math.max(1, W / DPR)) * DPR; const baseY = (H + 180 * DPR) - ((tick * (25 + i % 5 * 8) * DPR + i * 113 * DPR) % (H + 300 * DPR)); const hot = hotAt(baseX, baseY, 280); const x = baseX + Math.sin(tick * 1.8 + i) * (28 + hot * 45) * DPR + (p.x - baseX) * hot * .12; const y = baseY; const radius = (35 + i % 4 * 12 + hot * 22) * DPR; const glow = ctx.createRadialGradient(x - radius * .2, y - radius * .25, radius * .05, x, y, radius); glow.addColorStop(0, i % 2 ? inkSecondary(.68) : ink(.72)); glow.addColorStop(.62, i % 2 ? ink(.31) : inkSecondary(.32)); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(x, y, radius * .72, radius, Math.sin(tick + i) * .25, 0, Math.PI * 2); ctx.fill(); }
    }

    function drawSnow() {
      const p = pointer();
      ctx.strokeStyle = ink(.32); ctx.lineWidth = 2 * DPR; ctx.beginPath(); ctx.arc(p.x, p.y, 145 * DPR, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 72; i += 1) { const x0 = (i * 97 % 290 - 145) * DPR; const y0 = ((i * 61 + tick * (24 + i % 4 * 8)) % 290 - 145) * DPR; const distance = Math.hypot(x0, y0); if (distance > 140 * DPR) continue; const swirl = Math.sin(tick * 4 + i) * 14 * DPR; const x = p.x + x0 + swirl; const y = p.y + y0; const size = (1.5 + i % 3) * DPR; ctx.strokeStyle = i % 4 ? ink(.72) : inkSecondary(.78); line(x - size, y, x + size, y, .72); line(x, y - size, x, y + size, .72); }
      ctx.fillStyle = inkSecondary(.24); ctx.fillRect(p.x - 95 * DPR, p.y + 143 * DPR, 190 * DPR, 16 * DPR);
    }

    function drawHex() {
      const p = pointer(); const radius = 25 * DPR; const xStep = radius * 1.72; const yStep = radius * 1.5;
      for (let row = -1; row < H / yStep + 2; row += 1) for (let col = -1; col < W / xStep + 2; col += 1) { const x = col * xStep + (row % 2) * xStep / 2; const y = row * yStep; const hot = hotAt(x, y, 250); const pulse = Math.max(0, Math.sin(tick * 6 - Math.hypot(x - p.x, y - p.y) / (45 * DPR))); ctx.strokeStyle = (row + col) % 3 ? ink(.15 + hot * .42 + pulse * .12) : inkSecondary(.16 + hot * .42 + pulse * .12); ctx.lineWidth = (1 + hot * 1.3) * DPR; polygon(x, y, radius * (.72 + hot * .18), 6, Math.PI / 6); ctx.stroke(); }
    }

    function drawPong() {
      const p = pointer(); ctx.setLineDash([8 * DPR, 12 * DPR]); line(W / 2, 0, W / 2, H, .25, 1.4); ctx.setLineDash([]);
      ctx.fillStyle = ink(.65); ctx.fillRect(28 * DPR, Math.max(20 * DPR, Math.min(H - 110 * DPR, p.y - 45 * DPR)), 9 * DPR, 90 * DPR); ctx.fillStyle = inkSecondary(.65); ctx.fillRect(W - 37 * DPR, Math.max(20 * DPR, Math.min(H - 110 * DPR, H - p.y - 45 * DPR)), 9 * DPR, 90 * DPR);
      for (let i = 0; i < 5; i += 1) { const phase = tick * (55 + i * 8) + i * 203; const rangeX = Math.max(1, W - 100 * DPR); const travel = phase * DPR % (rangeX * 2); const x = 50 * DPR + (travel > rangeX ? rangeX * 2 - travel : travel); const y = H * (.18 + i * .16) + Math.sin(tick * 3 + i) * 55 * DPR + (p.y - H / 2) * .08; disc(x, y, (5 + i % 2 * 2) * DPR, i % 2 ? inkSecondary(.88) : ink(.88)); }
    }

    function drawAtoms() {
      const p = pointer();
      for (let i = 0; i < 16; i += 1) { const x0 = (70 + i * 149 % Math.max(120, W / DPR - 100)) * DPR; const y0 = (70 + i * 91 % Math.max(120, H / DPR - 100)) * DPR; const hot = hotAt(x0, y0, 245); const x = x0 + (p.x - x0) * hot * .08; const y = y0 + (p.y - y0) * hot * .08; disc(x, y, (3 + hot * 2) * DPR, i % 2 ? ink(.85) : inkSecondary(.85)); for (let orbit = 0; orbit < 3; orbit += 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(orbit * Math.PI / 3 + tick * (.6 + hot)); ctx.strokeStyle = orbit % 2 ? ink(.25 + hot * .3) : inkSecondary(.25 + hot * .3); ctx.beginPath(); ctx.ellipse(0, 0, 22 * DPR, 8 * DPR, 0, 0, Math.PI * 2); ctx.stroke(); disc(Math.cos(tick * 3 + i) * 22 * DPR, Math.sin(tick * 3 + i) * 8 * DPR, 1.7 * DPR, inkSecondary(.9)); ctx.restore(); } }
    }

    function drawJellyfish() {
      const p = pointer();
      for (let i = 0; i < 15; i += 1) { const baseX = (i * 157 % Math.max(1, W / DPR)) * DPR; const y = ((H + 130 * DPR) - ((tick * (18 + i % 4 * 5) * DPR + i * 109 * DPR) % (H + 220 * DPR))); const hot = hotAt(baseX, y, 250); const x = baseX + Math.sin(tick * 2 + i) * 24 * DPR + (baseX < p.x ? -1 : 1) * hot * 30 * DPR; const size = (18 + i % 4 * 4 + hot * 6) * DPR; ctx.fillStyle = i % 3 ? ink(.25 + hot * .2) : inkSecondary(.27 + hot * .22); ctx.beginPath(); ctx.arc(x, y, size, Math.PI, 0); ctx.quadraticCurveTo(x, y + size * .8, x - size, y); ctx.fill(); for (let leg = -2; leg <= 2; leg += 1) { ctx.strokeStyle = leg % 2 ? ink(.36 + hot * .25) : inkSecondary(.36 + hot * .25); ctx.beginPath(); ctx.moveTo(x + leg * size * .28, y + size * .1); ctx.bezierCurveTo(x + leg * size * .4 + Math.sin(tick * 4 + leg) * 8 * DPR, y + size, x + leg * size * .2, y + size * 1.5, x + leg * size * .35, y + size * 2); ctx.stroke(); } }
    }

    function drawSprouts() {
      const p = pointer();
      for (let i = 0; i < 38; i += 1) { const x = (i * 101 % Math.max(1, W / DPR)) * DPR; const ground = H - (i % 5) * 34 * DPR; const hot = hotAt(x, ground - 80 * DPR, 260); const height = (28 + i % 7 * 13 + hot * 70) * DPR; ctx.strokeStyle = i % 3 ? ink(.3 + hot * .38) : inkSecondary(.3 + hot * .38); ctx.lineWidth = (1.2 + hot) * DPR; ctx.beginPath(); ctx.moveTo(x, ground); ctx.quadraticCurveTo(x + Math.sin(tick * 2 + i) * 18 * DPR, ground - height * .55, x, ground - height); ctx.stroke(); const top = ground - height; ctx.fillStyle = i % 2 ? ink(.55 + hot * .25) : inkSecondary(.55 + hot * .25); ctx.beginPath(); ctx.ellipse(x - 7 * DPR, top + 8 * DPR, 10 * DPR, 4 * DPR, -.5, 0, Math.PI * 2); ctx.ellipse(x + 7 * DPR, top + 8 * DPR, 10 * DPR, 4 * DPR, .5, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = ink(.45); ctx.font = `${11 * DPR}px monospace`; ctx.fillText("01", p.x + 18 * DPR, p.y - 18 * DPR);
    }

    function drawComets() {
      const p = pointer();
      for (let i = 0; i < 34; i += 1) { const phase = (tick * (62 + i % 6 * 9) + i * 97) * DPR; const x0 = phase % (W + 300 * DPR) - 150 * DPR; const y0 = (i * 73 % Math.max(1, H / DPR)) * DPR; const hot = hotAt(x0, y0, 260); const x = x0 + (p.x - x0) * hot * .12; const y = y0 + (p.y - y0) * hot * .18; const length = (24 + i % 5 * 12 + hot * 38) * DPR; const gradient = ctx.createLinearGradient(x - length, y + length * .3, x, y); gradient.addColorStop(0, "transparent"); gradient.addColorStop(1, i % 3 ? ink(.82) : inkSecondary(.85)); ctx.strokeStyle = gradient; ctx.lineWidth = (1.2 + hot * 2) * DPR; ctx.beginPath(); ctx.moveTo(x - length, y + length * .3); ctx.quadraticCurveTo(x - length * .45, y + Math.sin(tick * 4 + i) * 10 * DPR, x, y); ctx.stroke(); disc(x, y, (2.5 + hot * 2) * DPR, i % 3 ? ink(.95) : inkSecondary(.95)); }
    }

    function drawSonar() {
      const p = pointer(); const maxRadius = Math.max(W, H) * .55;
      for (let i = 0; i < 7; i += 1) { const radius = ((tick * 90 * DPR + i * maxRadius / 7) % maxRadius); ctx.strokeStyle = i % 2 ? ink(.32 * (1 - radius / maxRadius)) : inkSecondary(.32 * (1 - radius / maxRadius)); ctx.lineWidth = 1.5 * DPR; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke(); }
      const sweep = tick * 2.4; line(p.x, p.y, p.x + Math.cos(sweep) * maxRadius, p.y + Math.sin(sweep) * maxRadius, .55, 2);
      for (let i = 0; i < 24; i += 1) { const a = i * 2.7; const r = (50 + i % 8 * 47) * DPR; const delta = Math.abs(Math.atan2(Math.sin(a - sweep), Math.cos(a - sweep))); const bright = Math.max(.18, 1 - delta * 1.8); disc(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, (2 + bright * 2) * DPR, i % 3 ? ink(bright) : inkSecondary(bright)); }
    }

    function drawKaleido() {
      const p = pointer(); const arms = 16;
      for (let ring = 1; ring <= 7; ring += 1) for (let arm = 0; arm < arms; arm += 1) { const angle = arm * Math.PI * 2 / arms + tick * (ring % 2 ? .35 : -.25); const radius = ring * 35 * DPR; const x = p.x + Math.cos(angle) * radius; const y = p.y + Math.sin(angle) * radius; ctx.fillStyle = (arm + ring) % 2 ? ink(.12 + ring * .035) : inkSecondary(.13 + ring * .035); polygon(x, y, (10 + ring * 2) * DPR, 3 + ring % 3, angle + tick); ctx.fill(); ctx.strokeStyle = (arm + ring) % 2 ? ink(.48) : inkSecondary(.48); ctx.stroke(); }
    }

    function drawPinball() {
      const p = pointer(); const step = 82 * DPR;
      for (let x = 45 * DPR; x < W; x += step) for (let y = 45 * DPR; y < H; y += step) { const ox = x + ((y / step) % 2) * step * .5; const hot = hotAt(ox, y, 210); ctx.strokeStyle = hot > .15 ? inkSecondary(.72) : ink(.3); ctx.lineWidth = (1.2 + hot * 1.8) * DPR; ctx.beginPath(); ctx.arc(ox, y, (7 + hot * 4) * DPR, 0, Math.PI * 2); ctx.stroke(); }
      for (let i = 0; i < 6; i += 1) { const angle = tick * (1.4 + i * .08) + i; const radius = (45 + i * 35) * DPR; const x = p.x + Math.cos(angle) * radius; const y = p.y + Math.sin(angle * 1.7) * radius * .7; const glow = ctx.createRadialGradient(x, y, 0, x, y, 18 * DPR); glow.addColorStop(0, i % 2 ? inkSecondary(.95) : ink(.95)); glow.addColorStop(1, "transparent"); ctx.fillStyle = glow; ctx.fillRect(x - 18 * DPR, y - 18 * DPR, 36 * DPR, 36 * DPR); disc(x, y, 4 * DPR, "white"); }
    }

    function drawClockwork() {
      const p = pointer();
      for (let i = 0; i < 14; i += 1) { const x0 = (70 + i * 137 % Math.max(120, W / DPR - 100)) * DPR; const y0 = (70 + i * 89 % Math.max(120, H / DPR - 100)) * DPR; const hot = hotAt(x0, y0, 270); const radius = (20 + i % 5 * 7 + hot * 8) * DPR; const rotation = tick * (i % 2 ? 1 : -1) * (1 + hot * 2); ctx.strokeStyle = i % 3 ? ink(.36 + hot * .35) : inkSecondary(.38 + hot * .35); ctx.lineWidth = 3 * DPR; ctx.beginPath(); for (let tooth = 0; tooth <= 24; tooth += 1) { const a = rotation + tooth * Math.PI * 2 / 24; const r = radius * (tooth % 2 ? 1 : 1.16); const x = x0 + Math.cos(a) * r; const y = y0 + Math.sin(a) * r; tooth ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke(); disc(x0, y0, radius * .25, i % 2 ? inkSecondary(.55) : ink(.55)); line(x0, y0, x0 + Math.cos(rotation) * radius * .8, y0 + Math.sin(rotation) * radius * .8, .65, 1.5); }
    }

    function drawPlasma() {
      const p = pointer(); const step = 48 * DPR;
      for (let x = 0; x < W + step; x += step) for (let y = 0; y < H + step; y += step) { const distance = Math.hypot(x - p.x, y - p.y); const wave = (Math.sin(x / (80 * DPR) + tick * 3) + Math.cos(y / (75 * DPR) - tick * 2.2) + Math.sin(distance / (55 * DPR) - tick * 5)) / 3; const hot = hotAt(x, y, 260); const radius = (2.2 + (wave + 1) * 2 + hot * 4) * DPR; disc(x + Math.sin(tick + y / step) * 8 * DPR, y + Math.cos(tick + x / step) * 8 * DPR, radius, wave > 0 ? ink(.25 + (wave + 1) * .22 + hot * .2) : inkSecondary(.25 + (-wave + 1) * .2 + hot * .2)); }
    }

    function styleSeed(style) {
      let hash = 2166136261;
      for (const char of style) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
      return hash >>> 0;
    }

    function effectFamily(style) {
      if (/wave|ribbon|water|tentacle|molten|aurora|plasma/.test(style)) return "ribbon";
      if (/bubble|snow|firefly|sprinkle|electron|glow/.test(style)) return "dots";
      if (/circuit|route|trace|flux|draft|line|thread|chain/.test(style)) return "circuit";
      if (/vine|garden|seed|flower|bloom/.test(style)) return "garden";
      if (/star|comet|warp|meteor|prism/.test(style)) return "stars";
      if (/gear|cog|clock/.test(style)) return "gear";
      return "shapes";
    }

    function addGestureEffect(action, x, y, style, duration = 1) {
      gestureEffects.push({ action, x, y, style, life: duration, initialLife: duration, seed: styleSeed(style) });
      while (gestureEffects.length > 18) gestureEffects.shift();
    }

    function exciteScene(action, x, y, style, dx = 0, dy = 0) {
      const seed = styleSeed(style); const strength = action === "hold" ? 1.8 : action === "drag" ? .72 : 1.15;
      sceneFields.push({ action, x, y, dx, dy, style, seed, strength, radius: action === "hold" ? 390 : action === "drag" ? 185 : 285, life: action === "hold" ? 1.65 : 1 });
      while (sceneFields.length > 14) sceneFields.shift();
      sceneDynamics.energy = Math.min(2.4, sceneDynamics.energy + strength * .62);
      sceneDynamics.rotationVelocity += ((seed % 17) - 8) * .000055 * strength;
      sceneDynamics.scaleVelocity += (seed % 2 ? 1 : -1) * .0012 * strength;
      if (action === "hold") sceneDynamics.timeDirection = seed % 3 === 0 ? -.85 : 1.8 + seed % 5 * .16;
      if (action === "drag") { sceneDynamics.panVX += dx * .0035; sceneDynamics.panVY += dy * .0035; }
      points.forEach((dot) => {
        const px = dot.x - x; const py = dot.y - y; const distance = Math.hypot(px, py) || 1; const reach = (action === "hold" ? 390 : 285) * DPR;
        if (distance >= reach) return;
        const force = (1 - distance / reach) * strength;
        if (action === "drag") { dot.vx += dx * force * .025; dot.vy += dy * force * .025; }
        else if (action === "hold") { dot.vx += -py / distance * force * .75; dot.vy += px / distance * force * .75; }
        else { const sign = seed % 2 ? 1 : -1; dot.vx += px / distance * force * 1.4 * sign; dot.vy += py / distance * force * 1.4 * sign; }
      });
    }

    function updateSceneDynamics() {
      for (let i = sceneFields.length - 1; i >= 0; i -= 1) { sceneFields[i].life -= sceneFields[i].action === "hold" ? .009 : .025; if (sceneFields[i].life <= 0) sceneFields.splice(i, 1); }
      sceneDynamics.energy *= .955;
      sceneDynamics.rotation += sceneDynamics.rotationVelocity; sceneDynamics.rotationVelocity *= .92; sceneDynamics.rotation *= .975;
      sceneDynamics.scale += sceneDynamics.scaleVelocity; sceneDynamics.scaleVelocity *= .9; sceneDynamics.scale += (1 - sceneDynamics.scale) * .055; sceneDynamics.scale = Math.max(.985, Math.min(1.035, sceneDynamics.scale));
      sceneDynamics.panX += sceneDynamics.panVX; sceneDynamics.panY += sceneDynamics.panVY; sceneDynamics.panVX *= .88; sceneDynamics.panVY *= .88; sceneDynamics.panX *= .94; sceneDynamics.panY *= .94;
      sceneDynamics.timeDirection += (1 - sceneDynamics.timeDirection) * .018;
    }

    function drawGestureEffects() {
      for (let i = gestureEffects.length - 1; i >= 0; i -= 1) {
        const effect = gestureEffects[i]; effect.life -= effect.action === "hold" ? .008 : .022;
        if (effect.life <= 0) { gestureEffects.splice(i, 1); continue; }
        const progress = 1 - effect.life / effect.initialLife; const alpha = Math.min(1, effect.life) * (effect.action === "hold" ? .68 : .82); const family = effectFamily(effect.style); const direction = effect.seed % 2 ? 1 : -1; const count = 5 + effect.seed % 8;
        if (effect.action === "hold") {
          const radius = (55 + progress * 190) * DPR;
          for (let ring = 0; ring < 4; ring += 1) { ctx.strokeStyle = ring % 2 ? inkSecondary(alpha * (.72 - ring * .1)) : ink(alpha * (.72 - ring * .1)); ctx.lineWidth = (2.2 - ring * .3) * DPR; ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * (1 - ring * .13) + Math.sin(tick * 5 + ring) * 8 * DPR, 0, Math.PI * 2); ctx.stroke(); }
          for (let node = 0; node < count + 5; node += 1) { const angle = direction * tick * (1.4 + effect.seed % 5 * .08) + node * Math.PI * 2 / (count + 5); const orbit = radius * (.48 + (node % 3) * .16); ctx.fillStyle = node % 2 ? inkSecondary(alpha) : ink(alpha); polygon(effect.x + Math.cos(angle) * orbit, effect.y + Math.sin(angle) * orbit, (3 + effect.seed % 5) * DPR, 3 + effect.seed % 5, angle); ctx.fill(); }
          continue;
        }
        const radius = (18 + progress * (95 + effect.seed % 70)) * DPR;
        ctx.strokeStyle = ink(alpha * .75); ctx.lineWidth = 1.6 * DPR; ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
        for (let piece = 0; piece < count; piece += 1) {
          const angle = piece * Math.PI * 2 / count + direction * progress * 2.4; const distance = radius * (.45 + (piece % 3) * .28); const x = effect.x + Math.cos(angle) * distance; const y = effect.y + Math.sin(angle) * distance;
          if (family === "ribbon") { ctx.strokeStyle = piece % 2 ? inkSecondary(alpha) : ink(alpha); ctx.beginPath(); ctx.moveTo(effect.x, effect.y); ctx.quadraticCurveTo(effect.x + Math.cos(angle + 1) * distance, effect.y + Math.sin(angle + 1) * distance, x, y); ctx.stroke(); }
          else if (family === "dots") disc(x, y, (2.5 + piece % 4) * DPR, piece % 2 ? inkSecondary(alpha) : ink(alpha));
          else if (family === "circuit") { ctx.strokeStyle = piece % 2 ? inkSecondary(alpha) : ink(alpha); ctx.beginPath(); ctx.moveTo(effect.x, effect.y); ctx.lineTo(x, effect.y); ctx.lineTo(x, y); ctx.stroke(); disc(x, y, 2.4 * DPR, ink(alpha)); }
          else if (family === "garden") { ctx.strokeStyle = ink(alpha); ctx.beginPath(); ctx.moveTo(effect.x, effect.y); ctx.quadraticCurveTo(effect.x + Math.cos(angle) * distance * .65, effect.y - distance * .3, x, y); ctx.stroke(); ctx.fillStyle = piece % 2 ? inkSecondary(alpha) : ink(alpha); ctx.beginPath(); ctx.ellipse(x, y, 6 * DPR, 3 * DPR, angle, 0, Math.PI * 2); ctx.fill(); }
          else { ctx.fillStyle = piece % 2 ? inkSecondary(alpha) : ink(alpha); polygon(x, y, (4 + effect.seed % 7) * DPR, family === "stars" ? 5 : 3 + effect.seed % 6, angle); ctx.fill(); }
        }
      }

      for (let i = dragMarks.length - 1; i >= 0; i -= 1) {
        const mark = dragMarks[i]; mark.life -= .026;
        if (mark.life <= 0) { dragMarks.splice(i, 1); continue; }
        const previous = dragMarks[i - 1]; const family = effectFamily(mark.style); const alpha = mark.life * .72; const seed = styleSeed(mark.style);
        if (previous && previous.gestureId === mark.gestureId) {
          ctx.strokeStyle = seed % 2 ? inkSecondary(alpha) : ink(alpha); ctx.lineWidth = (2 + seed % 4 * .5) * DPR; ctx.beginPath(); ctx.moveTo(previous.x, previous.y);
          if (family === "circuit") { ctx.lineTo(mark.x, previous.y); ctx.lineTo(mark.x, mark.y); }
          else if (family === "ribbon") ctx.quadraticCurveTo((previous.x + mark.x) / 2 + Math.sin(tick * 5 + i) * 18 * DPR, (previous.y + mark.y) / 2, mark.x, mark.y);
          else ctx.lineTo(mark.x, mark.y);
          ctx.stroke();
        }
        if (family === "dots") disc(mark.x, mark.y, (3 + seed % 5) * DPR, seed % 2 ? inkSecondary(alpha) : ink(alpha));
        else if (family === "garden") { ctx.fillStyle = seed % 2 ? inkSecondary(alpha) : ink(alpha); ctx.beginPath(); ctx.ellipse(mark.x, mark.y, 7 * DPR, 3 * DPR, tick + i, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillStyle = seed % 2 ? inkSecondary(alpha) : ink(alpha); polygon(mark.x, mark.y, (3 + seed % 5) * DPR, family === "stars" ? 5 : 3 + seed % 5, tick * (seed % 2 ? 1 : -1)); ctx.fill(); }
      }
    }

    const renderers = { network: () => drawNetwork(), oscilloscope: drawOscilloscope, pcb: () => drawPCB(), logic: drawLogic, aurora: drawAurora, silicon: drawSilicon, terminal: drawTerminal, constellation: () => drawNetwork(true), blueprint: drawBlueprint, bubbles: drawBubbles, neon: () => drawPCB(true), paper: drawPaper, gravity: drawGravity, fireflies: drawFireflies, koi: drawKoi, candy: drawCandy, magnetic: drawMagnetic, garden: drawGarden, "star-tunnel": drawStarTunnel, lava: drawLava, snow: drawSnow, hex: drawHex, pong: drawPong, atoms: drawAtoms, jellyfish: drawJellyfish, sprouts: drawSprouts, comets: drawComets, sonar: drawSonar, kaleido: drawKaleido, pinball: drawPinball, clockwork: drawClockwork, plasma: drawPlasma };

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const kind = type();
      ctx.save();
      ctx.translate(W / 2 + sceneDynamics.panX, H / 2 + sceneDynamics.panY);
      ctx.rotate(sceneDynamics.rotation);
      ctx.scale(sceneDynamics.scale, sceneDynamics.scale);
      ctx.translate(-W / 2, -H / 2);
      (renderers[kind] || drawNetwork)();
      ctx.restore();
      drawGestureEffects();
      drawPointerField();
    }
    function safeDraw() {
      try { draw(); renderErrorReported = false; }
      catch (err) {
        if (!renderErrorReported) console.error("[background] Renderer recovered from an error", err);
        renderErrorReported = true;
      }
    }
    function frame() { updateSceneDynamics(); tick += .012 * sceneDynamics.timeDirection * (1 + sceneDynamics.energy * .72); safeDraw(); if (!reduceMotion()) raf = requestAnimationFrame(frame); }
    function restart() { if (raf) cancelAnimationFrame(raf); raf = 0; safeDraw(); if (!reduceMotion()) raf = requestAnimationFrame(frame); }

    window.addEventListener("resize", () => { resize(); restart(); });
    window.addEventListener("pcarioca:theme-change", restart);

    function isBackgroundGesture(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return false;
      return !event.target.closest("#card,.langbar,.hold-game-layer,.quick-tray,a,button,input,textarea,select,[data-hold-key]");
    }

    function sceneProfile() { return gestureProfiles[type()] || ["scene-pop", "scene-bloom", "scene-trail"]; }

    function finishTap(x, y) {
      const profile = sceneProfile();
      points.push(makePoint(x, y)); ripples.push({ x, y, life: 1 });
      for (let i = 0; i < 14; i += 1) { const angle = Math.PI * 2 * i / 14; sparks.push({ x, y, vx: Math.cos(angle) * (1.2 + Math.random() * 2.2), vy: Math.sin(angle) * (1.2 + Math.random() * 2.2), life: 1 }); }
      exciteScene("click", x, y, profile[0]);
      addGestureEffect("click", x, y, profile[0]);
      if (points.length > 96) points.shift();
    }

    function cancelGesture() {
      if (!activeGesture) return;
      clearTimeout(activeGesture.holdTimer); activeGesture = null;
    }

    window.addEventListener("pointerdown", (event) => {
      if (!isBackgroundGesture(event)) return;
      event.preventDefault();
      const x = event.clientX * DPR; const y = event.clientY * DPR; const profile = sceneProfile();
      activeGesture = { pointerId: event.pointerId, startX: x, startY: y, lastX: x, lastY: y, moved: false, held: false, gestureId: `${event.pointerId}-${performance.now()}`, profile, holdTimer: 0 };
      activeGesture.holdTimer = setTimeout(() => {
        if (!activeGesture || activeGesture.moved) return;
        activeGesture.held = true;
        exciteScene("hold", activeGesture.startX, activeGesture.startY, activeGesture.profile[1]);
        addGestureEffect("hold", activeGesture.startX, activeGesture.startY, activeGesture.profile[1], 1.75);
        ripples.push({ x: activeGesture.startX, y: activeGesture.startY, life: 1 });
      }, 520);
    }, { capture: true });

    window.addEventListener("pointermove", (event) => {
      if (!activeGesture || event.pointerId !== activeGesture.pointerId) return;
      const x = event.clientX * DPR; const y = event.clientY * DPR; const distanceFromStart = Math.hypot(x - activeGesture.startX, y - activeGesture.startY);
      if (distanceFromStart > 10 * DPR && !activeGesture.moved) { activeGesture.moved = true; clearTimeout(activeGesture.holdTimer); }
      if (!activeGesture.moved || Math.hypot(x - activeGesture.lastX, y - activeGesture.lastY) < 7 * DPR) return;
      const dx = x - activeGesture.lastX; const dy = y - activeGesture.lastY;
      dragMarks.push({ x, y, life: 1, style: activeGesture.profile[2], gestureId: activeGesture.gestureId });
      exciteScene("drag", x, y, activeGesture.profile[2], dx, dy);
      while (dragMarks.length > 90) dragMarks.shift();
      activeGesture.lastX = x; activeGesture.lastY = y;
    }, { capture: true, passive: true });

    window.addEventListener("pointerup", (event) => {
      if (!activeGesture || event.pointerId !== activeGesture.pointerId) return;
      clearTimeout(activeGesture.holdTimer);
      const gesture = activeGesture; activeGesture = null;
      const x = event.clientX * DPR; const y = event.clientY * DPR;
      if (gesture.moved) addGestureEffect("click", x, y, gesture.profile[2]);
      else if (!gesture.held) finishTap(x, y);
    }, { capture: true, passive: true });

    window.addEventListener("pointercancel", cancelGesture, { capture: true, passive: true });
    window.addEventListener("contextmenu", (event) => { if (activeGesture) event.preventDefault(); }, { capture: true });
    window.addEventListener("blur", cancelGesture);
    resize(); restart(); APP.state.canvasInitialized = true;
    console.info(`[background] Interactive ${type()} renderer ready`);
  }
  APP.api.initCanvas = initCanvas;
})();
