(bbn => {
  "use strict";
  /**
   * Basic Component.
   *
   * @component emptyComponent
   */
  Object.defineProperty(bbn.wc.mixins, 'empty', {
    configurable: false,
    writable: false,
    value: {
      template: '<template><slot></slot></template>',
      /**
       * Adds the class 'bbn-empty-component' to the component's template.
       * @event created
       * @memberof emptyComponent
       */
      created(){
        this.componentClass.push('bbn-empty-component');
      },
    }
  });
})(bbn);