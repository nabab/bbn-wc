(() => {
  /**
   * Shuts everything down
   * @returns 
   */
  Object.defineProperty(bbnComponentPrototype, '$disconnectedCallback', {
    writable: false,
    configurable: false,
    value: function() {
      //bbn.fn.log("Before disconnected callback from " + this.$el.tagName + ' / ' + this.$el.bbnSchema.id);
      if (!this.$el.isConnected) {
        //bbn.fn.log("Disconnected callback from " + this.$el.tagName);
        // Sending beforeDestroy event
        const beforeDestroy = new Event('beforedestroy');
        this.$onBeforeDestroy();
        this.$el.dispatchEvent(beforeDestroy);
        
        // Sending destroyed event through a timeout
        setTimeout(() => {
          const destroyed = new Event('destroyed');
          this.$onDestroyed();
          this.$el.dispatchEvent(destroyed);
        });
        // Deleting from elements prop
        bbn.wc.removeComponent(this.$el.bbnCid);
        this.$removeFromElements(this.$el.bbnId, this.$el.bbnHash);
        // Setting back $isinit
        Object.defineProperty(this, '$isInit', {
          value: false,
          writable: false,
          configurable: true
        });
      }
    }
  });
})();
