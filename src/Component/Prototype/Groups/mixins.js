(() => {
  const mixins = {
   /**
    * Return the function bbn._ for the strings' translation.
    * @method _
    * @return {Function}
    */
    _() {
      return bbn._(...arguments);
    },
    /**
    * Returns the given ref (will return $refs[name] or $refs[name][0])
    * @method getRef
    * @param {String} name
    * @fires bbn.wc.getRef
    * @return {Function}
    */
    getRef(name) {
      return bbn.fn.isArray(this.$refs[name]) ? this.$refs[name][0] : this.$refs[name];
    },
    /**
    * Checks if the component corresponds to the selector
    * @method is
    * @fires bbn.wc.is
    * @param {String} selector 
    * @return {Function}
    */
    is(selector) {
      return this.matches(selector);
    },
    /**
    * Returns the closest component matching the given selector
    * @method closest
    * @param {String} selector
    * @param {Boolean} checkEle
    * @return {Function}
    */
    closest(selector, checkEle) {
      let ele = checkEle ? this.$el : this.$el.parentNode;
      let letters = selector.split('');
      if (!['.', '#', '[', ':'].filter(c => letters.includes(c)).length) {
        selector += ',*[is=' + selector + ']';
      }

      while (ele instanceof HTMLElement) {
        if (ele.matches(selector)) {
          return ele.bbn || ele;
        }

        ele = ele.parentNode || null;
      }
    },
    /**
    * Returns an array of parent components until $root
    * @method ancestors
    * @param {String} selector
    * @param {Boolean} checkEle
    * @return {Function}
    */
    ancestors(selector, checkEle) {
      let res = [];
      let ele = checkEle ? this : this.parentNode;
      while (ele) {
        if (!selector || ele.matches(selector)) {
          res.push(ele);
        }

        ele = ele.parentNode || null;
      }

      return res;
    },
    /**
    * Fires the function bbn.wc.getChildByKey.
    * @method getChildByKey
    * @param {String} key
    * @param {String} selector
    * @return {Function}
    */
    getChildByKey(key, selector) {
      //to do?
    },
    /**
    * Fires the function bbn.wc.findByKey.
    * @method findByKey
    * @param {String} key
    * @param {String} selector
    * @param {Array} ar
    * @return {Function}
    */
    findByKey(key, selector, ar) {
      // to do?
    },
    /**
    * Fires the function bbn.wc.findAllByKey.
    * @method findAllByKey
    * @param {String} key
    * @param {String} selector
    * @return {Function}
    */
    findAllByKey(key, selector) {
      // to do?,
    },
    /**
    * Fires the function bbn.wc.find.
    * @method find
    * @param {String} selector
    * @param {Number} index
    * @return {Function}
    */
    find(selector, index) {
      const letters = selector.split('');
      if (!['.', '#', '[', ':'].filter(c => letters.includes(c)).length) {
        selector += ',*[is=' + selector + ']';
      }

      if (index) {
        selector += ':nth-of-type(' + index + ')';
      }

      return this.$el.querySelector(selector)?.bbn;
    },
    /**
    * Fires the function bbn.wc.findAll.
    * @method findAll
    * @param {String} selector 
    * @param {Boolean} only_children 
    * @return {Function}
    */
    findAll(selector, only_children) {
      const letters = selector.split('');
      if (!['.', '#', '[', ':'].filter(c => letters.includes(c)).length) {
        selector += ',*[is=' + selector + ']';
      }

      if (only_children) {
        let res = [];
        Array.from(this.childNodes).forEach(a => {
          if (a.tagName && a.matches(selector)) {
            res.push(a.bbn);
          }
        });
        return res;
      }

      return Array.from(this.$el.querySelectorAll(selector)).map(a => a.bbn);
    },
    /**
    * @method extend
    * @param {Boolean} selector
    * @param {Object} source The object to be extended
    * @param {Object} obj1
    * @return {Object}
    */
    extend(deep, src, obj1) {
      // to do?
    },
    /**
    * Fires the function bbn.wc.getComponents.
    * @method getComponents
    * @param {Array} ar 
    * @param {Boolean} only_children 
    * @return {Function}
    */
    getComponents(ar, only_children) {
      if (only_children) {
        return Array.from(this.childNodes).filter(a => !!a._bbn);
      }
      else {
        return this.querySelectAll('*').filter(a => !!a._bbn);
      }
    },
    /**
     * Returns a component name based on the name of the given component and a path.
     * @method getComponentName
     * @memberof bbn.wc
     */
    getComponentName() {
      return this.$options.name;
    },
  };

  for (let n in mixins) {
    Object.defineProperty(window.bbnComponentPrototype, n, {
      writable: false,
      configurable: false,
      enumerable: true,
      value: mixins[n]
    });
  }

})();
