(() => {
  const Hooks = {
    /**
     * beforeCreate hooks execution
     */
     $onBeforeCreate() {
      if (this.$cfg.beforeCreate) {
        bbn.fn.each(this.$cfg.beforeCreate, fn => fn.apply(this));
      }
    },

    /**
     * created hooks execution
     */
    $onCreated() {
      if (this.$cfg.created) {
        bbn.fn.each(this.$cfg.created, fn => fn.apply(this));
      }
    },

    /**
     * beforeMount hooks execution
     */
    $onBeforeMount() {
      if (this.$cfg.beforeMount) {
        bbn.fn.each(this.$cfg.beforeMount, fn => fn.apply(this));
      }
    },

    /**
     * mounted hooks execution
     */
    $onMounted() {
      if (this.$cfg.mounted) {
        bbn.fn.each(this.$cfg.mounted, fn => fn.apply(this));
      }
    },

    /**
     * updated hooks execution
     */
    $onUpdated() {
      if (this.$cfg.updated) {
        bbn.fn.each(this.$cfg.updated, fn => fn.apply(this));
      }
    },

    /**
     * beforeDestroy hooks execution
     */
    $onBeforeDestroy() {
      if (this.$cfg.beforeDestroy) {
        bbn.fn.each(this.$cfg.beforeDestroy, fn => fn.apply(this));
      }
    },

    /**
     * destroyed hooks execution
     */
    $onDestroyed() {
      if (this.$cfg.destroyed) {
        bbn.fn.each(this.$cfg.destroyed, fn => fn.apply(this));
      }
    },
  };

  for (let n in Hooks) {
    Object.defineProperty(window.bbnComponentPrototype, n, {
      writable: false,
      configurable: false,
      enumerable: true,
      value: Hooks[n]
    });
  }

})();
