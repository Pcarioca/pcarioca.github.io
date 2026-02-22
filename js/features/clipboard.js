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

  function initClipboard() {
    const CONFIG = APP.data.CONFIG;
    const refs = APP.refs;

    refs.btnMail = $("#btnMail");
    if (!refs.btnMail) {
      console.warn("[app] Missing selector: #btnMail");
      return;
    }

    refs.btnMail.addEventListener("click", async () => {
      try {
        await copyToClipboard(CONFIG.email);
        toast(`${CONFIG.email}`);
      } catch (e) {
        console.warn("[app] Clipboard copy failed", e);
        toast("Clipboard blocked. Email: " + CONFIG.email);
      }
    });
  }

  APP.api.copyToClipboard = copyToClipboard;
  APP.api.initClipboard = initClipboard;
})();
