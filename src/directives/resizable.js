(() => {
  const startDrag = (e, ele) => {
    if (!!ele.bbnDirectives.resizable.active
      && !ele.bbnDirectives.resizable.resizing
      && !!ele.bbnDirectives.resizable.modes
      && bbn.fn.numProperties(ele.bbnDirectives.resizable.modes)
    ) {
      ele.bbnDirectives.resizable.resizing = true;
      let cursor = ''
          modes = ele.bbnDirectives.resizable.modes;
      if (!!modes.left) {
        cursor = !!modes.top ? 'nwse-resize' : (!!modes.bottom ? 'nesw-resize' : 'ew-resize');
      }
      else if (!!modes.right) {
        cursor = !!modes.top ? 'nesw-resize' : (!!modes.bottom ? 'nwse-resize' : 'ew-resize');
      }
      else if (!!modes.top) {
        cursor = !!modes.right ? 'nesw-resize' : (!!modes.left ? 'nwse-resize' : 'ns-resize');
      }
      else if (!!modes.bottom) {
        cursor = !!modes.right ? 'nwse-resize' : (!!modes.left ? 'nesw-resize' : 'ns-resize');
      }
      ele.bbnDirectives.resizable.cursor = window.getComputedStyle(document.body).cursor;
      document.body.style.cursor = cursor;
      ele.classList.add('bbn-resizable-resizing');
      ele.bbnDirectives.resizable.mouseX = bbn.fn.roundDecimal(e.x, 0);
      ele.bbnDirectives.resizable.mouseY = bbn.fn.roundDecimal(e.y, 0);
      if (!ele.bbnDirectives.resizable.container) {
        ele.bbnDirectives.resizable.container = bbn.fn.isDom(ele.parentElement) ? ele.parentElement : document.body;
      }
      let ev = new CustomEvent('userresizestart', {
        cancelable: true,
        bubbles: true,
        detail: ele.bbnDirectives.resizable
      });
      ele.dispatchEvent(ev);
      if (ele.bbn !== undefined) {
        ele.bbn.$emit('userresizestart', ev);
      }
      if (!ev.defaultPrevented) {
        ev.stopImmediatePropagation();
        let fnDrag = e => {
          drag(e, ele);
        };
        let fnEnd = e => {
          endDrag(e, ele);
          document.removeEventListener('mousemove', fnDrag);
        };
        document.addEventListener('mouseup', fnEnd, {once: true});
        document.addEventListener('mousemove', fnDrag);
      }
    }
  };

  const drag = (e, ele) => {
    if (!!ele.bbnDirectives.resizable.active
      && !!ele.bbnDirectives.resizable.resizing
    ) {
      // we prevent default from the event
      e.stopImmediatePropagation();
      e.preventDefault();
      let rectContainer = ele.bbnDirectives.resizable.container.getBoundingClientRect(),
          rectEle = ele.getBoundingClientRect(),
          style = window.getComputedStyle(ele),
          x = bbn.fn.roundDecimal(e.x, 0),
          y = bbn.fn.roundDecimal(e.y, 0),
          modes = ele.bbnDirectives.resizable.modes,
          minWidth = parseFloat(style.minWidth) || 10,
          maxWidth = parseFloat(style.maxWidth) || rectContainer.width,
          minHeight = parseFloat(style.minHeight) || 10,
          maxHeight = parseFloat(style.maxHeight) || rectContainer.height,
          xMovement = bbn.fn.roundDecimal(ele.bbnDirectives.resizable.mouseX - x, 0),
          yMovement = bbn.fn.roundDecimal(ele.bbnDirectives.resizable.mouseY - y, 0),
          width = rectEle.width + (!!modes.left ? xMovement : -xMovement),
          height = rectEle.height + (!!modes.top ? yMovement : -yMovement),
          paddingLeft = parseFloat(style.paddingLeft) || 0,
          paddingRight = parseFloat(style.paddingRight) || 0,
          paddingTop = parseFloat(style.paddingTop) || 0,
          paddingBottom = parseFloat(style.paddingBottom) || 0,
          borderLeft = parseFloat(style.borderLeft) || 0,
          borderRight = parseFloat(style.borderRight) || 0,
          borderTop = parseFloat(style.borderTop) || 0,
          borderBottom = parseFloat(style.borderBottom) || 0,
          wt = paddingLeft + paddingRight + borderLeft + borderRight,
          ht = paddingTop + paddingBottom + borderTop + borderBottom;
      if (minWidth < wt) {
        minWidth = wt;
      }
      if (minHeight < ht) {
        minHeight = ht;
      }
      if (maxWidth > rectContainer.width) {
        maxWidth = rectContainer.width;
      }
      if (maxHeight > rectContainer.height) {
        maxHeight = rectContainer.height;
      }
      width = width < minWidth ? minWidth : (width > maxWidth ? maxWidth : width);
      height = height < minHeight ? minHeight : (height > maxHeight ? maxHeight : height);
      if (((!!modes.left && xMovement)
          || (!!modes.top && yMovement)
        )
        && (style.position !== 'absolute')
        && (style.position !== 'fixed')
      ) {
        ele.style.position = 'absolute';
      }
      if ((!!modes.left || !!modes.right) && (width !== rectEle.width)) {
        let detail = {
              from: !!modes.left ? 'left' : 'right',
              movement: xMovement,
              size: width,
              oldSize: rectEle.width
            },
            ev = new CustomEvent('resize', {
              cancelable: true,
              bubbles: true,
              detail: detail
            });
        ele.dispatchEvent(ev);
        if (!ev.defaultPrevented) {
          if (!!modes.left && xMovement) {
            ele.style.left = ele.offsetLeft - xMovement + 'px';
          }
          ele.style.width = width + 'px';
          if (ele.bbn !== undefined) {
            ele.bbn.$emit('userresize', ev, detail);
            if (!ev.defaultPrevented
              && (ele.bbn.parentResizer !== undefined)
              && bbn.fn.isFunction(ele.bbn.parentResizer.onResize)
            ) {
              ele.bbn.parentResizer.onResize();
            }
          }
        }
      }
      if ((!!modes.top || !!modes.bottom) && (height !== rectEle.height)) {
        let detail = {
              from: !!modes.top ? 'top' : 'bottom',
              movement: yMovement,
              size: height,
              oldSize: rectEle.height
            },
            ev = new CustomEvent('userresize', {
              cancelable: true,
              bubbles: true,
              detail: detail
            });
        ele.dispatchEvent(ev);
        if (!ev.defaultPrevented) {
          if (!!modes.top && yMovement) {
            ele.style.top = ele.offsetTop - yMovement + 'px';
          }
          ele.style.height = height + 'px';
          if (ele.bbn !== undefined) {
            ele.bbn.$emit('userresize', ev, detail);
            if (!ev.defaultPrevented
              && (ele.bbn.parentResizer !== undefined)
              && bbn.fn.isFunction(ele.bbn.parentResizer.onResize)
            ) {
              ele.bbn.parentResizer.onResize();
            }
          }
        }
      }
      ele.bbnDirectives.resizable.mouseX = x;
      ele.bbnDirectives.resizable.mouseY = y;
    }
  };

  const endDrag = (e, ele) => {
    if (!!ele.bbnDirectives.resizable.active
      && !!ele.bbnDirectives.resizable.resizing
    ) {
      ele.bbnDirectives.resizable.resizing = false;
      ele.classList.remove('bbn-resizable-resizing');
      document.body.style.cursor = ele.bbnDirectives.resizable.cursor;
      e.preventDefault();
      e.stopImmediatePropagation();
      let ev = new CustomEvent('userresizeend', {
        cancelable: true,
        bubbles: true,
        detail: ele.bbnDirectives.resizable
      });
      ele.dispatchEvent(ev);
      if (ele.bbn !== undefined) {
        ele.bbn.$emit('userresizestart', ev);
      }
      delete ele.bbnDirectives.resizable.mouseX;
      delete ele.bbnDirectives.resizable.mouseY;
    }
  };

  const inserted = (el, binding) => {
    if (el.bbnDirectives === undefined) {
      el.bbnDirectives = {};
    }
    if (el.bbnDirectives.resizable === undefined) {
      el.bbnDirectives.resizable = {};
    }
    if ((binding.value !== false)
      && !el.classList.contains('bbn-unresizable')
    ) {
      let options = {},
          asMods = bbn.fn.isArray(binding.modifiers) && !!binding.modifiers.length,
          asContainerFromMods = asMods && binding.modifiers.includes('container'),
          asArg = !!binding.arg && binding.arg.length,
          modes = {
            top: !asMods || binding.modifiers.includes('top'),
            right: !asMods || binding.modifiers.includes('right'),
            bottom: !asMods || binding.modifiers.includes('bottom'),
            left: !asMods || binding.modifiers.includes('left')
          },
          container = false;
      el.dataset.bbn_resizable = true;
      el.bbnDirectives.resizable = {
        active: true,
        resizing: false,
        enabledModes: modes
      };
      if (!el.classList.contains('bbn-resizable')) {
        el.classList.add('bbn-resizable');
      }

      if (asArg) {
        switch (binding.arg) {
          case 'container':
            container = binding.value;
            break;
        }
      }
      else {
        if (bbn.fn.isObject(binding.value)) {
          options = binding.value;
          if (asContainerFromMods) {
            if ((options.container === undefined)
              || !bbn.fn.isDom(options.container)
            ) {
              bbn.fn.error(bbn._('No "container" property found or not a DOM element'));
              throw bbn._('No "container" property found or not a DOM element');
            }
            container = options.container;
          }
        }
      }
      el.bbnDirectives.resizable.container = container;
      el.bbnDirectives.resizable.options = options;
      el.bbnDirectives.resizable.onmousemove = ev => {
        if (!!el.bbnDirectives.resizable.active
          && !el.bbnDirectives.resizable.resizing
        ) {
          let rect = el.getBoundingClientRect(),
              m = {};
          if (modes.left
            && (ev.x >= (rect.left - 2))
            && (ev.x <= (rect.left + 2))
          ) {
            m.left = true;
            el.classList.add('bbn-resizable-over-left');
          }
          else {
            el.classList.remove('bbn-resizable-over-left');
          }
          if (modes.right
            && (ev.x >= (rect.left + rect.width - 2))
            && (ev.x <= (rect.left + rect.width + 2))
          ) {
            m.right = true;
            el.classList.add('bbn-resizable-over-right');
          }
          else {
            el.classList.remove('bbn-resizable-over-right');
          }
          if (modes.top
            && (ev.y >= (rect.top - 2))
            && (ev.y <= (rect.top + 2))
          ) {
            m.top = true;
            el.classList.add('bbn-resizable-over-top');
          }
          else {
            el.classList.remove('bbn-resizable-over-top');
          }
          if (modes.bottom
            && (ev.y >= (rect.top + rect.height - 2))
            && (ev.y <= (rect.top + rect.height + 2))
          ) {
            m.bottom = true;
            el.classList.add('bbn-resizable-over-bottom');
          }
          else {
            el.classList.remove('bbn-resizable-over-bottom');
          }
          if (!el.bbnDirectives.resizable.resizing) {
            el.bbnDirectives.resizable.modes = m;
          }
        }
      };
      el.addEventListener('mousemove', el.bbnDirectives.resizable.onmousemove);

      // Add the events listener to capture the long press click and start the drag
      let clickTimeout = 0,
          holdClick = false;
      el.bbnDirectives.resizable.onmousedown = ev => {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
        if (!!el.bbnDirectives.resizable.active
          && !el.bbnDirectives.resizable.resizing
          && !!el.bbnDirectives.resizable.modes
          && bbn.fn.numProperties(el.bbnDirectives.resizable.modes)
        ) {
          if (ev.button === 0) {
            holdClick = true;
            clickTimeout = setTimeout(() => {
              if (holdClick) {
                startDrag(ev, el);
              }
            }, 150);
          }
        }
      };
      el.addEventListener('mousedown', el.bbnDirectives.resizable.onmousedown);
      el.bbnDirectives.resizable.onmouseup = ev => {
        if (!!el.bbnDirectives.resizable.active) {
          holdClick = false;
        }
      };
      el.addEventListener('mouseup', el.bbnDirectives.resizable.onmouseup);
    }
    else {
      el.dataset.resizable = false;
      el.bbnDirectives.resizable = {
        active: false
      };
    }
  };

  bbn.wc.directives['bbn-resizable'] = {
    inserted: inserted,
    update: (el, binding) => {
      if ((binding.value !== false)
        && !el.classList.contains('bbn-unresizable')
      ) {
        if (binding.oldValue === false) {
          inserted(el, binding);
        }
        else {
          el.dataset.bbn_resizable = true;
          if (!el.classList.contains('bbn-resizable')) {
            el.classList.add('bbn-resizable');
          }
        }
      }
      else {
        el.dataset.bbn_resizable = false;
        if (el.bbnDirectives === undefined) {
          el.bbnDirectives = {};
        }
        if (el.bbnDirectives === undefined) {
          el.bbnDirectives = {};
        }
        if (el.bbnDirectives.resizable === undefined) {
          el.bbnDirectives.resizable = {};
        }
        if (!!el.bbnDirectives.resizable.active) {
          if (bbn.fn.isFunction(el.bbnDirectives.resizable.onmousedown)) {
            el.removeEventListener('mousedown', el.bbnDirectives.resizable.onmousedown);
          }
          if (bbn.fn.isFunction(el.bbnDirectives.resizable.onmouseup)) {
            el.removeEventListener('mouseup', el.bbnDirectives.resizable.onmouseup);
          }
          if (bbn.fn.isFunction(el.bbnDirectives.resizable.onmousemove)) {
            el.removeEventListener('mousemove', el.bbnDirectives.resizable.onmousemove);
          }
        }
        el.bbnDirectives.resizable = {
          active: false
        };
        if (el.classList.contains('bbn-resizable')) {
          el.classList.remove('bbn-resizable');
        }
      }
    }
  };
})();
