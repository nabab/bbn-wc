(() => {
  bbn.fn.autoExtend('wc', {
    mapTemplate(tpl, map) {
      bbn.fn.checkType(tpl, 'array', bbn._("Template must be an array"));
      if (!map) {
        map = [];
      }

      bbn.fn.each(tpl, el => {
        el.index = map.length;
        map.push(el);
        if (el.items) {
          bbn.wc.mapTemplate(el.items, map);
        }
        if (el.slots) {
          bbn.wc.mapTemplate(el.slots, map);
        }
      });

      return map;
    }
  })
})();
