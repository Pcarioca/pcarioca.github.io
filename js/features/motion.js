(() => {
  const APP = window.PCARIOCA_APP;
  const { $, setCSSVar, clamp } = APP.helpers;

  function initMotion() {
    if (APP.state.motionInitialized) return;

    APP.refs.card = $("#card");
    if (!APP.refs.card) console.warn("[app] Missing selector: #card");

    APP.state.mx = innerWidth * 0.5;
    APP.state.my = innerHeight * 0.35;

    window.addEventListener("mousemove", (e) => {
      APP.state.mx = e.clientX;
      APP.state.my = e.clientY;
      setCSSVar("--mx", APP.state.mx + "px");
      setCSSVar("--my", APP.state.my + "px");

      if (!APP.refs.card) return;
      const r = APP.refs.card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (APP.state.mx - cx) / (r.width / 2);
      const dy = (APP.state.my - cy) / (r.height / 2);

      const tiltY = clamp(dx, -1, 1) * 7;
      const tiltX = clamp(-dy, -1, 1) * 5;
      setCSSVar("--tiltY", tiltY.toFixed(2) + "deg");
      setCSSVar("--tiltX", tiltX.toFixed(2) + "deg");

      const g = 0.75 + Math.min(0.35, Math.hypot(dx, dy) * 0.18);
      setCSSVar("--glow", g.toFixed(2));
    });

    window.addEventListener("mouseleave", () => {
      setCSSVar("--tiltY", "0deg");
      setCSSVar("--tiltX", "0deg");
      setCSSVar("--glow", ".85");
    });

    APP.state.motionInitialized = true;
  }

  APP.api.initMotion = initMotion;
})();
