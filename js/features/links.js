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

    refs.resumeLink = $("#resumeLink");
    if (!refs.resumeLink) console.warn("[app] Missing selector: #resumeLink");
    else refs.resumeLink.href = CONFIG.cvUrl;

    refs.btnGithub = $("#btnGithub");
    if (!refs.btnGithub) console.warn("[app] Missing selector: #btnGithub");
    else setOptionalLink(refs.btnGithub, CONFIG.links.github);

    refs.btnLinkedIn = $("#btnLinkedIn");
    if (!refs.btnLinkedIn) {
      console.warn("[app] Missing selector: #btnLinkedIn");
    } else {
      setOptionalLink(refs.btnLinkedIn, CONFIG.links.linkedin, {
        hideIfPlaceholder: true,
        placeholderFn: isLinkedInPlaceholder
      });
    }

    refs.btnWca = $("#btnWca");
    if (!refs.btnWca) console.warn("[app] Missing selector: #btnWca");
    else setOptionalLink(refs.btnWca, CONFIG.links.wca);
  }

  APP.api.initLinks = initLinks;
})();
