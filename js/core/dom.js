(() => {
  const APP = window.PCARIOCA_APP;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  APP.helpers.$ = $;
  APP.helpers.$$ = $$;
})();
