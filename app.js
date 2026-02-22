(() => {
  const manifest = [
    "./js/core/namespace.js",
    "./js/core/dom.js",
    "./js/core/utils.js",
    "./js/data/config.js",
    "./js/data/content.js",
    "./js/data/icons.js",
    "./js/features/render.js",
    "./js/features/links.js",
    "./js/features/language.js",
    "./js/features/clipboard.js",
    "./js/features/motion.js",
    "./js/features/canvas.js",
    "./js/features/audio.js",
    "./js/features/easter-eggs.js",
    "./js/bootstrap/init.js"
  ];

  const scriptSrc = document.currentScript?.src || "";
  let versionSuffix = "";

  if (scriptSrc) {
    try {
      const parsed = new URL(scriptSrc, window.location.href);
      const v = parsed.searchParams.get("v");
      if (v) versionSuffix = `?v=${encodeURIComponent(v)}`;
    } catch (err) {
      console.warn("[app-loader] Could not parse script version", err);
    }
  }

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${path}${versionSuffix}`;
      script.async = false;
      script.defer = true;

      script.onload = () => resolve(path);
      script.onerror = () => {
        const err = new Error(`[app-loader] Failed to load script: ${path}`);
        err.path = path;
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  manifest
    .reduce((chain, path) => chain.then(() => loadScript(path)), Promise.resolve())
    .catch((err) => {
      console.error("[app-loader] Script loading aborted", err);
    });
})();
