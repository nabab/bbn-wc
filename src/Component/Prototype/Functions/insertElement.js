(() => {
  /**
   * Creates an element in the given target
   * @param {HTMLElement} d 
   * @param {HTMLElement} target 
   * @returns 
   */
  Object.defineProperty(bbnComponentPrototype, '$insertElement', {
    writable: false,
    configurable: false,
    value: function(ele, target, before, oldEle) {
      const isParentComponent = (target !== this.$el) && bbn.wc.isComponent(target);
      let replace = false;
      const isComment = bbn.fn.isComment(ele);
      if (oldEle) {
        const isOldComment = bbn.fn.isComment(oldEle);
        if (
          (oldEle !== this.$el)
          && (
            (isOldComment !== isComment)
            || (
              !isOldComment
              && d.tag
              && !bbn.wc.isTag(d.tag, oldEle)
            )
          )
        ) {
          replace = true;
        }
        else {
          ele = oldEle;
        }
      }
      if (replace) {
        bbn.fn.log("REPLACE", ele);
        if (isParentComponent && !ele.bbnSchema.comment) {
          bbn.fn.log("IN CP");
          const slot = ele.getAttribute("slot") || 'default';
          if (target.bbnSlots?.[slot]) {
            let idx = bbn.fn.search(target.bbnSlots[slot].items, {'ele.bbnId': oldEle.bbnId});
            if (idx > -1) {
              const mounted = target.bbnSlots[slot].items[idx].mounted;
              if (mounted) {
                oldEle.parentNode.replaceChild(ele, oldEle);
              }

              target.bbnSlots[slot].items.splice(idx, 1, {ele, mounted});
            }
          }
        }
        else {
          bbn.fn.log("OUT CP");
          target.replaceChild(ele, oldEle);
        }

        bbn.fn.log(`Replacing in createElement ${ele.bbnId}`);
        this.$removeFromElements(ele.bbnId, ele.bbnHash);
        this.$addToElements(ele.bbnId, ele, ele.bbnHash);
      }
      else {
        if (isParentComponent) {
          const slot = ele.bbnSchema.props?.slot || 'default';
          if (target.bbnSlots?.[slot]) {
            target.bbnSlots[slot].items.push({
              ele,
              mounted: false
            });
          }
        }
        else {
          if (before) {
            target.insertBefore(ele, before);
          }
          else {
            target.appendChild(ele);
          }
        }
      }
    }
  });
})();
