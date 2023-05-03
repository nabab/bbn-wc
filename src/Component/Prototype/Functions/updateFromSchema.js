(() => {
  /**
   * Sets the props and attributes of the component element based on its combined schema
   * 
   * @returns {undefined}
   */
  Object.defineProperty(bbnComponentPrototype, '$updateFromSchema', {
    writable: false,
    configurable: false,
    value(props) {
      if (this.$el.bbnSchema) {
        //bbn.fn.warning("updateFromSchema " + this.$options.name);
        // The classes on the component itself are only generated once 
        // Concatenating classes from the attributes and from componentClass
        const cls = ['bbn-component'];
        if (this.componentClass) {
          cls.push(this.componentClass);
        }
        if (props?.class) {
          cls.push(props.class);
        }
        if (this.$el.bbnSchema.props?.class) {
          cls.push(this.$el.bbnSchema.props.class);
        }

        let textCls = bbn.wc.convertClasses(cls);

        if (this.$el.className !== textCls) {
          // Converting to string
          this.$el.className = textCls;
        }
        //bbn.fn.log("PUTTING CLASSES " + textCls);

        let stl = [this.$el.bbnSchema.props?.style || ''];
        stl.push(this.$attr.style || '');
        if (props?.style) {
          stl.push(props.style);
        }

        if ((props?.['bbn-show'] !== undefined)) {
          stl.push({display: props['bbn-show'] ? 'block' : 'none'});
        }

        stl = bbn.wc.convertStyles(stl);
        if (stl) {
          this.$el.style.cssText = bbn.wc.convertStyles(stl);
        }
        for (let n in props) {
          if (!['class', 'style'].includes(n)) {
            if (this.$el[n] !== undefined) {
              this.$el[n] = props[n];
            }
          }
        }
      }
    }
  })
})()