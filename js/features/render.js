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
    span.textContent = content[lang].heroSupport + " ";
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
    let tagIndex = 0;
    (content[lang].expertiseGroups || []).forEach((group) => {
      const groupEl = document.createElement("article");
      groupEl.className = "expertise-group";

      const title = document.createElement("h3");
      title.className = "expertise-group-title";
      title.textContent = group.title;
      groupEl.appendChild(title);

      const tagsWrap = document.createElement("div");
      tagsWrap.className = "tags";
      (group.skills || []).forEach((tag) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.dataset.holdKey = `tag:${tagIndex}`;
        span.dataset.tagIndex = String(tagIndex);
        span.textContent = tag;
        tagsWrap.appendChild(span);
        tagIndex += 1;
      });
      groupEl.appendChild(tagsWrap);
      tagsEl.appendChild(groupEl);
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

  function renderResourceGroupsInto(lang, containerSelector, groups) {
    const CONFIG = APP.data.CONFIG;
    const container = $(containerSelector);

    if (!container) {
      console.warn(`[app] Missing selector: ${containerSelector}`);
      return;
    }

    container.innerHTML = "";

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
        const li = document.createElement("li");
        li.className = "resource-item";
        if (item.linkKey) {
          const href = CONFIG.resourceLinks[item.linkKey];
          if (!href) {
            console.warn(`[app] Missing resource link for key: ${item.linkKey}`);
            return;
          }

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
        } else {
          const label = document.createElement("span");
          label.className = "resource-label";
          label.textContent = item.label;
          li.appendChild(label);
        }

        if (item.note) {
          const note = document.createElement("p");
          note.className = "resource-note";
          note.textContent = item.note;
          li.appendChild(note);
        }

        if (item.noteLinks?.length) {
          const links = document.createElement("p");
          links.className = "resource-note-links";
          item.noteLinks.forEach((noteLink, idx) => {
            const href = CONFIG.resourceLinks[noteLink.linkKey];
            if (!href) return;
            if (idx > 0) links.appendChild(document.createTextNode(" · "));
            const a = document.createElement("a");
            a.className = "resource-link resource-note-link";
            a.dataset.holdKey = `resource:${noteLink.linkKey}`;
            a.dataset.resourceKey = noteLink.linkKey;
            a.href = href;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = noteLink.label;
            links.appendChild(a);
          });
          if (links.childNodes.length) li.appendChild(links);
        }

        list.appendChild(li);
      });

      groupCard.appendChild(title);
      groupCard.appendChild(list);
      container.appendChild(groupCard);
    });
  }

  function renderResourceGroups(lang) {
    renderResourceGroupsInto(lang, "#resourceGroups", APP.data.content[lang].resourceGroups || []);
  }

  function renderProjectGroups(lang) {
    renderResourceGroupsInto(lang, "#projectGroups", APP.data.content[lang].projectGroups || []);
  }

  function renderRecognitionGroups(lang) {
    renderResourceGroupsInto(lang, "#recognitionGroups", APP.data.content[lang].recognitionGroups || []);
  }

  function renderEducation(lang) {
    const content = APP.data.content[lang];
    const container = $("#educationItems");
    if (!container) return;
    container.innerHTML = "";

    (content.education || []).forEach((item) => {
      const card = document.createElement("article");
      card.className = "education-item";

      const title = document.createElement("h3");
      title.className = "education-item-title";
      title.textContent = item.title;
      card.appendChild(title);

      const institution = item.institutionLinkKey ? document.createElement("a") : document.createElement("p");
      institution.className = "education-institution";
      institution.textContent = item.institution;
      if (item.institutionLinkKey) {
        const href = APP.data.CONFIG.resourceLinks[item.institutionLinkKey];
        if (href) {
          institution.href = href;
          institution.target = "_blank";
          institution.rel = "noopener noreferrer";
        }
      }
      card.appendChild(institution);

      if (item.period) {
        const period = document.createElement("span");
        period.className = "education-period";
        period.textContent = item.period;
        card.appendChild(period);
      }

      if (item.focus) {
        const focus = document.createElement("p");
        focus.className = "education-focus";
        focus.innerHTML = `<b>${content.focusLabel}:</b> ${item.focus}`;
        card.appendChild(focus);
      }
      container.appendChild(card);
    });
  }

  function renderTeaching(lang) {
    const content = APP.data.content[lang];
    const intro = $("#teachingIntro");
    const container = $("#teachingItems");
    if (!intro || !container) return;
    intro.textContent = content.teachingIntro || "";
    container.innerHTML = "";

    (content.teachingItems || []).forEach((item) => {
      const li = document.createElement("li");
      li.className = "teaching-item";
      const title = item.titleLinkKey ? document.createElement("a") : document.createElement("h3");
      title.className = "teaching-item-title";
      title.textContent = item.title;
      if (item.titleLinkKey) {
        const href = APP.data.CONFIG.resourceLinks[item.titleLinkKey];
        if (href) {
          title.href = href;
          title.target = "_blank";
          title.rel = "noopener noreferrer";
        }
      }
      li.appendChild(title);
      const note = document.createElement("p");
      note.className = "teaching-item-note";
      note.textContent = item.note;
      li.appendChild(note);
      (item.noteLinks || []).forEach((noteLink, idx) => {
        const href = APP.data.CONFIG.resourceLinks[noteLink.linkKey];
        if (!href) return;
        const link = document.createElement("a");
        link.className = "resource-link teaching-link";
        link.dataset.holdKey = `resource:${noteLink.linkKey}`;
        link.dataset.resourceKey = noteLink.linkKey;
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = noteLink.label;
        if (idx > 0) li.appendChild(document.createTextNode(" · "));
        li.appendChild(link);
      });
      container.appendChild(li);
    });
  }

  function renderLanguages(lang) {
    const content = APP.data.content[lang];
    const container = $("#languagesList");
    if (!container) return;
    container.innerHTML = "";

    (content.languages || []).forEach((item) => {
      const li = document.createElement("li");
      li.className = "language-item";
      const primary = item.linkKey ? document.createElement("a") : document.createElement("span");
      primary.className = item.linkKey ? "language-primary" : "language-text";
      primary.textContent = `${item.name} — ${item.level}`;
      if (item.linkKey) {
        const href = APP.data.CONFIG.resourceLinks[item.linkKey];
        if (href) {
          primary.dataset.holdKey = `resource:${item.linkKey}`;
          primary.dataset.resourceKey = item.linkKey;
          primary.href = href;
          primary.target = "_blank";
          primary.rel = "noopener noreferrer";
        }
      }
      li.appendChild(primary);
      container.appendChild(li);
    });
  }

  function renderWork(lang) {
    const container = $("#workItems");
    const content = APP.data.content[lang];
    if (!container) return;
    container.innerHTML = "";
    (content.workItems || []).forEach((item) => {
      const li = document.createElement("li");
      li.className = "work-item";
      const link = document.createElement("a");
      link.className = "resource-link";
      link.dataset.holdKey = `resource:${item.linkKey}`;
      link.dataset.resourceKey = item.linkKey;
      link.href = APP.data.CONFIG.resourceLinks[item.linkKey];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.label;
      li.appendChild(link);
      const note = document.createElement("p");
      note.className = "resource-note";
      note.textContent = item.note;
      li.appendChild(note);
      container.appendChild(li);
    });
  }

  APP.api.renderSubtitle = renderSubtitle;
  APP.api.renderBullets = renderBullets;
  APP.api.renderTags = renderTags;
  APP.api.renderLeftWhoAmI = renderLeftWhoAmI;
  APP.api.renderResourceGroups = renderResourceGroups;
  APP.api.renderProjectGroups = renderProjectGroups;
  APP.api.renderRecognitionGroups = renderRecognitionGroups;
  APP.api.renderEducation = renderEducation;
  APP.api.renderWork = renderWork;
  APP.api.renderTeaching = renderTeaching;
  APP.api.renderLanguages = renderLanguages;
})();
