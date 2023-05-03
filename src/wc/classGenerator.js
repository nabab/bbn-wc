(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * Generates the code for creating the public class
     * Be careful that cpTpl, cpCfg and cpCls are defined
     *
     */
    classGenerator(name, clsExtends = 'bbnComponent') {
      return `window.${name} = class ${name} extends ${clsExtends}
{
  static get bbnTpl() {
    return cpTpl;
  }
  static get bbnCfg() {
    return cpCfg;
  }
  static get bbnCls() {
    return cpCls;
  }
  static get bbnMap() {
    return cpMap;
  }
  static get bbnModels() {
    return cpModels;
  }
  static get bbnSlots() {
    return cpSlots;
  }
  static get bbnFn() {
    return ${name}Creator;
  }

  constructor() {
    super();
  }
};`;
    }
  })
})();
