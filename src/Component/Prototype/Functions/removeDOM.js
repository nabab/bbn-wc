(() => {
  /**
   * Remove an element from the DOM
   * @param {HTMLElement} ele
   */
  Object.defineProperty(bbnComponentPrototype, '$removeDOM', {
    writable: false,
    configurable: false,
    value: function(ele) {
      if (!window.numDel) {
        window.numDel = 0;
      }
      window.numDel++;
      const id = ele.bbnId;
      const hash = ele.bbnHash;
      const cpSource = ele.bbnComponentId && (ele.bbnComponentId !== this.$cid) ? bbn.wc.getComponent(ele.bbnComponentId).bbn : this;
      // It won't have an ID if it's a bbn-text or bbn-html
      if (id) {
        if (ele.bbnSlots) {
          bbn.fn.iterate(ele.bbnSlots, slot => {
            bbn.fn.each(slot.items, o => {
              let cp = o.ele.bbnComponentId !== this.$cid ? bbn.wc.getComponent(o.ele.bbnComponentId).bbn : this;
              cp.$removeDOM(o.ele);
            });
          });
        }

        if (ele.childNodes && !ele.bbnSchema?.props?.['bbn-text'] && !ele.bbnSchema?.props?.['bbn-html']) {
          bbn.fn.each(Array.from(ele.childNodes), (node, i) => {
            let cp = ele.bbnComponentId !== this.$cid ? bbn.wc.getComponent(ele.bbnComponentId).bbn : this;
            cp.$removeDOM(node);
          });
        }

        cpSource.$removeFromElements(id, hash);
      }
      else {
        bbn.fn.log("Impossible to remove element without ID", ele);
      }

      if (ele.parentNode) {
        ele.parentNode.removeChild(ele);
      }
      else {
        bbn.fn.log("Can't find ", ele)
      }
    }
  });
})();
