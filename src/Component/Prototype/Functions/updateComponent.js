(() => {
  /**
   * (Re)generates the whole component's vDOM and DOM if needed, picking the right root, shadow or not
   * - Updates the component element based on its own schema ($el.bbnSchema)
   * - Updates the schema
   * - Generates/update the DOM when needed
   * 
   * @param {Boolean} shadow The content will go to the shadow DOM if true
   * @returns {Promise}
   */
  Object.defineProperty(bbnComponentPrototype, '$updateComponent', {
    writable: false,
    configurable: false,
    value: async function(shadow) {
      if (this.$isUpdating === null) {
        Object.defineProperty(this, '$isCreating', {
          writable: false,
          configurable: true,
          value: true
        });
      }
      else if (this.$isUpdating) {
        bbn.fn.warning(`The component ${this.$options.name} is already updating`);
        return;
      }
      else {
        this.$isUpdating = true;
      }

      //bbn.fn.warning(`Launching ${this.$options.name}`);
      // The HTML component's root in the DOM
      let root = this.$el;
      if (shadow) {
        root = this.$el.attachShadow({ mode: "open" });
      }

      // Biggest part of the job: updating the schema
      bbn.fn.iterate(this.$el.bbnSchema.props, (p, n) => {
        if (bbn.fn.isString(p)) {
          if (['class', 'style'].includes(n)) {
            return;
          }

          const isAttr = this.$el[n] !== undefined;
          if (isAttr && !Object.hasOwn(this.$props, n)) {
            const attr = this.$el[n];
            if (attr !== p) {
              this.$el.setAttribute(n, p);
            }
          }
        }
        this.$setProp(n, p);
      });
      const t1 = (new Date()).getTime();
      const e = await this.$eval(this);
      const t2 = (new Date()).getTime();
      //bbn.fn.warning(`Result length for ${this.$options.name}: ${t2 - t1}`);
      this.$numBuild++;
      if (this.$isCreating) {
        this.$emit('domcreated');
        Object.defineProperty(this, '$isCreating', {
          writable: false,
          configurable: false,
          value: false
        });
      }

      this.$isUpdating = false;
    }
  });
})();
