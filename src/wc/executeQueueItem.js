(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * @method executeQueueItem
     * @memberof bbn.wc
     * @param {Object} item
     */
    executeQueueItem(item){
      if (item.url) {
        return axios.get(item.url, {responseType:'json'}).then(r => {
          if (r.data) {
            r = r.data;
            const fnName = bbn.fn.camelize(item.name) + 'Creator';
            if (this.realDefineComponent(item.name, r, item.mixins) && window[fnName]) {
              item.resolve(window[fnName]);
              return;
            }
          }

          item.reject();
        })
      }
      return false;
    },
  })
})();
