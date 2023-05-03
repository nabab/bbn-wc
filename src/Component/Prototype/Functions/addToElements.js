(() => {
  /**
   * Adds or updates the given element to the $elements object property
   * 
   * @param {Symbol} id The ID of the element, based on the template
   * @param {HTMLElement, Text} ele The HTML element to be added
   * @param {String} hash The loop hash if any
   * @param {Number} index The loop index if any
   * @returns {undefined}
   */
  Object.defineProperty(bbnComponentPrototype, '$addToElements', {
    writable: false,
    configurable: false,
    value: function(id, ele, hash, index) {
      bbn.fn.checkType(id, ['string', 'symbol'], "In addToElements the ID should be a symbol");
      bbn.fn.checkType(ele, [HTMLElement, Text, Comment], "Elements should be HTML elements or text nodes");

      if (hash) {
        if (!this.$elements[id]) {
          this.$elements[id] = bbn.fn.createObject();
        }

        if (this.$elements[id][hash] !== ele) {
          this.$elements[id][hash] = ele;
        }
      }
      else {
        this.$elements[id] = ele;
      }
    }
  });
})();
