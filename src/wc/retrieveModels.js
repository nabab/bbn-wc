(() => {
  bbn.fn.autoExtend('wc', {
    retrieveModels(tpl, res) {
      if (res === undefined) {
        res = bbn.fn.createObject();
      }

      bbn.fn.each(tpl, node => {
        if (node.model) {
          /*
          if (!res[node.id]) {
            res[node.id] = bbn.fn.createObject();
          }
          */
          bbn.fn.iterate(node.model, (a, name) => {
            if (!res[a.hash]) {
              res[a.hash] = bbn.fn.createObject();
            }

            res[a.hash][node.id] = bbn.fn.createObject({
              [name]: bbn.fn.createObject({
                _root: bbn.fn.createObject()
              })
            });
          });
        }
        if (node.items) {
          bbn.wc.retrieveModels(node.items, res);
        }
        if (node.slots) {
          bbn.wc.retrieveModels(node.slots, res);
        }
      })

      return res;
    }
  })
})();
