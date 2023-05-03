(() => {
  /**
   * Creates an element in the given target
   * @param {HTMLElement} d 
   * @param {HTMLElement} target 
   * @returns 
   */
  Object.defineProperty(bbnComponentPrototype, '$createText', {
    writable: false,
    configurable: false,
    value: function(d, target) {
      const cpSource = this;//d.componentId ? bbn.wc.getComponent(d.componentId).bbn : this;
      const ele = document.createTextNode(d.text);
      Object.defineProperty(ele, 'bbnId', {
        value: d.id,
        writable: false,
        configurable: false
      });
      Object.defineProperty(ele, 'bbnComponentId', {
        value: cpSource.$cid,
        writable: false,
        configurable: false
      });

      if (d.loopHash) {
        Object.defineProperty(ele, 'bbnHash', {
          value: d.loopHash,
          writable: false,
          configurable: false
        });
        Object.defineProperty(ele, 'bbnIndex', {
          value: d.loopIndex,
          writable: false,
          configurable: false
        });
        cpSource.$addToElements(d.id, ele, d.loopHash, d.loopIndex);
      }
      else {
        cpSource.$addToElements(d.id, ele);
      }

      target.appendChild(ele);
      return ele;
    }
  });
})();
