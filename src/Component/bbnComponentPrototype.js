(() => {
  window.bbnComponentPrototype = bbn.fn.createObject();
  const props = {
    $name: 'bbnComponent',
    $tickDelay: 100
  };
  for (let n in props) {
    Object.defineProperty(window.bbnComponentPrototype, n, {
      writable: false,
      configurable: false,
      enumerable: true,
      value: props[n]
    });
  }
})();
