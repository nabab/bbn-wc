(() => {
  /**
   * Starts everything up when the component enters the DOM
   * - Adds itself tyo the global static 'components'
   * - Sets up the props
   * - Triggers beforecreate
   * - Sets $parent
   * - Launches $addToElements in order to add the element to the $elements property
   * - Sets $root
   * - Adds namespaces for computed and methods
   * - Sets up the properties based on attributes
   * - Sets up the data
   * - Triggers created
   * - Creates the DOM
   * - Triggers beforemount
   * - Sets $isInit to true
   * - Triggers mounted
   * - Sets $isMOunted to true
   * - Starts tick interval
   * 
   * @returns {undefined}
   */
  Object.defineProperty(bbnComponentPrototype, '$connectedCallback', {
    writable: false,
    configurable: false,
    value: function() {

      // Check we are in the DOm
      //bbn.fn.warning("CALLBACK ON " + this.$options.name + " / " + this.$el.bbnSchema.id + " INIT: " + this.$isInit + " MOUNTED: " + this.$isMounted);9
      this.$init();
      if (!this.$el.isConnected || bbn.wc.getComponent(this.$el.bbnCid)) {
        return;
      }
      if (this.$isInit) {
        bbn.fn.log(`WTF ${this.constructor.name}?`)
        bbn.fn.error(`WTF ${this.constructor.name}?\nBooh, there is no parent!`);
      }

      // Adding itself to the global static #components
      bbn.wc.addComponent(this.$el);

      // An anonymous component won't have props nor this method
      /** @todo check if the above assertion is true (source?) */
      this.$setUpProps();

      // Sending beforeCreate event
      const beforeCreate = new Event('hook:beforecreate');
      this.$onBeforeCreate();
      this.$el.dispatchEvent(beforeCreate);
      // Setting up $parent prop
      const parentNode = this.$el.parentNode;
      // host is for shadow DOM (not used)
      const parent = parentNode.host ? parentNode.host.closest(".bbn-component") : parentNode.closest(".bbn-component");
      /*
      if (!parent && !this.$retrieveElement(this.$el.bbnId)) {
        this.$addToElements(this.$el.bbnId, this.$el);
      }
      */

      // $parent will always remain the same, it should only be null for root
      Object.defineProperty(this, '$parent', {
        value: parent ? parent.bbn : null,
        writable: false,
        configurable: false
      });
      /**
       * The highest component in the document's hierarchy
       */
      Object.defineProperty(this, '$root', {
        value: this.$parent?.$root || this,
        writable: false,
        configurable: false
      });
      
      if (this === this.$root) {
        this.$fetchTimeout = null;
        Object.defineProperty(this, '$unknownComponents', {
          value: [],
          writable: false,
          configurable: false
        });
      }
      Object.defineProperty(this, '$fetchComponents', {
        value: async function() {
          if (this.$root.$unknownComponents.length) {
            let unknown = this.$root.$unknownComponents.splice(0, this.$root.$unknownComponents.length);
            return await bbn.wc.fetchComponents(unknown);
          }

          return false;
        },
        writable: false,
        configurable: false
      });
      Object.defineProperty(this, '$addUnknownComponent', {
        value: function(name) {
          if ((name.indexOf('-') > 0) && !bbn.wc.known.includes(name) && !this.$root.$unknownComponents.includes(name)) {
            this.$root.$unknownComponents.push(name);
            return true;
            /*
            if (this.$root.$fetchTimeout) {
              clearTimeout(this.$root.$fetchTimeout);
            }
            this.$root.$fetchTimeout = setTimeout(() => {
              this.$root.$fetchComponents();
            }, 25);
            */
          }
          return false;
        },
        writable: false,
        configurable: false
      });
      /**
       * The highest component in the doocument's hierarchy
       */
      Object.defineProperty(this, '$attrMap', {
        value: bbn.fn.clone(this.$el.bbnMap || this.$el.constructor.bbnMap),
        writable: false,
        configurable: false
      });
      Object.defineProperty(this, '$currentMap', {
        configurable: true,
        writable: true,
        value: bbn.fn.clone(this.$el.bbnMap || this.$cls.bbnMap)
      });
      Object.defineProperty(this, '$currentResult', {
        configurable: false,
        writable: false,
        value: bbn.fn.createObject({_num: 0})
      });
      Object.defineProperty(this, '$schema', {
        configurable: false,
        writable: false,
        value: []
      });
      /**
       * The latest timestamp of the last update launch
       */
      Object.defineProperty(this, '$lastLaunch', {
        value: 0,
        writable: true
      });

      // Setting up the config
      const cfg = this.$cfg;
      // Setting up the namespace for the methods
      if (cfg.methods) {
        bbn.fn.each(Object.keys(cfg.methods), n => this.$addNamespace(n, 'method'));
      }
      // Setting up the namespace for the computed
      if (cfg.computed) {
        bbn.fn.each(Object.keys(cfg.computed), n => this.$addNamespace(n, 'computed'));
      }

      // Setting up data
      if (this.$cfg.data) {
        //bbn.fn.log("during setup data")
        // Proper to the specific private class: sets all the datasource
        this.$setDataSource(this.$cfg.data);
        // Setting up all the data properties
        this.$updateData();
      }

      // Generates the evaluator function, will happen only once
      if (!this.$el.bbnEval && !this.$el.constructor.bbnEval) {
        // The template is not a one-shot (it is defined in the constructor)
        if (!this.$el.bbnTpl) {
          // The function has never been generated for this component
          if (!this.$el.constructor.bbnEval) {
            // Generating
            const stFn = this.$templateToFunction(this.$el.constructor.bbnTpl);
            if (!stFn) {
              throw new Error(bbn._("Impossible to create the template evaluator"));
            }
            // Setting in component's constructor
            Object.defineProperty(this.$el.constructor, 'bbnEval', {
              value: eval(stFn),
              writable: false,
              configurable: false
            });
          }
        }
        // The template is a one-shot, bbnAnonymous
        else {
          // Generating
          const stFn = this.$templateToFunction(this.$el.bbnTpl);
          if (!stFn) {
            throw new Error(bbn._("Impossible to create the template evaluator"));
          }
          // Setting in component's property
          Object.defineProperty(this.$el, 'bbnEval', {
            value: eval(stFn),
            writable: false,
            configurable: false
          });
        }
      }

      // Setting $eval with the retrived/generated function
      Object.defineProperty(this, '$eval', {
        value: this.$el.bbnEval || this.$el.constructor.bbnEval,
        writable: false,
        configurable: false
      });


      
      // Sending created event
      const created = new Event('hook:created');
      this.$onCreated();
      this.$el.dispatchEvent(created);
      Object.defineProperty(this, '$isCreated', {
        value: true,
        writable: false, 
        configurable: false
      });

      // Sets the current template schema and creates the DOM
      this.$updateComponent().then(() => {
        // registering current object to parent and setting root
        if (this.$parent) {
          this.$parent.$registerChild(this);
        }

        //bbn.fn.log(`DOM CREATED for ${this.$options.name}`);
        // Sending beforeMount event
        const beforeMount = new Event('hook:beforemount');
        this.$onBeforeMount();
        this.$el.dispatchEvent(beforeMount);

        // $isInit, defined in constructor  is made writable before being set to true
        Object.defineProperty(this, '$isInit', {
          value: true,
          writable: false,
          configurable: true
        });

        // Sending mounted event
        const mounted = new Event('hook:mounted');
        this.$onMounted();
        this.$el.dispatchEvent(mounted);
        Object.defineProperty(this, '$isMounted', {
          value: true,
          writable: false, 
          configurable: false
        });

        setInterval(() => {
          this.$launchQueue();
        }, this.$tickDelay);
  
      });
    }
  });
})();
