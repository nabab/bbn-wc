(() => {
  window.bbnAnonymousPrototype = Object.create(bbnComponentPrototype);
  Object.defineProperty(window.bbnAnonymousPrototype, '$connectedCallback', {
    writable: false,
    configurable: false,
    value: function() {

      if (!this.$el.bbnTpl) {
        this.$el.bbnTpl = bbnAnonymous.bbnTpl;
        const tpl = this.$el.innerHTML.trim();
        if (tpl) {
          this.$el.bbnTpl.slots = tpl;
        }
      }
      //this.$el.bbnSlots = bbn.wc.retrieveSlots(bbnAnonymous.bbnTpl);
      //this.$el.bbnModels = bbn.wc.retrieveModels(this.$el.bbnTpl);
      const cfg = this.$cfg;
      if (cfg.components) {
        for (let n in cfg.components) {
          //bbn.fn.log("DEFINING COMPONENT", n, cfg.components[n], cfg.components[n].template);
          bbn.wc.define(cfg.componentNames[n], cfg.components[n], cfg.components[n].template);
          this.$options.components[n] = cfg.components[n];
        }
      }

      if (cfg && cfg.computed) {
        bbn.fn.iterate(cfg.computed, (computed, name) => {
          if (name.substr(0, 1) === '$') {
            throw new Error(bbn._("Properties starting with the dollar sign are reserved"));
          }

          if (!this.$isDataSet) {
            return undefined;
          }

          if (!Object.hasOwn(this.$computed, name)) {
            const def = {
              get() {
                const r = computed.get.apply(this);
                if (r !== this.$computed[name]?.val) {
                  const myHash = bbn.fn.isObject(r) ? bbn.fn.md5(r) : r;
                  if (!Object.hasOwn(this.$computed, name)) {
                    this.$computed[name] = bbn.fn.createObject({
                      old: myHash,
                      val: r
                    });
                  }
                  else if (!bbn.fn.isSame(myHash, this.$computed[name].old)) {
                    const oldValue = this.$computed[name].val;
                    this.$computed[name].val = r;
                    this.$computed[name].old = myHash;
                    if (this.$watcher?.[name]) {
                      this.$watcher[name].value = r;
                      this.$watcher[name].handler.call(this, r, oldValue);
                    }
                  }
                }

                return r;
              } 
            };
            if (computed.set) {
              def.set = computed.set;
            }
            Object.defineProperty(this, name, def);
          }
          if (this[name] === undefined) {
          }
        });
      }

      if (cfg && cfg.methods) {
        bbn.fn.iterate(cfg.methods, (fn, name) => {
          if (name.substr(0, 1) === '$') {
            throw new Error(bbn._("Properties starting with the dollar sign are reserved"));
          }

          if (this[name] === undefined) {
            Object.defineProperty(this, name, {
              writable: false,
              configurable: false,
              value: fn
            });
          }
        });
      }

      bbnComponentPrototype.$connectedCallback.apply(this);
    }
  });
  Object.defineProperty(window.bbnAnonymousPrototype, '$setUpProps', {
    writable: false,
    configurable: false,
    value: function() {
      bbn.fn.each(this.$cfg.props, (prop, name) => {
        this.$setUpProp(name, prop);
      });
      if (!this.$cfg.props.source) {
        this.$cfg.props.source = {
          type: [String, Object, Array],
        };
      }
      /*
      this.$setUpProp("bbnCfg", {
        type: [Object],
      });
      this.$setUpProp("bbnTpl", {
        type: [Array],
        default() {
          return bbn.wc.stringToTemplate('<slot/>');
        }
      });
      this.$setUpProp("bbnCls", {
        type: [Object],
        default() {
          return bbnAnonymous;
        }
      });
      this.$setUpProp("bbnFn", {
        type: [Function],
        default() {
          return bbnAnonymousCreator;
        }
      });
      this.$setUpProp("bbnMap", {
        type: [Array],
        default() {
          return bbn.wc.mapTemplate(this.$tpl);
        }
      });
      */
      this.$setUpProp("source", {
        type: [String, Object, Array],
      });
    }
  });

  Object.defineProperty(window.bbnAnonymousPrototype, "$acceptedAttributes", {
    value: ['bbn-cfg', 'bbn-tpl', 'bbn-map', 'bbn-cls', 'bbn-fn', 'is', 'source', 'ref', 'key', 'index'],
    configurable: false,
    writable: false
  });



  window.bbnAnonymousCreator = function(ele) {
    const a = Object.create(bbnAnonymousPrototype);
    Object.defineProperty(a, '$options', {
      value: {
        name: 'bbn-anonymous',
        components: bbn.fn.createObject(),
        _componentTag: 'bbn-anonymous',
        get propsData() {
          if (a.$el) {
            return a.$el.bbnSchema?.props || {};
          }

          return {};
        }
      },
      writable: true,
      configurable: true
    });
    bbnComponentPrototype.$init.call(a, ele);
    return a;
  };
  window.bbnAnonymousCreator.name = 'bbnAnonymous';

  Object.defineProperty(window.bbnAnonymousPrototype, 'constructor', {
    writable: false,
    configurable: false,
    value: window.bbnAnonymousCreator
  });

})();
