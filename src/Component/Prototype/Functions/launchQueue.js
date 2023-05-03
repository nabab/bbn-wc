(() => {
  /**
   * Launches the updateComponent function and triggers the queue's functions.
   * 
   * @param {Boolean} force If true and the queue is empty, it will be filled with an empty array
   * @returns {undefined}
   */
  Object.defineProperty(bbnComponentPrototype, '$launchQueue', {
    writable: false,
    configurable: false,
    value: function(force) {
      if (force && !this.$queue.length) {
        this.$queue.push([]);
      }

      const time = bbn.fn.timestamp();
      if (this.$queue.length && (force || (time - this.$lastLaunch > this.$tickDelay))) {
        this.$lastLaunch = time;
        const last = this.$queue.shift();
        this.$updateComponent().then(() => {
          last.forEach(fn => fn.bind(this)());
        });
      }
    }
  });
})();
