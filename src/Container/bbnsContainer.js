class bbnsContainer extends HTMLElement
{
  bbnCid;
  bbnId;
  constructor() {
    super();
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

// Adding the newly defined component to the known array
bbn.wc.known.push('bbns-container');
// Assigning the public class to the component's tag
customElements.define('bbns-container', bbnsContainer);