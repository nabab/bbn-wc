(() => {
  const internals = {
    /**
     * Add delay before another function call
     */
    $tick() {
      return new Promise(resolve => {
        if (!this.$queue.length) {
          this.$queue.push([]);
        }

        this.$queue[0].push(resolve);
      });
    },

    /**
     * Check if there is no conflict between attributes/methods and
     * add list all the public methods and attributes that can be used by the component
     * @param name
     * @param type
     */
    $addNamespace(name, type) {
      if (!type) {
        bbn.fn.error(bbn._(`Type must be defined for ${name}`));
      }

      if (this.$namespaces[name] && (this.$namespaces[name] !== type)) {
        bbn.fn.log(
          "Component name: " + this.$options.name,
          "Prop name: " + this[name],
          this.$namespaces
        );
        bbn.fn.error(`The name ${name} in ${type} is already used by ${this.$namespaces[name]} in ${this.$options.name}`);
      }

      this.$namespaces[name] = type;
    },

    $realSetProp(name, value) {
      const original = this[name];
      if (original !== value) {
        Object.defineProperty(this, name, {
          value: value,
          writable: false,
          configurable: true
        });
        if (this.$isInit && this.$cfg?.watch?.[name]) {
          this.$watcher[name].handler.apply(this, [value, original]);
        }

        Object.defineProperty(this.$props, name, {
          value: value,
          writable: false,
          configurable: true
        });
        if (this.$isMounted) {
          this.$emit('propchange', name, value, original);
          this.$tick();
        }
      }
    },
    $checkPropValue(name, cfg, value) {
      if (!cfg) {
        cfg = this.$cfg.props[name];
      }
      let isDefined = Object.hasOwn(this.$options.propsData, name);
      let v = undefined;
      if (value !== undefined) {
        v = value;
        isDefined = true;
      }
      else if (isDefined) {
        v = this.$options.propsData[name];
      }
      if (!isDefined && (cfg.default !== undefined)) {
        if (bbn.fn.isObject(cfg.default) || bbn.fn.isArray(cfg.default)) {
          bbn.fn.error(bbn._("A function must be used to return object default values in %s", name));
        }

        v = bbn.fn.isFunction(cfg.default) ? cfg.default() : cfg.default;
        isDefined = true;
      }

      if (cfg.required && (!isDefined || [null, undefined, ''].includes(v))) {
        bbn.fn.error(bbn._("The property %s is required in component %s", name, this.$options.name));
      }

      if (cfg.type && isDefined && ![null, undefined, ''].includes(v)) {
        bbn.fn.checkType(v, cfg.type, bbn._("Wrong type for %s in component %s", name, this.$options.name));
      }

      if (isDefined && bbn.fn.isFunction(cfg.validator) && !cfg.validator(v)) {
        bbn.fn.error(bbn._("The property %s is invalid", name));
      }

      return v;

    }
  };


  for (let n in internals) {
    Object.defineProperty(window.bbnComponentPrototype, n, {
      writable: false,
      configurable: false,
      enumerable: true,
      value: internals[n]
    });
  }
})();
