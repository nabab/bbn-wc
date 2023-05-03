(() => {
  bbn.fn.autoExtend('wc', {
    /**
    * Init anonymous component
    */
    createApp(ele, obj) {
      if (bbn.fn.isString(ele)) {
        ele = document.body.querySelector(ele);
      }

      /*
      bbn.wc.addPrefix('bbn', async tag => {
        const pUrl = cdnUrl + 'lib/bbn-vue/master/src/components/?components=';
        const url = pUrl + tag.substr(4) + '&v=3280&test=1&lang=fr';
        // Request
        const d = await bbn.fn.ajax(url, 'text').then(r => r);
        return d;
      });
      */
          
      // ele must be an HTMLElement
      bbn.fn.checkType(ele, HTMLElement);
      // Its content is its template
      let tmp = bbn.wc.stringToTemplate(ele.outerHTML, true);
      const cpTpl = tmp.res;
      const cpMap = tmp.map;
      const schema = bbn.fn.clone(cpTpl[0]);
      delete schema.slots;
      const placeholder = document.createComment("bbn-component placeholder");
      const parent = ele.parentNode;
      let cls = ele.style.cssText;
      if (cls) {
        cls = cls.trim()
      }

      parent.replaceChild(placeholder, ele);
      // Adding basicComponent mixin
      if (!obj.mixins) {
        obj.mixins = [];
      }
      if (!obj.mixins.includes(bbn.wc.mixins.basic)) {
        obj.mixins.push(bbn.wc.mixins.basic);
      }

      // The component config (= Vue-like object) that we freeze
      const cpCfg = Object.freeze(bbn.wc.normalizeComponent(obj, 'bbnCpRoot'));

      // If subcomponents are defined we init them too
      if (cpCfg.components) {
        for (let n in cpCfg.components) {
          bbn.wc.define(cpCfg.componentNames[n], cpCfg.components[n], cpCfg.components[n].template);
        }
      }

      const slots = bbn.wc.retrieveSlots(cpTpl);
      if (!slots.default) {
        slots.default = bbn.fn.createObject({
          id: null,
          items: []
        });
      }
      const cp = Object.assign(
        document.createElement("bbn-anonymous"),
        {
          bbnId: '0',
          bbnCfg: cpCfg,
          bbnTpl: cpTpl,
          bbnModels: bbn.wc.retrieveModels(cpTpl),
          bbnSlots: slots,
          bbnMap: cpMap,
          bbnSchema: schema
        }
      );
      if (cls) {
        cp.style.cssText = cls;
      }

      parent.replaceChild(cp, placeholder);
      /*
      bbn.fn.each(ele.childNodes, node => {
        cp.appendChild(node);
      });*/
      return cp.bbn;
      
    }
  })
})();
