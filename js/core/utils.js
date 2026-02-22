(() => {
  const APP = window.PCARIOCA_APP;
  const { $ } = APP.helpers;

  function setCSSVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  function toast(msg) {
    const t = APP.refs.toast || $("#toast");
    if (!t) {
      console.warn("[app] Missing selector: #toast (toast suppressed)", msg);
      return;
    }

    APP.refs.toast = t;
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._t);
    t._t = setTimeout(() => {
      t.style.opacity = "0";
    }, 2200);
  }

  function hideElement(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
  }

  function showElement(el) {
    if (!el) return;
    el.hidden = false;
    el.removeAttribute("aria-hidden");
  }

  function isLinkedInPlaceholder(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
      const path = parsed.pathname.replace(/\/+$/, "");
      return host === "linkedin.com" && (path === "" || path === "/");
    } catch (err) {
      console.warn("[app] Invalid LinkedIn URL", err);
      return true;
    }
  }

  function setOptionalLink(el, url, opts = {}) {
    if (!el) return;
    const clean = String(url || "").trim();
    const shouldHide = !clean || (opts.hideIfPlaceholder && opts.placeholderFn && opts.placeholderFn(clean));

    if (shouldHide) {
      hideElement(el);
      return;
    }

    showElement(el);
    if ("href" in el) {
      el.href = clean;
    }
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  APP.helpers.setCSSVar = setCSSVar;
  APP.helpers.toast = toast;
  APP.helpers.hideElement = hideElement;
  APP.helpers.showElement = showElement;
  APP.helpers.isLinkedInPlaceholder = isLinkedInPlaceholder;
  APP.helpers.setOptionalLink = setOptionalLink;
  APP.helpers.clamp = clamp;
})();
