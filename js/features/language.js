(() => {
  const APP = window.PCARIOCA_APP;
  const { $$ } = APP.helpers;

  function setLang(lang) {
    const content = APP.data.content;
    const langLinks = APP.refs.langLinks || [];

    if (!content[lang]) {
      console.warn(`[app] Unknown lang "${lang}", falling back to "en"`);
      lang = "en";
    }

    try {
      localStorage.setItem("lang", lang);
    } catch (e) {
      console.warn("[app] localStorage.setItem('lang') failed", e);
    }

    APP.state.currentLang = lang;
    document.documentElement.lang = lang;
    langLinks.forEach((a) => a.classList.toggle("active", a.dataset.lang === lang));

    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key === "subtitle" || key === "resume") return;
      const value = content[lang]?.[key];
      if (typeof value === "string") {
        el.textContent = value;
      }
    });

    APP.api.renderSubtitle(lang);
    APP.api.renderBullets(lang);
    APP.api.renderTags(lang);
    APP.api.renderLeftWhoAmI(lang);
    APP.api.renderWork(lang);
    APP.api.renderEducation(lang);
    APP.api.renderTeaching(lang);
    APP.api.renderLanguages(lang);
    APP.api.renderProjectGroups(lang);
    APP.api.renderRecognitionGroups(lang);
    APP.api.renderResourceGroups(lang);

    if (typeof APP.api.wireInteractiveSounds === "function") {
      APP.api.wireInteractiveSounds();
    }
    if (typeof APP.api.wireHoldActions === "function") {
      APP.api.wireHoldActions();
    }
  }

  function initLanguage() {
    if (APP.state.languageInitialized) return;

    const content = APP.data.content;
    APP.refs.langLinks = $$(".langbar a[data-lang]");

    let savedLang = "en";
    try {
      savedLang = localStorage.getItem("lang") || "en";
    } catch (e) {
      console.warn("[app] localStorage.getItem('lang') failed", e);
    }

    if (!content[savedLang]) {
      console.warn(`[app] Unknown saved lang "${savedLang}", falling back to "en"`);
      savedLang = "en";
    }

    setLang(savedLang);

    APP.refs.langLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setLang(a.dataset.lang);
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "1") {
        setLang("en");
      }
      if (e.key === "2") {
        setLang("ro");
      }
      if (e.key === "3") {
        setLang("de");
      }
    });

    APP.state.languageInitialized = true;
  }

  APP.api.setLang = setLang;
  APP.api.initLanguage = initLanguage;
})();
