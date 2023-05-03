(bbn => {
  "use strict";
  /**
   * Basic Component.
   *
   * @component basicComponent
   */
  Object.defineProperty(bbn.wc.mixins, 'popup', {
    configurable: false,
    writable: false,
    value: {
      props: {
        /**
         * The object popup of the table.
         * @prop {Object}
         */
        popup: {
          type: Object
        }
      },
      methods: {
        /**
         * Retuns the popup object.
         * @method getPopup
         * @returns {Object}
         */
        getPopup(cfg){
          let popup = this.popup || bbn.wc.getPopup(this);
          if (!cfg) {
            return popup;
          }
          if (popup) {
            cfg.opener = this;
            return popup.open(cfg);
          }
        },
        
      }
    }
  });
})(bbn);
