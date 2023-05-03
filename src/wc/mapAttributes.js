(() => {
  bbn.fn.autoExtend('wc', {
    mapAttributes(tpl, map) {
      if (map === undefined) {
        map = bbn.fn.createObject();
      }

      const originalMap = map;

      for (node of tpl) {
        map = originalMap;

        if (node.loop) {
          map[node.loop.hash] = bbn.fn.createObject({
            res: undefined,
            loopData: bbn.fn.createObject(),
            elements: [],
          });
          map = map[node.loop.hash].loopData;
        }

        if (node.text) {
          if (!map[node.hash]) {
            map[node.hash] = bbn.fn.createObject({
              res: undefined,
              elements: [],
            });
          }
        }
        else if (node.attr) {
          for (attrName in node.attr) {
            if (node.attr[attrName].exp && !map[node.attr[attrName].hash]) {
              map[node.attr[attrName].hash] = bbn.fn.createObject({
                res: undefined,
                elements: [],
              });
            }
          }
        }

        if (node.items) {
          bbn.wc.mapAttributes(node.items, map);
        }

        if (node.slots) {
          for (n in node.slots) {
            bbn.wc.mapAttributes(node.slots[n], map);
          }
        }
      }

      return map;
    }
  })
})();
