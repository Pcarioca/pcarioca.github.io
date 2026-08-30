(() => {
  const APP = window.PCARIOCA_APP;
  const { $ } = APP.helpers;

  function nextLanguage() {
    const languages = ["en", "ro", "de"];
    const current = APP.state.currentLang || "en";
    APP.api.setLang?.(languages[(languages.indexOf(current) + 1) % languages.length]);
  }

  function refreshRail() {
    const language = APP.state.currentLang || "en";
    const code = $("#btnLanguage [data-language-code]");
    if (code) code.textContent = language.toUpperCase();
  }

  function initUtilityRail() {
    if (APP.state.utilityRailInitialized) return;
    const languageButton = $("#btnLanguage");
    const paletteButton = $("#btnPalette");
    const latchButton = $("#btnLatch");

    languageButton?.addEventListener("click", nextLanguage);
    paletteButton?.addEventListener("click", (event) => APP.api.cycleTheme?.(event.shiftKey ? -1 : 1));
    latchButton?.addEventListener("click", () => APP.api.startDLatchGame?.());
    APP.state.utilityRailInitialized = true;
    refreshRail();
  }

  APP.api.refreshRail = refreshRail;
  APP.api.initUtilityRail = initUtilityRail;
})();
