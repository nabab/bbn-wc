(() => {
  const sc = document.createElement('script');
  sc.setAttribute('type', 'text/javascript');
  sc.innerHTML = `
class bbnAnonymous extends bbnComp
{
  bbnCid;

  constructor() {
    super();
    Object.defineProperty(this, 'bbnCid', {
      value: bbn.wc.createCid(),
      writable: false,
      configurable: false
    });
  }

  static bbnTpl = bbn.wc.stringToTemplate('<slot/>');

  static bbnCfg = bbn.wc.normalizeComponent({
    mixins: [bbn.wc.mixins.basic],
    props: {
      is: {
        type: [String, Object],
        default: 'div'
      }
    }
  }, 'bbnAnonymousSub' + this.bbnCid);

  static get bbnCls() {
    return bbnAnonymousPrivate;
  }

  static get bbnFn() {
    return bbnAnonymousCreator;
  }

}

// Adding the newly defined component to the known array
bbn.wc.known.push('bbn-anonymous');
// Assigning the public class to the component's tag
customElements.define('bbn-anonymous', bbnAnonymous);
`;
  document.head.appendChild(sc);
})();
