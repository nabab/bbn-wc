(() => {
  bbn.fn.autoExtend('wc', {
    /**
    * Defines a component with the Object config and the HTML template
    * @param name The tag name of the component
    * @param obj The Vue-like configuration object
    * @param tpl The template as string or array from stringToTemplate
    */
    define(name, obj, tpl, css) {
      if (bbn.wc.known.includes(name)) {
        return;
      }
      if (!name) {
        bbn.fn.warning("BOO");
        bbn.fn.log(obj);
      }
      // Template string becomes a DOM array
      let tmp = bbn.wc.stringToTemplate(tpl, true);
      const cpTpl = tmp.res;
      const cpMap = tmp.map;
      const cpModels = bbn.wc.retrieveModels(cpTpl);
      const cpSlots = bbn.wc.retrieveSlots(cpTpl);
      if (!cpSlots.default) {
        cpSlots.default = bbn.fn.createObject({
          id: null,
          items: []
        });
      }
      // Name of the class based on the tag name
      const publicName = bbn.fn.camelize(name);
      // The component config (= Vue-like object) that we freeze
      const cpCfg = Object.freeze(bbn.wc.normalizeComponent(obj, publicName));
      const cls = cpCfg.tag && bbn.wc.tagExtensions[cpCfg.tag] ? bbn.wc.tagExtensions[cpCfg.tag] : 'bbnComponent';
      if (css) {
        const styleSheet = document.createElement('style');
        const old = document.getElementById(name + "-bbn-css");
        if (old) {
          document.head.removeChild(old);
        }

        styleSheet.setAttribute("id", name + "-bbn-css");
        styleSheet.textContent = css;
        document.head.append(styleSheet);
      }

      // Generating the code for the private class based on the component config
      const publicClassCode = bbn.wc.classGenerator(publicName, cls);
      // Evaluating that code: defining the public class
      eval(publicClassCode);
      // Generating the code for the private class based on the component config
      //const privateClassCode = makePrivateClass(privateName, cpCfg);
      const fnCode = bbn.wc.functionGenerator(publicName, cpCfg);
      //bbn.fn.log(makePrivateFunction(privateName, cpCfg));
      // Evaluating that code: defining the private class
      eval(fnCode);
      const fnName = publicName + 'Creator';
      // Retrieving the class object
      const cpCls = window[fnName];
      cpCls.bbnTpl = cpTpl;
      cpCls.bbnMap = cpMap;
      // If subcomponents are defined we init them too
      if (cpCfg.components) {
        for (let n in cpCfg.components) {
          bbn.wc.define(cpCfg.componentNames[n], cpCfg.components[n], cpCfg.components[n].template);
          //cpProto.$options.components[n] = cpCfg.components[n];
        }
      }

      // Getting the class object from the Window (seems impossible otherwise)
      const publicCls = window[publicName];
      const args = [name, publicCls];
      if (cls !== 'bbnComponent') {
        cpCls.bbnTag = cpCfg.tag;
        args.push({extends: cpCfg.tag});
      }

      // Adding the newly defined component to the known array
      bbn.wc.known.push(name);
      // Assigning the public class to the component's tag
      customElements.define(...args);
    }
  })
})();
