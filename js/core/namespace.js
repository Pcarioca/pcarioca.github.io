(() => {
  const existing = window.PCARIOCA_APP || {};

  window.PCARIOCA_APP = {
    state: existing.state || {},
    refs: existing.refs || {},
    data: existing.data || {},
    api: existing.api || {},
    helpers: existing.helpers || {}
  };
})();
