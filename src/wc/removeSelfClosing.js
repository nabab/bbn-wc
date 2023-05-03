(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * Remove the self closing tags and return an HTML string
     * @return {String}
     */
    removeSelfClosing(html) {
      const rxhtmlTag = new RegExp('<([A-z0-9-_]+)((([^>"]+"[^"]*")*)|([ˆ>]*))\\s*/>', 'gm');
      return html.replace(rxhtmlTag, "<$1$2></$1>");
    },
  })
})();
