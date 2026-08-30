(() => {
  const APP = window.PCARIOCA_APP;

  const THEMES = [
    { id: "midnight-network", name: "Midnight", backgroundType: "network", page0: "#070816", page1: "#05060c", surface: "rgba(12,14,22,.74)", soft: "rgba(255,255,255,.04)", text: "rgba(255,255,255,.94)", muted: "rgba(219,234,254,.68)", border: "rgba(191,219,254,.16)", blue: "96 165 250", purple: "167 139 250", green: "16 185 129", art: "96 165 250", favicon: "#60a5fa" },
    { id: "oscilloscope", name: "Oscilloscope", backgroundType: "oscilloscope", page0: "#020a07", page1: "#020504", surface: "rgba(5,20,14,.78)", soft: "rgba(110,231,183,.05)", text: "rgba(236,253,245,.94)", muted: "rgba(167,243,208,.68)", border: "rgba(110,231,183,.18)", blue: "74 222 128", purple: "45 212 191", green: "110 231 183", art: "74 222 128", favicon: "#4ade80" },
    { id: "pcb", name: "PCB", backgroundType: "pcb", page0: "#06110c", page1: "#030806", surface: "rgba(8,28,19,.78)", soft: "rgba(251,191,36,.05)", text: "rgba(255,251,235,.94)", muted: "rgba(253,230,138,.68)", border: "rgba(251,191,36,.19)", blue: "45 212 191", purple: "251 191 36", green: "52 211 153", art: "251 191 36", favicon: "#fbbf24" },
    { id: "logic-grid", name: "Logic Grid", backgroundType: "logic", page0: "#080a16", page1: "#080611", surface: "rgba(17,19,38,.78)", soft: "rgba(129,140,248,.06)", text: "rgba(245,247,255,.95)", muted: "rgba(199,210,254,.70)", border: "rgba(165,180,252,.18)", blue: "129 140 248", purple: "192 132 252", green: "56 189 248", art: "129 140 248", favicon: "#818cf8" },
    { id: "aurora", name: "Aurora", backgroundType: "aurora", page0: "#0a0b24", page1: "#071316", surface: "rgba(15,20,46,.75)", soft: "rgba(103,232,249,.06)", text: "rgba(245,253,255,.95)", muted: "rgba(207,250,254,.70)", border: "rgba(103,232,249,.18)", blue: "103 232 249", purple: "196 181 253", green: "94 234 212", art: "103 232 249", favicon: "#67e8f9" },
    { id: "silicon", name: "Silicon", backgroundType: "silicon", page0: "#111018", page1: "#090a10", surface: "rgba(29,26,42,.78)", soft: "rgba(216,180,254,.05)", text: "rgba(250,245,255,.95)", muted: "rgba(221,214,254,.70)", border: "rgba(216,180,254,.18)", blue: "196 181 253", purple: "216 180 254", green: "148 163 184", art: "216 180 254", favicon: "#d8b4fe" },
    { id: "terminal-amber", name: "Terminal Amber", backgroundType: "terminal", page0: "#0d0a05", page1: "#060504", surface: "rgba(26,19,8,.80)", soft: "rgba(251,191,36,.05)", text: "rgba(255,251,235,.94)", muted: "rgba(253,230,138,.72)", border: "rgba(245,158,11,.20)", blue: "251 191 36", purple: "245 158 11", green: "253 230 138", art: "251 191 36", favicon: "#f59e0b" },
    { id: "constellation", name: "Constellation", backgroundType: "constellation", page0: "#0b1028", page1: "#070812", surface: "rgba(16,21,48,.78)", soft: "rgba(196,181,253,.05)", text: "rgba(248,250,255,.95)", muted: "rgba(224,231,255,.70)", border: "rgba(196,181,253,.18)", blue: "147 197 253", purple: "196 181 253", green: "125 211 252", art: "196 181 253", favicon: "#c4b5fd" },
    { id: "blueprint", name: "Blueprint", backgroundType: "blueprint", page0: "#06172c", page1: "#04101f", surface: "rgba(7,34,61,.80)", soft: "rgba(125,211,252,.06)", text: "rgba(240,249,255,.95)", muted: "rgba(186,230,253,.72)", border: "rgba(125,211,252,.20)", blue: "125 211 252", purple: "96 165 250", green: "103 232 249", art: "125 211 252", favicon: "#7dd3fc" },
    { id: "bubble-logic", name: "Bubble Logic", backgroundType: "bubbles", page0: "#170b22", page1: "#100817", surface: "rgba(39,15,50,.76)", soft: "rgba(244,114,182,.06)", text: "rgba(255,247,252,.95)", muted: "rgba(251,207,232,.72)", border: "rgba(244,114,182,.19)", blue: "244 114 182", purple: "167 139 250", green: "103 232 249", art: "244 114 182", favicon: "#f472b6" },
    { id: "neon-circuit", name: "Neon Circuit", backgroundType: "neon", page0: "#070712", page1: "#08040f", surface: "rgba(13,12,31,.80)", soft: "rgba(34,211,238,.06)", text: "rgba(245,254,255,.95)", muted: "rgba(207,250,254,.72)", border: "rgba(34,211,238,.19)", blue: "34 211 238", purple: "232 121 249", green: "45 212 191", art: "34 211 238", favicon: "#22d3ee" },
    { id: "paper-electronics", name: "Paper Electronics", backgroundType: "paper", page0: "#ece7d7", page1: "#d8d0ba", surface: "rgba(255,252,240,.78)", soft: "rgba(71,85,105,.08)", text: "rgba(20,30,40,.94)", muted: "rgba(51,65,85,.72)", border: "rgba(51,65,85,.26)", blue: "14 116 144", purple: "109 40 217", green: "21 128 61", art: "14 116 144", favicon: "#0e7490" },
    { id: "gravity-well", name: "Gravity Well", backgroundType: "gravity", page0: "#08051a", page1: "#02030b", surface: "rgba(17,12,42,.82)", soft: "rgba(129,140,248,.07)", text: "rgba(250,250,255,.96)", muted: "rgba(221,214,254,.76)", border: "rgba(129,140,248,.28)", blue: "129 140 248", purple: "244 114 182", green: "34 211 238", art: "129 140 248", favicon: "#818cf8" },
    { id: "firefly-meadow", name: "Fireflies", backgroundType: "fireflies", page0: "#06120d", page1: "#020705", surface: "rgba(7,29,20,.82)", soft: "rgba(190,242,100,.07)", text: "rgba(247,254,231,.96)", muted: "rgba(217,249,157,.76)", border: "rgba(190,242,100,.28)", blue: "190 242 100", purple: "250 204 21", green: "52 211 153", art: "190 242 100", favicon: "#bef264" },
    { id: "koi-pond", name: "Koi Pond", backgroundType: "koi", page0: "#031827", page1: "#020b13", surface: "rgba(5,32,48,.82)", soft: "rgba(125,211,252,.07)", text: "rgba(240,249,255,.96)", muted: "rgba(186,230,253,.76)", border: "rgba(125,211,252,.27)", blue: "125 211 252", purple: "251 146 60", green: "45 212 191", art: "125 211 252", favicon: "#fb923c" },
    { id: "candy-rain", name: "Candy Rain", backgroundType: "candy", page0: "#210923", page1: "#0d0617", surface: "rgba(50,15,55,.82)", soft: "rgba(251,113,133,.08)", text: "rgba(255,247,252,.96)", muted: "rgba(251,207,232,.77)", border: "rgba(251,113,133,.29)", blue: "251 113 133", purple: "192 132 252", green: "103 232 249", art: "251 113 133", favicon: "#fb7185" },
    { id: "magnetic-field", name: "Magnetic Field", backgroundType: "magnetic", page0: "#090b18", page1: "#03050b", surface: "rgba(18,21,43,.83)", soft: "rgba(96,165,250,.07)", text: "rgba(248,250,252,.96)", muted: "rgba(203,213,225,.77)", border: "rgba(96,165,250,.29)", blue: "96 165 250", purple: "248 113 113", green: "45 212 191", art: "96 165 250", favicon: "#f87171" },
    { id: "pixel-garden", name: "Pixel Garden", backgroundType: "garden", page0: "#07160f", page1: "#07100d", surface: "rgba(10,35,23,.84)", soft: "rgba(74,222,128,.07)", text: "rgba(240,253,244,.96)", muted: "rgba(187,247,208,.77)", border: "rgba(74,222,128,.28)", blue: "74 222 128", purple: "244 114 182", green: "250 204 21", art: "74 222 128", favicon: "#4ade80" },
    { id: "star-tunnel", name: "Star Tunnel", backgroundType: "star-tunnel", page0: "#050617", page1: "#010207", surface: "rgba(11,14,38,.84)", soft: "rgba(165,180,252,.07)", text: "rgba(248,250,255,.97)", muted: "rgba(224,231,255,.77)", border: "rgba(165,180,252,.28)", blue: "165 180 252", purple: "244 114 182", green: "103 232 249", art: "165 180 252", favicon: "#a5b4fc" },
    { id: "lava-lamp", name: "Lava Lamp", backgroundType: "lava", page0: "#22090c", page1: "#0b0307", surface: "rgba(52,15,19,.82)", soft: "rgba(251,146,60,.08)", text: "rgba(255,247,237,.96)", muted: "rgba(254,215,170,.77)", border: "rgba(251,146,60,.29)", blue: "251 146 60", purple: "244 63 94", green: "250 204 21", art: "251 146 60", favicon: "#fb923c" },
    { id: "snow-globe", name: "Snow Globe", backgroundType: "snow", page0: "#071425", page1: "#030812", surface: "rgba(11,30,52,.83)", soft: "rgba(186,230,253,.07)", text: "rgba(248,252,255,.97)", muted: "rgba(224,242,254,.77)", border: "rgba(186,230,253,.29)", blue: "186 230 253", purple: "196 181 253", green: "125 211 252", art: "186 230 253", favicon: "#bae6fd" },
    { id: "hex-swarm", name: "Hex Swarm", backgroundType: "hex", page0: "#101006", page1: "#060603", surface: "rgba(31,30,9,.83)", soft: "rgba(250,204,21,.07)", text: "rgba(254,252,232,.96)", muted: "rgba(254,240,138,.76)", border: "rgba(250,204,21,.29)", blue: "250 204 21", purple: "251 146 60", green: "163 230 53", art: "250 204 21", favicon: "#facc15" },
    { id: "circuit-pong", name: "Circuit Pong", backgroundType: "pong", page0: "#06131b", page1: "#02070c", surface: "rgba(8,31,43,.84)", soft: "rgba(34,211,238,.07)", text: "rgba(240,253,255,.96)", muted: "rgba(207,250,254,.77)", border: "rgba(34,211,238,.29)", blue: "34 211 238", purple: "232 121 249", green: "74 222 128", art: "34 211 238", favicon: "#22d3ee" },
    { id: "atom-dance", name: "Atom Dance", backgroundType: "atoms", page0: "#13091e", page1: "#07030d", surface: "rgba(34,15,49,.83)", soft: "rgba(216,180,254,.07)", text: "rgba(253,244,255,.96)", muted: "rgba(240,217,255,.76)", border: "rgba(216,180,254,.29)", blue: "216 180 254", purple: "103 232 249", green: "244 114 182", art: "216 180 254", favicon: "#d8b4fe" },
    { id: "jellyfish-bay", name: "Jellyfish Bay", backgroundType: "jellyfish", page0: "#07132b", page1: "#030719", surface: "rgba(11,28,58,.82)", soft: "rgba(167,139,250,.08)", text: "rgba(245,247,255,.96)", muted: "rgba(221,214,254,.77)", border: "rgba(167,139,250,.29)", blue: "167 139 250", purple: "244 114 182", green: "103 232 249", art: "167 139 250", favicon: "#a78bfa" },
    { id: "matrix-garden", name: "Matrix Garden", backgroundType: "sprouts", page0: "#031109", page1: "#010603", surface: "rgba(5,29,14,.84)", soft: "rgba(34,197,94,.07)", text: "rgba(240,253,244,.96)", muted: "rgba(187,247,208,.76)", border: "rgba(34,197,94,.28)", blue: "34 197 94", purple: "250 204 21", green: "134 239 172", art: "34 197 94", favicon: "#22c55e" },
    { id: "comet-race", name: "Comet Race", backgroundType: "comets", page0: "#080d22", page1: "#02040c", surface: "rgba(13,22,52,.83)", soft: "rgba(56,189,248,.07)", text: "rgba(248,250,255,.96)", muted: "rgba(186,230,253,.77)", border: "rgba(56,189,248,.29)", blue: "56 189 248", purple: "248 113 113", green: "250 204 21", art: "56 189 248", favicon: "#38bdf8" },
    { id: "sonar-sea", name: "Sonar Sea", backgroundType: "sonar", page0: "#02151a", page1: "#010708", surface: "rgba(4,35,42,.84)", soft: "rgba(45,212,191,.07)", text: "rgba(240,253,250,.96)", muted: "rgba(153,246,228,.77)", border: "rgba(45,212,191,.29)", blue: "45 212 191", purple: "103 232 249", green: "74 222 128", art: "45 212 191", favicon: "#2dd4bf" },
    { id: "kaleidoscope", name: "Kaleidoscope", backgroundType: "kaleido", page0: "#19091c", page1: "#08030c", surface: "rgba(43,14,48,.82)", soft: "rgba(232,121,249,.08)", text: "rgba(255,247,255,.96)", muted: "rgba(250,232,255,.77)", border: "rgba(232,121,249,.3)", blue: "232 121 249", purple: "34 211 238", green: "250 204 21", art: "232 121 249", favicon: "#e879f9" },
    { id: "neon-pinball", name: "Neon Pinball", backgroundType: "pinball", page0: "#10071b", page1: "#040208", surface: "rgba(28,12,47,.84)", soft: "rgba(244,114,182,.08)", text: "rgba(255,247,252,.96)", muted: "rgba(251,207,232,.77)", border: "rgba(244,114,182,.3)", blue: "244 114 182", purple: "34 211 238", green: "250 204 21", art: "244 114 182", favicon: "#f472b6" },
    { id: "clockwork", name: "Clockwork", backgroundType: "clockwork", page0: "#171006", page1: "#080502", surface: "rgba(42,29,9,.84)", soft: "rgba(217,119,6,.08)", text: "rgba(255,251,235,.96)", muted: "rgba(253,230,138,.77)", border: "rgba(217,119,6,.3)", blue: "217 119 6", purple: "251 191 36", green: "180 83 9", art: "217 119 6", favicon: "#d97706" },
    { id: "plasma-lab", name: "Plasma Lab", backgroundType: "plasma", page0: "#08051c", page1: "#02020a", surface: "rgba(17,11,48,.83)", soft: "rgba(139,92,246,.08)", text: "rgba(250,247,255,.97)", muted: "rgba(221,214,254,.77)", border: "rgba(139,92,246,.3)", blue: "139 92 246", purple: "34 211 238", green: "244 114 182", art: "139 92 246", favicon: "#8b5cf6" }
  ];

  function updateFavicon(theme) {
    const link = document.querySelector("#themeFavicon");
    if (!link) return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#10131d"/><path d="M32 51S10 38 10 22c0-7 5-12 12-12 5 0 8 3 10 6 2-3 5-6 10-6 7 0 12 5 12 12 0 16-22 29-22 29Z" fill="${theme.favicon}"/><circle cx="47" cy="17" r="5" fill="#fff" opacity=".72"/></svg>`;
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function applyTheme(theme, persist = true) {
    if (!theme) return;
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    root.style.setProperty("--bg0", theme.page0);
    root.style.setProperty("--bg1", theme.page1);
    root.style.setProperty("--surface", theme.surface);
    root.style.setProperty("--surface-soft", theme.soft);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--border", theme.border);
    const cssChannels = (value) => String(value).trim().split(/[,\s]+/).slice(0, 3).join(",");
    root.style.setProperty("--blue", cssChannels(theme.blue));
    root.style.setProperty("--purple", cssChannels(theme.purple));
    root.style.setProperty("--green", cssChannels(theme.green));
    root.style.setProperty("--background-art-primary", cssChannels(theme.art));
    document.body.dataset.backgroundStyle = theme.backgroundType;
    APP.state.currentTheme = theme;
    updateFavicon(theme);
    if (persist) {
      try { localStorage.setItem("portfolioTheme", theme.id); } catch (err) { console.warn("[app] Theme persistence failed", err); }
    }
    window.dispatchEvent(new CustomEvent("pcarioca:theme-change", { detail: theme }));
  }

  function updatePaletteTip(theme) {
    const button = document.querySelector("#btnPalette");
    const tip = button?.querySelector(".tip");
    if (!button || !tip) return;
    const previous = tip.textContent;
    tip.textContent = theme.name;
    button.setAttribute("aria-label", theme.name);
    clearTimeout(button._themeTipTimer);
    button._themeTipTimer = setTimeout(() => {
      const lang = APP.state.currentLang || "en";
      const label = APP.data.content?.[lang]?.utilityChangeStyle || "Change Style";
      tip.textContent = label;
      button.setAttribute("aria-label", label);
    }, 1400);
  }

  function cycleTheme(direction = 1) {
    const current = APP.state.currentTheme || THEMES[0];
    const index = THEMES.findIndex((theme) => theme.id === current.id);
    const next = THEMES[(index + direction + THEMES.length) % THEMES.length];
    applyTheme(next);
    updatePaletteTip(next);
  }

  function initThemeController() {
    if (APP.state.themeControllerInitialized) return;
    let saved = THEMES[0].id;
    try { saved = localStorage.getItem("portfolioTheme") || saved; } catch (err) { console.warn("[app] Theme preference unavailable", err); }
    applyTheme(THEMES.find((theme) => theme.id === saved) || THEMES[0], false);
    APP.state.themeControllerInitialized = true;
  }

  APP.data.themes = THEMES;
  APP.api.applyTheme = applyTheme;
  APP.api.cycleTheme = cycleTheme;
  APP.api.initThemeController = initThemeController;
})();
