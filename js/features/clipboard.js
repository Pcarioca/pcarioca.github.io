(() => {
  const APP = window.PCARIOCA_APP;
  const { $, toast } = APP.helpers;

  async function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (!ok) throw new Error("execCommand(copy) failed");
  }

  function translated(key, fallback) {
    const lang = APP.state.currentLang || "en";
    return APP.data.content?.[lang]?.[key] || fallback;
  }

  async function copyRailValue(button, value, successKey, fallback) {
    try {
      await copyToClipboard(value);
      toast(translated(successKey, fallback));
      const tip = button.querySelector(".tip");
      if (!tip) return;
      const normal = tip.textContent;
      tip.textContent = translated(successKey, fallback);
      clearTimeout(button._tipTimer);
      button._tipTimer = setTimeout(() => { tip.textContent = normal; }, 1300);
    } catch (e) {
      console.warn("[app] Clipboard copy failed", e);
      toast(value);
    }
  }

  function initClipboard() {
    const CONFIG = APP.data.CONFIG;
    const emailButton = $("#btnEmail");
    const phoneButton = $("#btnPhone");

    if (emailButton && emailButton.dataset.clipboardWired !== "1") {
      emailButton.dataset.clipboardWired = "1";
      emailButton.addEventListener("click", () => copyRailValue(emailButton, CONFIG.email, "utilityEmailCopied", "Email copied"));
    }
    if (phoneButton && phoneButton.dataset.clipboardWired !== "1") {
      phoneButton.dataset.clipboardWired = "1";
      phoneButton.addEventListener("click", () => copyRailValue(phoneButton, CONFIG.phone, "utilityPhoneCopied", "Phone copied"));
    }
  }

  APP.api.copyToClipboard = copyToClipboard;
  APP.api.initClipboard = initClipboard;
})();
