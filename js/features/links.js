(() => {
  const APP = window.PCARIOCA_APP;
  const { $, setOptionalLink, isLinkedInPlaceholder } = APP.helpers;

  function initLinks() {
    const CONFIG = APP.data.CONFIG;
    const refs = APP.refs;

    refs.profileImg = $("#profileImg");
    if (!refs.profileImg) {
      console.warn("[app] Missing selector: #profileImg");
    } else {
      refs.profileImg.addEventListener("error", () => {
        refs.profileImg.src = CONFIG.fallbackProfileImg;
      });
    }

    refs.btnResume = $("#btnResume");
    if (refs.btnResume) refs.btnResume.href = CONFIG.cvUrl;

    refs.btnGithub = $("#btnGithub");
    if (refs.btnGithub) setOptionalLink(refs.btnGithub, CONFIG.links.github);

    refs.btnLinkedIn = $("#btnLinkedIn");
    if (refs.btnLinkedIn) {
      setOptionalLink(refs.btnLinkedIn, CONFIG.links.linkedin, {
        hideIfPlaceholder: true,
        placeholderFn: isLinkedInPlaceholder
      });
    }

    refs.btnWca = $("#btnWca");
    if (refs.btnWca) setOptionalLink(refs.btnWca, CONFIG.links.wca);
  }

  APP.api.initLinks = initLinks;
})();
