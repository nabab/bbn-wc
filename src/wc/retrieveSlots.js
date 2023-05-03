(() => {
  bbn.fn.autoExtend('wc', {
    retrieveSlots(tpl, res) {
      if (res === undefined) {
        res = bbn.fn.createObject();
      }

      bbn.fn.each(tpl, node => {
        if (node.tag && (node.tag === 'slot')) {
          let idx = node.attr && node.attr.name ? node.attr.name.value : 'default'
          if (!idx) {
            bbn.fn.error(bbn._("Invalid slot name"));
          }

          if (res[idx]) {
            throw new Error("A same slot can't appear twice in the template");
          }

          res[idx] = bbn.fn.createObject({
            id: node.id,
            items: []
          });
        }
        if (node.items) {
          bbn.wc.retrieveSlots(node.items, res);
        }
      });

      return res;
    }
  })
})();
