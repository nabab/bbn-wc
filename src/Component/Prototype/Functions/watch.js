(() => {
  /**
   * 
   * 
   * @param {Number} index The loop index if any
   * @returns {undefined}
   */
  Object.defineProperty(bbnComponentPrototype, '$watch', {
    writable: false,
    configurable: false,
    value: function(name, a) {
      if (this.$watcher) {
        const bits = name.split('.');
        const realName = bits.shift();
        const tmp = this.$watcher[realName] || bbn.fn.createObject();
        if (bits.length) {
          while (bits.length) {
            let n = bits.shift();
            if (!tmp.props) {
              tmp.props = bbn.fn.createObject();
            }
            tmp.props[n] = bbn.fn.createObject();
            if (!bits.length) {
              tmp.props[n].handler = bbn.fn.isFunction(a) ? a : a.handler;
              tmp.props[n].immediate = a.immediate || false;
              tmp.props[n].deep = a.deep || false;
              tmp.props[n].value = undefined;
            }
            else {
              tmp = tmp.props[n];
            }
          }
        }
        else {
          tmp.handler = bbn.fn.isFunction(a) ? a : a.handler;
          tmp.immediate = a.immediate || false;
          tmp.deep = a.deep || false;
          tmp.value = undefined;
        }

        if (!this.$watcher[name]) {
          this.$watcher[name] = tmp;
        }
      }
    }
  });
})();
