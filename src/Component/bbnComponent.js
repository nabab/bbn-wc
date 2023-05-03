(() => {
  const sc = document.createElement('script');
  sc.setAttribute('type', 'text/javascript');
  sc.innerHTML = `
/**
 * Create the bbn component class which extends the HTMLElement class
 */
class bbnComp extends HTMLElement
{
  connectedCallback() {
    return bbn.wc.connectedCallback(this);
  } 

  disconnectedCallback() {
    return bbn.wc.disconnectedCallback(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    return bbn.wc.attributeChangedCallback(this, name, oldValue, newValue);
  }

  bbnUpdate(newSchema) {
    return bbn.wc.bbnUpdate(this, newSchema);
  }
}


class bbnComponent extends bbnComp
{

  constructor() {
    super();
    //this.attachShadow({ mode: "closed" });
    Object.defineProperty(this, 'bbnCid', {
      value: bbn.wc.createCid(),
      writable: false,
      enumerable: false,
      configurable: false
    });
  }

}
`;
  document.head.appendChild(sc);
})();
