(bbn => {
  "use strict";
  /**
   * component Inside Component.
   *
   * @component componentInsideComponent
   */
  Object.defineProperty(bbn.wc.mixins, 'componentInside', {
    configurable: false,
    writable: false,
    value: {
      props: {
      /**
        * The component that will be rendered inside the main component.
        * @prop {String|Object} component
        * @memberof componentInsideComponent
        */
        component: {
          type: [String, Object]
        },
      /**
        * The component's props.
        * @prop {Object} componentOptions
        * @memberof componentInsideComponent
        */
        componentOptions: {
          type: Object,
          default(){
            return {};
          }
        }
      }
    }
  });
})(bbn);
