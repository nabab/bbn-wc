(() => {
  const bbnMethods = {
    
    $setDataSource(data) {
      this.$dataSource = data;
    },

    $setRef(ref, ele) {
      if (this.$refsElements[ref] && (this.$refsElements[ref] !== ele)) {
        if (!bbn.fn.isArray(this.$refsElements[ref])) {
          if (!this.$refsElements[ref].isConnected) {
            this.$refsElements[ref] = ele;
          }
          else {
            this.$refsElements[ref] = [this.$refsElements[ref]]
          }
        }
        if (bbn.fn.isArray(this.$refsElements[ref])) {
          this.$refsElements[ref].push(ele);
        }
      }
      else {
        this.$refsElements[ref] = ele;
      }
    },


    /**
    * Set the data properties of the object
    */
    $setData(name, value) {
      const cfg = this.$cfg;
      this.$dataValues[name] = value;
      if (this[name] === undefined) {
        const def = {
          get() {
            return this.$dataValues[name];
          },
          set(v) {
            let oldV = this.$dataValues[name];
            if (oldV !== v) {
              this.$dataValues[name] = v;
              if (this.$isInit) {
                if (this.$watcher?.[name]?.handler) {
                  if (!bbn.fn.isFunction(this.$watcher[name].handler)) {
                    bbn.fn.error(bbn._("Watchers must be function, wrnmg parameter for %s", name));
                  }

                  this.$watcher[name].value = v;
                  this.$watcher[name].handler.apply(this, [v, oldV]);
                }

                //bbn.fn.log("SETTING DATA " + name + " ON " + this.$options.name, this.$isBusy, this.$isCreating, this.$isUpdating)
                this.$tick();
              }
            }
          }
        };
        Object.defineProperty(this, name, def);
        this.$addNamespace(name, 'data');
      }

      if (this[name] !== value) {
        this[name] = value;
      }
    },

    $setUpProp(name, cfg) {
      const value = this.$checkPropValue(name, cfg);
      const isDefined = value !== undefined;
      this.$addNamespace(name, 'props');
      if (isDefined) {
        this.$realSetProp(name, value);
      }
    },


    /**
     * Set properties of the initial component to the new web-component
     */
    $setProp(name, value) {
      name = bbn.fn.camelize(name);
      const cfg = this.$cfg.props[name];
      if (!this.$acceptedAttributes.includes(name) && (name.indexOf('bbn') !== 0)) {
        bbn.fn.warning(`The attribute ${name} in ${this.$options.name} is not a property`);
        return;
      }

      if (!Object.hasOwn(this.$props, name)) {
        return;
      }

      //bbn.fn.log("SZETTING PROP", name, cfg, value)
      let v = this.$checkPropValue(name, cfg, value);
      this.$realSetProp(name, v);
    },

    /**
     * Update the data property with the dataSource Array
     */
    $updateData() {
      if (this.$isDataSet) {
        return;
      }

      if (this.$dataSource.length) {
        let tmp = bbn.fn.createObject(
          bbn.fn.extend({}, ...this.$dataSource.map(a => a.apply(this)))
        );
        bbn.fn.each(tmp, (v, n) => {
          this.$setData(n, v);
        })
      }

      this.$isDataSet = true;
    },

    $retrieveComponent(id, hash, index = -1, loopObj) {
      const ele = this.$retrieveElement(...arguments);
      return ele?.bbn || null;
    },

    $retrieveLoopObject(id, hash, index = -1) {
      return retrieve(id, hash, index, true);
    },

    /**
     * Register the given child of the component into the $children array
     */
    $registerChild(child) {
      bbn.fn.checkType(child, Object, "The child must be an object");
      this.$children.push(child);
      if (this.onRegisterChild) {
        this.onRegisterChild(child);
      }
    },

    /**
     * Unregister the given child of the component from the $children array
     */
    $unregisterChild(child) {
      let idx = this.$children.indexOf(child);
      if (idx > -1) {
        this.$children.splice(idx, 1);
      }
    },
    $_setInternalResult(_r, _name, _exp, _hash) {
      if (!_r[_name]) {
        _r[_name] = bbn.fn.createObject();
      }
      if (!_hash) {
        _hash = '_root';
      }
      // If not set it's new
      if (!_r[_name][_hash]) {
        _r[_name][_hash] = bbn.fn.createObject({
          state: 'NEW',
          value: _exp,
          elements: []
        });
        _r[_name][_hash].old = bbn.fn.hash(_r[_name][_hash].value);
      }
      // If it's a temporary value, we set it
      else if (_r[_name][_hash].state === 'TMP') {
        _r[_name][_hash].value = _exp;
        const _o = bbn.fn.hash(_r[_name][_hash].value);
        if (_r[_name][_hash].state === 'DEL') {
          _r[_name][_hash].state = 'NEW';
        }
        else if (_r[_name][_hash].old !== _o) {
          _r[_name][_hash].state = 'MOD';
        }
        else {
          _r[_name][_hash].state = 'OK';
        }

        _r[_name][_hash].old = _o;
      }
      return _r[_name][_hash].value;

    },
    $_getInternalState(_r, _name, _hash) {
      if (!_hash) {
        _hash = '_root';
      }
      if (!_r[_name]?.[_hash]) {
        bbn.fn.log("STATE", _r);
        bbn.fn.error(_name + '  ---  ' + _hash + ' are not defined in ' + this.$options.name);
      }
      return _r[_name][_hash].state;
    },
    $_getInternalValue(_r, _name, _hash) {
      if (!_hash) {
        _hash = '_root';
      }
      if (!_r[_name]?.[_hash]) {
        bbn.fn.log("VALUE", _r);
        bbn.fn.error(_name + '  --- ' + _hash + ' are not defined in ' + this.$options.name);
      }

      return _r[_name][_hash].value;
    }
  };

  for (let n in bbnMethods) {
    Object.defineProperty(window.bbnComponentPrototype, n, {
      writable: false,
      configurable: false,
      enumerable: true,
      value: bbnMethods[n]
    });
  }

})();
