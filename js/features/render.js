(() => {
  const APP = window.PCARIOCA_APP;
  const { $ } = APP.helpers;

  function renderSubtitle(lang) {
    const content = APP.data.content;
    const CONFIG = APP.data.CONFIG;
    const subtitleP = $(".subtitle");

    if (!subtitleP) {
      console.warn("[app] Missing selector: .subtitle");
      return;
    }

    subtitleP.innerHTML = "";

    const span = document.createElement("span");
    span.textContent = content[lang].subtitle + " ";
    subtitleP.appendChild(span);

    const link = document.createElement("a");
    link.className = "resume";
    link.id = "resumeLink";
    link.dataset.holdKey = "resumeLink";
    link.href = CONFIG.cvUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = content[lang].resume;
    subtitleP.appendChild(link);
  }

  function renderBullets(lang) {
    const content = APP.data.content;
    const bulletIcons = APP.data.bulletIcons;
    const bulletsEl = $("#bullets");

    if (!bulletsEl) {
      console.warn("[app] Missing selector: #bullets");
      return;
    }

    bulletsEl.innerHTML = "";
    content[lang].bullets.forEach((item, idx) => {
      const li = document.createElement("li");
      li.dataset.holdKey = `bullet:${idx}`;
      li.dataset.bulletIndex = String(idx);
      li.innerHTML = `${bulletIcons[item.icon] || ""}<div>${item.html}</div>`;
      bulletsEl.appendChild(li);
    });
  }

  function renderTags(lang) {
    const content = APP.data.content;
    const tagsEl = $("#tags");

    if (!tagsEl) {
      console.warn("[app] Missing selector: #tags");
      return;
    }

    tagsEl.innerHTML = "";
    content[lang].tags.forEach((tag, idx) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.dataset.holdKey = `tag:${idx}`;
      span.dataset.tagIndex = String(idx);
      span.textContent = tag;
      tagsEl.appendChild(span);
    });
  }

  function renderLeftWhoAmI(lang) {
    const content = APP.data.content;
    const container = $("#leftWhoAmISections");

    if (!container) {
      console.warn("[app] Missing selector: #leftWhoAmISections");
      return;
    }

    const sections = content[lang].leftWhoAmISections || [];
    container.innerHTML = "";

    sections.forEach((section, sectionIdx) => {
      const wrap = document.createElement("section");
      wrap.className = "left-whoami-section";
      wrap.dataset.sectionIndex = String(sectionIdx);

      const title = document.createElement("h3");
      title.className = "left-whoami-section-title";
      title.dataset.holdKey = `whoami-section:${sectionIdx}`;
      title.textContent = section.title;
      wrap.appendChild(title);

      const pillsWrap = document.createElement("div");
      pillsWrap.className = "left-whoami-pills";

      (section.pills || []).forEach((item, pillIdx) => {
        const pill = document.createElement("span");
        pill.className = "left-whoami-pill";
        pill.dataset.holdKey = `whoami-pill:${sectionIdx}:${pillIdx}`;
        pill.dataset.pillLabel = item;
        pill.textContent = item;
        pillsWrap.appendChild(pill);
      });

      wrap.appendChild(pillsWrap);
      container.appendChild(wrap);
    });
  }

  function renderResourceGroups(lang) {
    const content = APP.data.content;
    const CONFIG = APP.data.CONFIG;
    const container = $("#resourceGroups");

    if (!container) {
      console.warn("[app] Missing selector: #resourceGroups");
      return;
    }

    container.innerHTML = "";
    const groups = content[lang].resourceGroups || [];

    groups.forEach((group, groupIdx) => {
      const groupCard = document.createElement("article");
      groupCard.className = "resource-group";
      groupCard.dataset.groupIndex = String(groupIdx);

      const title = document.createElement("h3");
      title.className = "resource-group-title";
      title.textContent = group.title;

      const list = document.createElement("ul");
      list.className = "resource-list";

      group.items.forEach((item) => {
        const href = CONFIG.resourceLinks[item.linkKey];
        if (!href) {
          console.warn(`[app] Missing resource link for key: ${item.linkKey}`);
          return;
        }

        const li = document.createElement("li");
        li.className = "resource-item";
        li.dataset.resourceKey = item.linkKey;

        const a = document.createElement("a");
        a.className = "resource-link";
        a.dataset.holdKey = `resource:${item.linkKey}`;
        a.dataset.resourceKey = item.linkKey;
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = item.label;
        li.appendChild(a);

        if (item.note) {
          const note = document.createElement("p");
          note.className = "resource-note";
          note.textContent = item.note;
          li.appendChild(note);
        }

        list.appendChild(li);
      });

      groupCard.appendChild(title);
      groupCard.appendChild(list);
      container.appendChild(groupCard);
    });
  }

  APP.api.renderSubtitle = renderSubtitle;
  APP.api.renderBullets = renderBullets;
  APP.api.renderTags = renderTags;
  APP.api.renderLeftWhoAmI = renderLeftWhoAmI;
  APP.api.renderResourceGroups = renderResourceGroups;
})();
