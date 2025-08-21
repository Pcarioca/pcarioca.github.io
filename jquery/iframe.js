  (() => {
    const send = (e) => {
      // clientX/Y are relative to the iframe viewport
      parent.postMessage({ type: 'cursor-bridge', x: e.clientX, y: e.clientY }, location.origin);
    };
    window.addEventListener('pointermove', send, {passive:true});
    window.addEventListener('pointerdown', send, {passive:true}); // keeps it alive during clicks/drag
  })();