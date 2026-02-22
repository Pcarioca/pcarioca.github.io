(() => {
  const APP = window.PCARIOCA_APP;
  const { $ } = APP.helpers;

  APP.refs.toast = $("#toast");

  if (typeof APP.api.initLinks === "function") APP.api.initLinks();
  if (typeof APP.api.initLanguage === "function") APP.api.initLanguage();
  if (typeof APP.api.initClipboard === "function") APP.api.initClipboard();
  if (typeof APP.api.initMotion === "function") APP.api.initMotion();
  if (typeof APP.api.initCanvas === "function") APP.api.initCanvas();
  if (typeof APP.api.initAudio === "function") APP.api.initAudio();
  if (typeof APP.api.initEasterEggs === "function") APP.api.initEasterEggs();

  console.info("PCARIOCA_APP initialized");
})();
