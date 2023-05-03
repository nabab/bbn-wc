(() => {
  window.cdnUrl = window.location.hostname.indexOf('local.bbn.io') > 0 ? 
  "https://cdn-dev-local.bbn.io/"
  : "https://cdn-test.bbn.io/";

  const possibleAttributes = ['is', 'source', 'ref', 'slot', 'id', 'class', 'style', 'key'];

  bbn.fn.autoExtend('wc', {
    mixins: bbn.fn.createObject(),
    defaults: bbn.fn.createObject(),
    version: 1,
    known: [],
    /** @var {Array} directives List of existing directives */
    directives: bbn.fn.createObject(),
    conditionalExp: ['bbn-if', 'bbn-elseif', 'bbn-else'],
    hooks: [
      'beforeCreate',
      'created',
      'updated',
      'beforeMount',
      'mounted',
      'beforeDestroy',
      'destroyed'
    ],
    tagExtensions: {
      'button': 'bbnButtonComponent',
      'form': 'bbnFormComponent',
      'ul': 'bbnListComponent',
      'li': 'bbnElementComponent'
    },
    knownPrefixes: [],
    queue: [],
    queueTimer: null,
    loadDelay: 100,
    possibleAttributes,
    forbidden: ['bbn-forget', 'bbn-for', 'bbn-if', 'bbn-elseif', 'bbn-else'],
    /** @var {Object} components All the components in the DOM are referenced in this object through their CID */
    componentsIndex: new Map(),

    /**
     * Creates a unique ID for a component
     */
    createCid() {
      let cid = 'bbncp-' + bbn.fn.randomString(24, 32).toLowerCase();
      while (this.componentsIndex.has(cid)) {
        cid = 'bbncp-' + bbn.fn.randomString(24, 32).toLowerCase();
      }

      return cid;
    },
    /**
     * Adds a new component to the static global #components property
     */
    addComponent(ele) {
      const cid = ele.bbnCid;
      if (!cid) {
        throw new Error("The component doesn't have a component ID")
      }

      const cp = this.componentsIndex.get(cid);
      if (cp) {
        if (cp !== ele) {
          bbn.fn.log(ele, cp);
          throw new Error("The component already exists")
        }
      }
      else {
        this.componentsIndex.set(cid, ele);
      }
    },

    removeComponent(cid) {
      if (!cid) {
        throw new Error("The component doesn't have a component ID")
      }
      const cp = this.componentsIndex.get(cid);
      if (!cp) {
        throw new Error("The component already exists")
      }

      this.componentsIndex.delete(cid);
    },

    /**
     * Retrieves a component in the document based on its id.
     * Every instance of bbnComponentObject is registered through its
     * unique ID in the static #components property
     * @param {Symbol} id 
     * @returns 
     */
    getComponent(id) {
      return this.componentsIndex.get(id) || null;
    },

    connectedCallback(cp) {
      if (cp.bbnId && !cp.bbn) {
        cp.bbn = cp.constructor.bbnFn(cp);
        cp.bbn.$connectedCallback();
      }
    },
  
    disconnectedCallback(cp) {
      cp.bbn.$disconnectedCallback()
      delete cp.bbn;
    },
  
    attributeChangedCallback(cp, name, oldValue, newValue) {
      if ((oldValue !== newValue) && cp.bbn) {
        cp.bbn.$attributeChange(name, oldValue, newValue);
      }
    },
  
    /**
     * Updates the outer schema (with props and slots) of the component and ticks
     * @param {Array} newSchema 
     */
    bbnUpdate(cp, newSchema) {
      cp.bbnSchema = newSchema;
      if (cp.bbn && cp.bbn.$isMounted && (!cp.bbnSchema.changes || cp.bbnSchema.changes.length)) {
        bbn.fn.log("FROM BBN UPDATE")
        cp.bbn.$tick();
      }
    },
    /**
     * Inserts the given directives to the target element
     * @param {Object} directives
     * @param {HTMLElement} target
     */
    insertDirectives(directives, target) {
      if (bbn.fn.isObject(directives)
        && Object.keys(directives).length
      ) {
        bbn.fn.iterate(directives, (dir, name) => {
          // Check if the directive has not already been initialized on target element
          if (!dir.inserted) {
            // Check if the "inserted" function exists on this directive
            if (bbn.fn.isFunction(bbn.wc.directives[name].inserted)) {
              // Set the directive as initialized
              dir.inserted = true;
              // Initialize the directive
              bbn.wc.directives[name].inserted(target, dir);
            }
          }
        });
      }
    },
    /**
     * Updates the given directives to the target element
     * @param {Object} directives
     * @param {HTMLElement} target
     */
    updateDirectives(directives, target) {
      if (bbn.fn.isObject(directives)
        && Object.keys(directives).length
      ) {
        bbn.fn.iterate(directives, (dir, name) => {
          // Check if the "updated" function exists on this directive
          if (bbn.fn.isFunction(bbn.wc.directives[name].update)
            // Check if the value of the directive has changed
            && !bbn.fn.isSame(dir.value, dir.oldValue)
          ) {
            // Set the "lastUpdate" property
            dir.lastUpdate = bbn.fn.dateSQL();
            // Call the "updated" function of the directive
            bbn.wc.directives[name].update(target, dir);
          }
        })
      }
    },

    isComponent(node) {
      if (!node) {
        return false;
      }

      // HTMLElement
      if (node.bbnId) {
        if ((node.getAttribute("is") || node.tagName || '').indexOf('-') > 0) {
          return true;
        }

        return false;
      }

      // Node object
      if (node.props?.is) {
        if (bbn.fn.isObject(node.props.is)) {
          return true;
        }

        return node.props.is.indexOf('-') > -1;
      }

      if (node.attr?.is?.value) {
        return node.attr.is.value.indexOf('-') > -1;
      }

      if (node.tag) {
        return node.tag.indexOf('-') > -1;
      }

      return false;
    },

    isTag(tag, ele) {
      bbn.fn.checkType(tag, 'string');
      bbn.fn.checkType(ele, HTMLElement);
      if (ele.tagName.toLowerCase() === tag) {
        return true;
      }

      if (ele.getAttribute("is") === tag) {
        return true;
      }

      return false;
    },

    /**
     * Sets default object for a component, accessible through bbn.vue.defaults[cpName].
     * 
     * @method initDefaults
     * @memberof bbn.vue
     * @param Object defaults 
     * @param String cpName 
     */
    initDefaults(defaults){
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent for defaults is not an object");
      }
      bbn.fn.extend(true, bbn.wc.defaults, defaults);
    },

    /**
     * @method setDefaults
     * @memberof bbn.vue
     * @param {Object} defaults 
     * @param {String} cpName
     */
    setDefaults(defaults, cpName){
      if ( typeof defaults !== 'object' ){
        throw new Error("The default object sent is not an object " + cpName);
      }
      bbn.wc.defaults[cpName] = bbn.fn.extend(bbn.wc.defaults[cpName] || {}, defaults);
    },

  
  });
})();  
