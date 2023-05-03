(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * Convert the classes into a string
     */
    convertClasses() {
      let arr = [];
      for (let i = 0; i < arguments.length; i++) {
        let css = arguments[i];
        if (!css) {
          continue;
        }

        if (bbn.fn.isString(css)) {
          arr.push(...css.split(' '));
        }
        else if (bbn.fn.isObject(css)) {
          for (let n in css) {
            if (css[n]) {
              arr.push(n);
            }
          }
        }
        else if (bbn.fn.isArray(css)) {
          bbn.fn.each(css, cs => arr.push(...bbn.wc.convertClasses(cs).split(' ')));
        }
        else {
          bbn.fn.log(css);
          throw new Error(bbn._("Can't understand classes"));
        }
      }

      return bbn.fn.removeEmpty(bbn.fn.unique(arr)).join(' ');
    },
  })
})();
