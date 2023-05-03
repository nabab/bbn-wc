(() => {
  const sc = document.createElement('script');
  sc.setAttribute('type', 'text/javascript');
  sc.innerHTML = `
/**
 * Create the bbn component class which extends the HTMLElement class
 */
class bbnCellComponent extends HTMLTableCellElement
{

  constructor() {
    super();
    //this.attachShadow({ mode: "closed" });
    Object.defineProperty(this, 'bbnCid', {
      value: bbn.wc.createCid(),
      writable: false,
      configurable: false
    });
  }

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

window.bbnCellComponentPrototype = Object.create(bbnComponentPrototype);
`;
document.head.appendChild(sc);
})();