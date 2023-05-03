(() => {
  bbn.wc.directives['bbn-focused'] = {
    inserted(el, binding) {
      if (binding.value === false) {
        return;
      }

      setTimeout(() => {
        el.focus();
        bbn.env.focused = el;
        if (binding.modifiers.includes('selected')) {
          bbn.fn.selectElementText(el);
        }
      }, 250);
    }
  };
})();
