(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * Check the config of the component (mixins, computed, props, ect...) if everything is valid
     * and add them to their respective namespaces
     */
    normalizeComponent(cfg, clsName) {
      if (!bbn.fn.isObject(cfg)) {
        bbn.fn.log(cfg, clsName);
        bbn.fn.error("Components definition must be objects");
      }

      const res = {
        props: bbn.fn.createObject(),
        data: [],
        computed: bbn.fn.createObject(),
        methods: bbn.fn.createObject(),
        watch: bbn.fn.createObject(),
        components: bbn.fn.createObject(),
        componentNames: bbn.fn.createObject(),
        extension: null,
        static: null
      };

      if (cfg.mixins) {
        bbn.fn.log("MIXINS", cfg);
        bbn.fn.checkType(cfg.mixins, 'array');
        cfg.mixins.forEach(mixin => {
          bbn.fn.checkType(mixin, 'object');
          let cp = bbn.wc.normalizeComponent(mixin);
          bbn.fn.each(Object.keys(cp).sort(), name => {
            if ((bbn.fn.isObject(cp[name]) && bbn.fn.numProperties(cp[name])) || (bbn.fn.isArray(cp[name]) && cp[name].length)) {
              if ((name === 'data') || bbn.wc.hooks.includes(name)) {
                if (!res[name]) {
                  res[name] = [];
                }

                res[name].push(...cp[name]);
              }
              else {
                if (!res[name]) {
                  res[name] = bbn.fn.createObject();
                }

                Object.assign(res[name], cp[name]);
              }
            }
          });
        });
      }

      bbn.fn.each(Object.keys(cfg).sort(), name => {
        switch (name) {
          case 'props':
            let props = bbn.fn.clone(cfg.props);
            if (bbn.fn.isArray(props)) {
              let tmp = props;
              props = bbn.fn.createObject();
              tmp.forEach(a => {
                props[a] = bbn.fn.createObject();
              })
            }

            bbn.fn.checkType(props, 'object');
            for (let propName in props) {
              if (bbn.fn.isArray(props[propName]) || bbn.fn.isFunction(props[propName])) {
                props[propName] = {
                  type: props[propName]
                };
              }
              bbn.fn.checkType(props[propName], 'object', `The prop ${propName} for ${clsName} is a ${typeof props[propName]}`);
              if (props[propName].type && !bbn.fn.isArray(props[propName].type)) {
                props[propName].type = [props[propName].type];
              }

              res.props[propName] = props[propName];
            }

            break;

          case 'data':
            if (!bbn.fn.isArray(cfg[name])) {
              cfg[name] = [cfg[name]];
            }
            bbn.fn.each(cfg[name], (cf, i) => {
              if (!bbn.fn.isFunction(cf)) {
                bbn.fn.checkType(cf, 'object');
                let tmp = cf;
                cfg[name][i] = function() {
                  return tmp;
                };
              }

              bbn.fn.checkType(cf, 'function');
              res[name].push(cf);
            })
            break;

          case 'computed':
            bbn.fn.checkType(cfg.computed, 'object');
            for (let computedName in cfg.computed) {
              if ((typeof(cfg.computed[computedName]) !== 'function') && !cfg.computed[computedName]?.get) {
                throw new Error(bbn._("The computed must be a single function or an object with at least a get function (check %s)", computedName));
              }

              res.computed[computedName] = {
                get: cfg.computed[computedName].get || cfg.computed[computedName],
                set: cfg.computed[computedName].set || null
              };
            }

            break;

          case 'methods':
            bbn.fn.checkType(cfg[name], 'object');
            for (let methName in cfg[name]) {
              bbn.fn.checkType(cfg[name][methName], 'function');
              res[name][methName] = cfg[name][methName];
            }

            break;

          case 'watch':
            bbn.fn.checkType(cfg.watch, 'object');
            for (let watchName in cfg.watch) {
              const tmp = cfg.watch[watchName];
              bbn.fn.checkType(tmp?.handler || tmp, 'function');
              res.watch[watchName] = tmp;
            }

            break;

          case 'components':
            bbn.fn.checkType(cfg.components, 'object');
            for (let componentName in cfg.components) {
              bbn.fn.checkType(cfg.components[componentName], 'object');
              res.components[componentName] = bbn.wc.normalizeComponent(cfg.components[componentName], clsName);
              let subName = (clsName || 'bbnsub-' + bbn.fn.randomString(10, 20, 'nl')) + bbn.fn.substr(componentName, 0, 1).toUpperCase() + bbn.fn.camelize(bbn.fn.substr(componentName, 1));
              let subTag = bbn.fn.camelToCss(subName);
              res.componentNames[componentName] = subTag;
            }

            break;

          case 'extension':
            if (cfg.extension) {
              bbn.fn.checkType(cfg.extension, 'object');
              res.extension = cfg.extension;
            }
            break;

          case 'render':
            bbn.fn.checkType(cfg.render, 'function');
            res.render = cfg.render;
            break;

          case 'template':
            bbn.fn.checkType(cfg.template, 'string');
            res.template = cfg.template;
            break;

          case 'static':
            if (cfg.static) {
              bbn.fn.checkType(cfg.static, ['object', 'function']);
              res.static = cfg.static;
            }
            break;

          /** 
           * @todo Add the possibility to change the tag using Customized built-in elements 
           * See createElement
           */
          case 'tag':
            if (cfg.tag) {
              bbn.fn.checkType(cfg.tag, 'string');
              res.tag = cfg.tag;
            }
            break;

          default:
            if (bbn.wc.hooks.includes(name)) {
              bbn.fn.checkType(cfg[name], 'function');
              //bbn.fn.each(cfg[name], fn => bbn.fn.checkType(fn, 'function'));
              if (!res[name]) {
                res[name] = [];
              }

              res[name].push(cfg[name]);
            }
            else if (!["mixins", "componentNames", "name"].includes(name)) {
              throw new Error(`Unrecognize index ${name} in the config object`)
            }

        }
      });

      if (clsName === 'bbnContainer') {
        bbn.fn.log("CONTAINER", res.props);
      }


      return res;
    }
  })
})();
