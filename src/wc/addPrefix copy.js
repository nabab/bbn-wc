(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * @method addPrefix
     * @memberof bbn.wc
     * @param {String} prefix 
     * @param {Function} handler
     * @param {Array} mixins
     */
    addPrefix(prefix, handler, mixins){
      if ( typeof prefix !== 'string' ){
        throw new Error("Prefix must be a string!");
        return;
      }
      if ( typeof handler !== 'function' ){
        throw new Error("Handler must be a function!");
        return;
      }
      if ( bbn.fn.substr(prefix, -1) !== '-' ){
        prefix += '-';
      }
      bbn.wc.knownPrefixes.push({
        prefix: prefix,
        handler: handler,
        mixins: mixins || []
      });
      // Ordering by length descending so going from more precise to less
      bbn.wc.knownPrefixes.sort((a, b) => {
        if (a.prefix.length > b.prefix.length) {
          return -1;
        }
        if (a.prefix.length < b.prefix.length) {
          return 1;
        }
        // a must be equal to b
        return 0;
      })
    }
  })
})();
