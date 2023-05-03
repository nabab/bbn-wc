(() => {
  Object.defineProperty(bbnComponentPrototype, '$retrieveElement', {
    writable: false,
    configurable: false,
    value: function(id, hash, index = -1, loopObj) {
      let res = this.$elements[id] || null;
      if (res && hash) {
        return res[hash] || null;
      }
  
      return res;
    }
  });
})();
