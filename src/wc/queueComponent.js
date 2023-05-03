(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * @method queueComponent
     * @memberof bbn.wc
     * @param {String} name 
     * @param {String} url
     * @param {Array} mixins
     * @param {Function} resolve
     * @param {Function} reject
     */
    queueComponent(name, url, mixins, resolve, reject){
      bbn.fn.warning("queueComponent " + name + " " + url);
      clearTimeout(this.queueTimer);
      let def = false;//this.getStorageComponent(name);
      if ( def ){
        this._realDefineComponent(name, def, mixins);
        this.queueTimer = setTimeout(() => {
          resolve(true)
          return true;
        })
      }
      else{
        this.queue.push({
          name: name,
          url: url,
          mixins: mixins,
          resolve: resolve,
          reject: reject
        });
        this.queueTimer = setTimeout(() => {
          let todo = this.queue.splice(0, this.queue.length);
          this.executeQueueItems(todo);
          /*
          bbn.fn.log("TODO", todo);
          bbn.fn.each(todo, (a, i) => {
            this.executeQueueItem(a);
          });
          */
        }, this.loadDelay)
      }
      return this.queueTimer
    }
  });
})();
