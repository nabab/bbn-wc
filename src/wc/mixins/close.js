(bbn => {
  "use strict";
    /**
     * Close component.
     * @component close
     */
  Object.defineProperty(bbn.wc.mixins, 'close', {
    configurable: false,
    writable: false,
    value: {
      /**
       * Adds the class 'bbn-close-component' to the component.
       * @event created
       * @memberof closeComponent
       */
      created(){
        this.componentClass.push('bbn-close-component');
      },
      data(){
        return {
          /**
           * Defines if the component's source has been modified. 
           * @data {Boolean}  [false] dirty
           * @memberof closeComponent
           */
          dirty: false
        }
      },
      computed: {
        /**
         * If the prop 'dirty' is false the component can be closed. 
         * @computed {Boolean} canClose
         * @memberof closeComponent
         */
        canClose(){
          return !this.dirty;
        }
      },
      methods: {

      }
    }
  });
})(bbn);