(() => {
  const inserted = (el, binding) => {
    if (el.bbnDirectives === undefined) {
      el.bbnDirectives = {};
    }
    if (el.bbnDirectives.droppable === undefined) {
      el.bbnDirectives.droppable = {};
    }
    if ((binding.value !== false)
      && !el.classList.contains('bbn-undroppable')
    ) {
      el.dataset.bbn_droppable = true;
      el.bbnDirectives.droppable = {
        active: true
      };
      if (!el.classList.contains('bbn-droppable')) {
        el.classList.add('bbn-droppable');
      }
      let options = {},
          asArg = !!binding.arg && binding.arg.length,
          asMods = bbn.fn.isArray(binding.modifiers) && !!binding.modifiers.length,
          asDataFromMods = asMods && binding.modifiers.includes('data'),
          data = {},
          dragOver = false,
          mouseOver = false;
      if (asArg) {
        if (binding.arg === 'data') {
          data = binding.arg;
        }
      }
      else if (bbn.fn.isObject(binding.value)) {
        options = binding.value;
        if (asDataFromMods) {
          if ((options.data === undefined)
            || !bbn.fn.isObject(options.data)
          ) {
            bbn.fn.error(bbn._('No "data" property found or not an object'));
            throw bbn._('No "data" property found or not an object');
          }
          data = options.data;
        }
      }
      options.data = data;
      el.bbnDirectives.droppable.options = options;
      el.bbnDirectives.droppable.onmouseenter = e => {
        if (!!el.bbnDirectives.droppable.active) {
          mouseOver = true;
        }
      };
      el.addEventListener('mouseenter', el.bbnDirectives.droppable.onmouseenter);
      el.bbnDirectives.droppable.onmouseleave = e => {
        if (!!el.bbnDirectives.droppable.active) {
          let ev = new CustomEvent('dragleave', {
            cancelable: true,
            bubbles: true,
            detail: dragOver
          });
          mouseOver = false;
          dragOver = false;
          el.dispatchEvent(ev);
          if (!ev.defaultPrevented) {
            if (el.classList.contains('bbn-droppable-over')) {
              el.classList.remove('bbn-droppable-over');
            }
            delete el.dataset.bbn_droppable_over;
          }
        }
      };
      el.addEventListener('mouseleave', el.bbnDirectives.droppable.onmouseleave);
      el.bbnDirectives.droppable.ondragoverdroppable = e => {
        if (!!el.bbnDirectives.droppable.active
          && !e.defaultPrevented
          && !dragOver
          && !!mouseOver
        ) {
          dragOver = {
            from: e.detail,
            to: options
          };
          let ev = new CustomEvent('dragover', {
            cancelable: true,
            bubbles: true,
            detail: dragOver
          });
          el.dispatchEvent(ev);
          if (!ev.defaultPrevented) {
            if (!el.classList.contains('bbn-droppable-over')) {
              el.classList.add('bbn-droppable-over');
            }
            el.dataset.bbn_droppable_over = true;
          }
        }
      };
      el.addEventListener('dragoverdroppable', el.bbnDirectives.droppable.ondragoverdroppable);
      el.bbnDirectives.droppable.onbeforedrop = e => {
        if (!!el.bbnDirectives.droppable.active) {
          if (el.classList.contains('bbn-droppable-over')) {
            el.classList.remove('bbn-droppable-over');
          }
          if (!e.defaultPrevented && !!dragOver) {
            let ev = new CustomEvent('drop', {
              cancelable: true,
              bubbles: true,
              detail: dragOver
            });
            el.dispatchEvent(ev);
            if (!ev.defaultPrevented) {
              el.appendChild(e.detail.originalElement);
            }
            else {
              let ev = new CustomEvent('dragend', {
                cancelable: true,
                bubbles: true,
                detail: dragOver
              });
              e.detail.originalElement.dispatchEvent(ev);
              if (!ev.defaultPrevented) {
                if (!!e.detail.mode && (e.detail.mode === 'self')) {
                  e.detail.originalParent.insertBefore(e.detail.originalElement, e.detail.nextElement);
                }
              }
            }
          }
        }
      };
      el.addEventListener('beforedrop', el.bbnDirectives.droppable.onbeforedrop);
    }
    else {
      el.dataset.bbn_droppable = false;
      el.bbnDirectives.droppable = {
        active: false
      };
    }
  };

  bbn.wc.directives['bbn-droppable'] = {
    inserted: inserted,
    update: (el, binding) => {
      if ((binding.value !== false)
      && !el.classList.contains('bbn-undroppable')
      ) {
        if (binding.oldValue === false) {
          inserted(el, binding);
        }
        else {
          el.dataset.bbn_droppable = true;
          if (!el.classList.contains('bbn-droppable')) {
            el.classList.add('bbn-droppable');
          }
        }
      }
      else {
        el.dataset.bbn_droppable = false;
        if (el.bbnDirectives === undefined) {
          el.bbnDirectives = {};
        }
        if (el.bbnDirectives.droppable === undefined) {
          el.bbnDirectives.droppable = {};
        }
        if (!!el.bbnDirectives.droppable.active) {
          if (bbn.fn.isFunction(el.bbnDirectives.droppable.onmouseenter)) {
            el.removeEventListener('mouseenter', el.bbnDirectives.droppable.onmouseenter);
          }
          if (bbn.fn.isFunction(el.bbnDirectives.droppable.onmouseleave)) {
            el.removeEventListener('mouseleave', el.bbnDirectives.droppable.onmouseleave);
          }
          if (bbn.fn.isFunction(el.bbnDirectives.droppable.ondragoverdroppable)) {
            el.removeEventListener('dragoverdroppable', el.bbnDirectives.droppable.ondragoverdroppable);
          }
          if (bbn.fn.isFunction(el.bbnDirectives.droppable.onbeforedrop)) {
            el.removeEventListener('beforedrop', el.bbnDirectives.droppable.onbeforedrop);
          }
        }
        el.bbnDirectives.droppable = {
          active: false
        };
        if (el.classList.contains('bbn-droppable')) {
          el.classList.remove('bbn-droppable');
        }
      }
    }
  };
})();