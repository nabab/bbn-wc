(() => {
  const vueMethods = {
    /**
     * Sets the given property on the given object using static method
     * @param {Object} obj 
     * @param {String} prop 
     * @param {*} value 
     * @param {Boolean} writable 
     * @param {Boolean} configurable 
     * @returns 
     */
    $set(obj, prop, value, writable = true, configurable = true) {
      Object.defineProperty(obj, prop, {
        value,
        writable,
        configurable
      });
      return this;
    },


    /**
     * Gets the given property from the given object using static method
     * @param {*} obj 
     * @param {*} prop 
     * @returns 
     */
    $get(obj, prop) {
      return obj[prop];
    },


    /**
     * Deletes the given property from the given object using static method
     * @param {*} obj 
     * @param {*} prop 
     * @returns 
     */
    $delete(obj, prop) {
      return delete obj[prop];
    },


    $nextTick(fn) {
      return new Promise((resolve) => {
        if (!this.$queue.length) {
          this.$queue.push([]);
        }

        this.$queue[0].push(fn || resolve);
      });
    },

    /**
     * Emits a new event with variable arguments
     */
     $emit(eventName, ...args) {
      const option = {
        detail: {
          args: args
        }
      }
      const ev = new CustomEvent(eventName, option);
      this.$el.dispatchEvent(ev);
      //bbn.fn.log("EVENT EMITTED " + eventName);
    },

    /**
     * Sets an event listener for the given event with the given handler on the component's element
     * @param {String} event 
     * @param {Function} handler 
     */
    $on(event, handler, remove, bound) {
      bbn.fn.checkType(event, String);
      bbn.fn.checkType(handler, Function);
      const hash = bbn.fn.md5(event + '-' + handler.toString());
      if (!this.$events[event]) {
        this.$events[event] = bbn.fn.createObject();
      }
      this.$events[event][hash] = (ev) => {
        const args = [];
        if (ev.detail?.args) {
          args.push(...ev.detail.args);
        }
        else {
          args.push(ev);
        }

        handler.bind(bound || this)(...args);
        if (remove) {
          this.$off(event, handler);
        }
      }
      this.$el.addEventListener(event, this.$events[event][hash]);
    },

    /**
     * Removes an event listener on the element set with $on
     * @param {String} event 
     * @param {Function} handler 
     */
    $off(event, handler) {
      bbn.fn.checkType(event, String);
      bbn.fn.checkType(handler, Function);
      const hash = bbn.fn.md5(event + '-' + handler.toString());
      if (this.$events[event]?.[hash]) {
        this.$el.removeEventListener(event, this.$events[event][hash]);
        delete this.$events[event][hash];
      }
    },

    /**
     * Sets an event listener for the given event with the given handler on the component's element
     * @param {String} event 
     * @param {Function} handler 
     */
    $once(event, handler) {
      this.$on(event, handler, true);
    },

    /**
     * Forcing executing tick (updateComponent) function by setting this.$tickLast to 0
     */
    $forceUpdate() {
      this.$launchQueue(true);
    },

    /**
     * @todo!
     */
    $destroy() {

    },

  }

  for (let n in vueMethods) {
    Object.defineProperty(window.bbnComponentPrototype, n, {
      writable: false,
      configurable: false,
      enumerable: true,
      value: vueMethods[n]
    });
  }
})();
  