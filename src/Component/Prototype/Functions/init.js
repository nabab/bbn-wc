(() => {
  /**
   * Starts everything up
   * @returns 
   */
  Object.defineProperty(bbnComponentPrototype, '$init', {
    writable: false,
    configurable: false,
    value: function(el) {
      if (Object.hasOwn(this, '$isInit')) {
        return;
      }
      /**
       * Constructor of the BBNComponentObject
       * 
       * @param {[bbnComponent, bbnAnonymous]} el Always attached to an HTML component
       * @param {Number} id Comes from the template
       */

      // This will become true after all is mounted
      Object.defineProperty(this, '$isInit', {
        value: false,
        writable: false,
        configurable: true
      });

      // This will be true during the construction process (updateComponent)
      Object.defineProperty(this, '$isCreating', {
        value: false,
        writable: true,
        configurable: true
      });

      // This will be true during the construction process (updateComponent)
      Object.defineProperty(this, '$isUpdating', {
        value: null,
        writable: true,
        configurable: true
      });

      // This will be true during the construction process (updateComponent)
      Object.defineProperty(this, '$tagUsed', {
        value: [],
        writable: false,
        configurable: true
      });

      // Setting up basic props
      Object.defineProperty(this, '$el', {
        value: el,
        writable: false,
        configurable: false
      });
      /**
       * Component configuration object
       */
      Object.defineProperty(this, '$cfg', {
        value: this.$el.bbnCfg || this.$el.constructor.bbnCfg,
        writable: false,
        configurable: false
      });

      /**
       * Template array
       */
      Object.defineProperty(this, '$tpl', {
        value: this.$el.bbnTpl || this.$el.constructor.bbnTpl,
        writable: false,
        configurable: false
      });

      const _t = this;

      Object.defineProperty(this.$options, 'propsData', {
        get() {
          return _t.$el.bbnSchema?.props || {};
        }
      });

      Object.defineProperty(this, '$props', {
        value: bbn.fn.createObject(),
        writable: false,
        configurable: false
      });

      /**
       * Object of all available slots nodes in the template.
       * Indexed by name with id as value
       */
      Object.defineProperty(this, '$availableSlots', {
        get() {
          return this.$el.bbnSlots || bbnComponent.availableSlots;
        }
      });

      /**
       * Object of all available slots nodes in the template.
       * Indexed by name with id as value
       */
      Object.defineProperty(this, '$isBusy', {
        get() {
          return this.$isCreating || this.$isUpdating;
        }
      });

      /**
       * Object of all elements with bbn-model prop.
       * Indexed by element's id with bbn-model's value as value
       */
      Object.defineProperty(this, '$dataModels', {
        get() {
          return this.$el.bbnModels || this.$el.constructor.bbnModels;
        }
      });

      /**
       * Object of all elements with bbn-model prop.
       * Indexed by element's id with bbn-model's value as value
       */
      Object.defineProperty(this, '$computed', {
        value: bbn.fn.createObject()
      });

      Object.defineProperty(this, '$watcher', {
        value: bbn.fn.createObject(),
        writable: false
      });

      bbn.fn.iterate(this.$cfg.watch, (a, name) => {
        this.$watch(name, a);
      });

      /**
       * Object referencing all the content for each available slot.
       * Indexed by slot's name (default is default), it contains an array of nodes which are the content
       * @return {Object}
       */
      Object.defineProperty(this, '$slots', {
        get() {
          return this.$el.bbnSlots;
        }
      });

      /**
       * The ID of the component, corresponding ot its ID in the template.
       * Components inside a loop have all the same id
       */
      Object.defineProperty(this, '$id', {
        value: this.$el.bbnId,
        writable: false,
        configurable: false
      });

      /**
       * Unique ID for each component, used for global registration
       */
      Object.defineProperty(this, '$cid', {
        value: this.$el.bbnCid,
        writable: false,
        configurable: false
      });

      /**
       * Unique ID for each component, used for global registration
       */
      Object.defineProperty(this, '$cls', {
        value: this.$el.constructor,
        writable: false,
        configurable: false
      });

      Object.defineProperty(this, '$attr', {
        value: bbn.fn.getAttributes(this.$el),
        writable: false,
        configurable: false
      });

      /*
      if (this.$el.bbnSchema?.props) {
        bbn.fn.iterate(this.$el.bbnSchema.props, (prop, n) => {
          if (n === 'bbn-bind') {
            bbn.fn.iterate(prop, (p2, n2) => {
              this.$setProp(n2, p2);
            });
          }
          else {
            this.$setProp(n, prop);
          }
        })
      }
      */

      Object.defineProperty(this, '$events', {
        value: bbn.fn.createObject(),
        writable: false,
        configurable: false
      });

        /**
       * Array of bbnComponentObject instances direct descendants of the current one
       * @return {Array}
       */
      Object.defineProperty(this, '$children', {
        value: [],
        writable: false,
        configurable: false
      });

      Object.defineProperty(this, '$elements', {
        value: bbn.fn.createObject(),
        writable: false,
        configurable: false
      });

      Object.defineProperty(this, '$queue', {
        value: [],
        writable: false,
        configurable: false
      });

      /** @var {Object} $dataValues The content of the data */
      Object.defineProperty(this, '$dataValues', {
        value: bbn.fn.createObject(),
        writable: false,
        configurable: false
      });

      /**
       * Object of all the instance properties available directly in the HTML templates.
       * Indexed by name, the value being the type (data, prop, method, computed)
       * @return {Object}
       */
      Object.defineProperty(this, '$namespaces', {
        value: bbn.fn.createObject(),
        writable: false,
        configurable: false
      });

      Object.defineProperty(this, '$refsElements', {
        value: bbn.fn.createObject(),
        writable: false,
        configurable: false
      });

      Object.defineProperty(this, '_self', {
        get() {
          return this;
        }
      });

      /**
       * Counts the number of times the component has been repainted through the method updateComponent
       */
      Object.defineProperty(this, '$numBuild', {
        value: 0,
        writable: true,
        configurable: true
      });
  
      //Object.defineProperty
      //this.$event = null;
      //this.$cls = this.$el.constructor;
      /**
       * Object referencing all the elements with ref prop
       * Indexed by name, value being the bbnComponentObject if it's a component a HTMLElement otherwise
       * @return {Object}
       */
      this.$refs = new Proxy(this.$refsElements, {
        get(target, propName) {
          let tmp = target[propName];
          if (tmp) {
            if (bbn.fn.isArray(tmp)) {
              return tmp.filter(a => a.isConnected)
                        .map(a => a.bbn || a);
            }
    
            return tmp.isConnected ? (tmp.bbn || tmp) : null;
          }
        }
      });
    
      // Setting up available props for HTML templates
      this.$addNamespace('$props', 'data');
      this.$addNamespace('$el', 'data');
      this.$addNamespace('$root', 'data');
      this.$addNamespace('$attr', 'data');
      this.$addNamespace('$event', 'data');
      this.$addNamespace('$parent', 'data');
      this.$addNamespace('$options', 'data');
      this.$addNamespace('$namespaces', 'computed');
      this.$addNamespace('$children', 'computed');
      this.$addNamespace('$refs', 'computed');
      this.$addNamespace('$slots', 'computed');
      this.$addNamespace('$isCreated', 'data');
      this.$addNamespace('$isMounted', 'data');
      this.$addNamespace('_', 'method');
      this.$addNamespace('_self', 'data');
      this.$addNamespace('$emit', 'method');
      bbn.fn.iterate(window.bbnComponentPrototype, (a, n) => {
        if (bbn.fn.isFunction(a)) {
          this.$addNamespace(n, 'method');
        }
      });
    }
  });
})();
