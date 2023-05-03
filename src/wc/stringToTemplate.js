(() => {
  /**
   * Create a new DOM parser and parse the given HTML string.
   * @return {HTMLElement}
   */
  const parser = new DOMParser();

  bbn.fn.autoExtend('wc', {
    /**
     * Transforms a HTML string into a template array
     * 
     * @param {String} str 
     * @returns {Array}
     */
    stringToTemplate(str, withMap) {
      const doc = parser.parseFromString(
        // There shouldn't be self-closing in the embedded HTML except if in template
        bbn.wc.removeSelfClosing(str),
        "text/html"
      );
      const errorNode = doc.querySelector("parsererror");

      // If the HTML string cannot be parsed, It throw an error
      if (errorNode) {
        throw new Error("Impossible to parse the template");
      }

      let num = 0;
      const map = bbn.fn.createObject();
      const res = Array.prototype.map.apply(
        Array.prototype.filter.apply(
          Array.from(doc.documentElement.querySelector('body').childNodes),
          [n => n.tagName && (n.tagName.toLowerCase() !== 'script')]
        ),
        [a => {
          const tmp = bbn.wc.analyzeElement(a, map, num.toString());
          num++;
          return tmp.res;
        }]
      );
      if (withMap) {
        return {
          res,
          map
        }
      }

      return res;
    }
  })
})();
