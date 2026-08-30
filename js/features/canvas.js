(() => {
  const APP = window.PCARIOCA_APP;
  const { $ } = APP.helpers;

  function initCanvas() {
    if (APP.state.canvasInitialized) return;

    const canvas = $("#bg");
    if (!canvas) {
      console.warn("[app] Missing selector: #bg");
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      console.warn("[app] 2D canvas context unavailable");
      return;
    }

    let W = 0;
    let H = 0;
    let DPR = 1;

    function resize() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.width = Math.floor(innerWidth * DPR);
      H = canvas.height = Math.floor(innerHeight * DPR);
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
    }

    addEventListener("resize", resize);
    resize();

    const N = Math.max(60, Math.floor((innerWidth * innerHeight) / 26000));
    const pts = new Array(N).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.01 * DPR,
      vy: (Math.random() - 0.5) * 0.01 * DPR,
      r: (Math.random() * 0.6 + 0.6) * DPR
    }));

    let t = 0;
    function frame() {
      t += 0.006;
      ctx.clearRect(0, 0, W, H);

      const mx = APP.state.mx == null ? innerWidth * 0.5 : APP.state.mx;
      const my = APP.state.my == null ? innerHeight * 0.35 : APP.state.my;

      // Haze around mouse
      const gx = mx * DPR;
      const gy = my * DPR;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(W, H) * 0.55);
      g.addColorStop(0, "rgba(96, 165, 250, 0.26)");
      g.addColorStop(0.55, "rgba(167, 139, 250, 0.25)");
      g.addColorStop(1, "rgba(45, 39, 39, 0.21)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Particles
      var maxD = 105 * DPR;
      for (const p of pts) {
        // maxD += 2;
        const ax = (gx - p.x) * 0.00000001 * (Math.random() - 1);
        const ay = (gy - p.y) * 0.00000001 * (Math.random() - 1);

        p.vx += (Math.cos(t + p.y * 0.002) * 0.0008 * DPR + ax)*0.1;
        p.vy += (Math.sin(t + p.x * 0.002) * 0.0008 * DPR + ay)*0.1;

        p.x += p.vx * 60;
        p.y += p.vy * 60;

        if (p.x < -50) p.x = W + 50;
        if (p.x > W + 50) p.x = -50;
        if (p.y < -50) p.y = H + 50;
        if (p.y > H + 50) p.y = -50;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI);
        ctx.fillStyle = "rgba(255,255,255,.98)";
        ctx.fill();
      }

      // Connections

      for (let i = 0; i < pts.length; i += 1) {

        for (let j = i + 1; j < pts.length; j += 1) {
          
          const a = pts[i];
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD * maxD) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / maxD) * 0.56;
            ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
            ctx.lineWidth = 1 * DPR;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
    APP.state.canvasInitialized = true;
  }

  APP.api.initCanvas = initCanvas;
})();
