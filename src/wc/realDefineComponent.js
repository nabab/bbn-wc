(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * @method _realDefineComponent
     * @memberof bbn.wc
     * @param {String} name 
     * @param {Object} r
     * @param {Array} mixins
     */
    realDefineComponent(name, r, mixins){
      bbn.fn.warning("REAL DEFINE COMPONENT");
      bbn.fn.log(name, r, mixins);
      if ( r && r.script ){
        if ( r.css ){
          let el = document.createElement('style');
          el.innerHTML = r.css;
          document.head.insertAdjacentElement('beforeend', el)
        }
        let tpl = false;
        if ( r.content ){
          tpl = 'bbn-tpl-component-' + name;
          while (document.getElementById(tpl)) {
            tpl = bbn.fn.randomString();
          }
          let script = document.createElement('script');
          script.innerHTML = r.content;
          script.setAttribute('id', tpl);
          script.setAttribute('type', 'text/x-template');
          document.body.insertAdjacentElement('beforeend', script)
        }
        let data = r.data || {};
        let res;
        try {
          res = eval(r.script);
        }
        catch (e) {
          bbn.fn.log(r.script)
          throw new Error("Impossible to evaluate the content of tha component " + name);
        }
        if ( typeof res === 'object' ){
          if ( !res.mixins ){
            res.mixins = [];
          }
          if (!res.template && tpl){
            res.template = '#' + tpl;
          }
          if ( !res.props ){
            res.props = {};
          }
          if ( !res.props.source ){
            res.props.source = {};
          }
          if ( !res.name ){
            res.name = name;
          }
          if ( res.mixins && !bbn.fn.isArray(res.mixins) ){
            res.mixins = [res.mixins];
          }
          if ( mixins ){
            if ( !bbn.fn.isArray(mixins) ){
              mixins = [mixins];
            }
            if ( res.mixins ){
              bbn.fn.each(mixins, b => {
                res.mixins.push(b);
              })
            }
            else{
              res.mixins = mixins;
            }
          }
          let bits = res.name.split('-'),
              st = '';
          bbn.fn.each(bits, b => {
            st += (b + '-');
            let idx = bbn.fn.search(this.knownPrefixes, {prefix: st});
            if ( (idx > -1) && this.knownPrefixes[idx].mixins ){
              if ( bbn.fn.isArray(this.knownPrefixes[idx].mixins) ){
                bbn.fn.each(this.knownPrefixes[idx].mixins.reverse(), m => {
                  res.mixins.unshift(m)
                })
              }
              else{
                res.mixins.unshift(this.knownPrefixes[idx].mixins)
              }
            }
          });
          if ( Object.keys(data).length ){
            res.props.source.default = () => {
              return data;
            }
          }
          //bbn.fn.log(name, res);
          alert("This shouldn't be called")
          Vue.component(name, res);
          return true;
        }
      }
      return false;
    },
  })
})();
