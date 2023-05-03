(() => {
  bbn.fn.autoExtend('wc', {
    /**
    * Create the bbn component private class based on the bbnComponentPrivate
    */
    functionGenerator(publicClass, obj) {
      const tag = bbn.fn.camelToCss(publicClass);
      const name = publicClass + 'Prototype';
      const fnName = publicClass + 'Creator';
      const stat = {
        methods: bbn.fn.createObject(),
        vars: bbn.fn.createObject()
      };
      if (obj.static) {
        const ostat = bbn.fn.isFunction(obj.static) ? obj.static() : obj.static;
        if (bbn.fn.isObject(ostat)) {
          bbn.fn.iterate(ostat, (a, n) => {
            if (bbn.fn.isFunction(a)) {
              stat.methods[n] = a.toString();
            }
            else {
              stat.vars[n] = bbn.fn.isArray(a) || bbn.fn.isArray(a) ? JSON.stringify(a) : a;
            }
          });
        }
      }

      let proto = 'bbnComponentPrototype';
      if (obj.tag && bbn.wc.tagExtensions[obj.tag]) {
        proto = bbn.wc.tagExtensions[obj.tag] + 'Prototype';
      }

      let code = `window.${name} = Object.create(${proto});
Object.defineProperty(window.${name}, '$init', {
  value: function(el) {`;
      code += `
    const data = [`;
      if (obj.data?.length) {
        code += `
      function() ` + obj.data.map(a => a.toString().trim().substr(a.toString().trim().indexOf('{'))).join(`,\n      () => `);
      }
      code += `
    ];`;

      code += `
    return this;
  },
  writable: false,
  configurable: false
});
`;
      code += `
Object.defineProperty(window.${name}, '$setUpProps', {
  value: function() {`;
      if (obj.props) {
        code += `
    let cp = this;`;
        for (let n in obj.props) {
          const cfg = obj.props[n];
          code += `
    this.$setUpProp("` + bbn.fn.escapeDquotes(n) + `", {`;
          if (cfg.required) {
            code += `
      required: true,`;
          }

          if (cfg.validator) {
            const src = cfg.validator.toString();
            let parenthesisPos = src.indexOf('(');
            let bracePos = src.indexOf('{');
            if ((bracePos > -1) && (parenthesisPos > -1) && (bracePos > parenthesisPos)) {
              let fn = src.substr(parenthesisPos);
              code += `
      validator` + fn + `,`
            }
            else {
              code += `
      validator: ` + src + `,`
            }
          }

          if (cfg.default !== undefined) {
            if (bbn.fn.isFunction(cfg.default)) {
              let parenthesisPos = cfg.default.toString().indexOf('{');
              if (parenthesisPos > -1) {
                let fn = cfg.default.toString().substr(parenthesisPos);
                code += `
      default: () => ` + fn + `,`
              }
              else {
                code += `
      default: ` + cfg.validator.toString() + `,`
              }
            }
            else {
              code += `
      default: `;
              if (cfg.default === null) {
                code += 'null';
              }
              else {
                code += bbn.fn.isString(cfg.default) ? `"` + bbn.fn.escapeDquotes(cfg.default) + `"` : cfg.default.toString();
              }

              code += `,`;
            }
          }

          if (cfg.type) {
            code += `
      type: [` + cfg.type.map(a => a.name).join(', ') + `],`
          }

          code += `
    });`
        }

        code += `
  },
  writable: false,
  configurable: false
});`;
      }

      if (obj.methods) {
        code += `
Object.assign(window.${name}, {`
        for (let n in obj.methods) {
          let stFn = obj.methods[n].toString().trim();
          let isAnon = stFn.match(/function\s*\(/);
          if (isAnon && (isAnon.index === 0)) {
            stFn = n + stFn.substr(stFn.indexOf('('));
          }
          code += `
      ` + stFn + ',';
        }
        code += `
});`;
      }

      if (obj.computed) {
        for (let n in obj.computed) {
          let getFn = obj.computed[n].get.toString().trim();
          code += `
Object.defineProperty(${name}, "${n}", {
  get() {
    if (!this.\$isDataSet) {
      return undefined;
    }
    const myVal = (() => {` + bbn.fn.substr(getFn, getFn.indexOf('{') + 1, -1) + `})();
    const myHash = bbn.fn.isObject(myVal) ? bbn.fn.md5(myVal) : myVal;
    if (!Object.hasOwn(this.\$computed, "${n}")) {
      this.\$computed["${n}"] = bbn.fn.createObject({
        old: myHash,
        val: myVal
      });
    }
    else {
      if (myHash !== this.\$computed["${n}"].old) {
        const oldValue = this.\$computed["${n}"].val;
        this.\$computed["${n}"].val = myVal;
        this.\$computed["${n}"].old = myHash;
        if (this.\$watcher?.["${n}"]) {
          if (this.\$watcher["${n}"].handler && !bbn.fn.isSame(myVal, oldValue)) {
            bbn.fn.log("Launching watcher for computed ${n}");
            this.\$watcher["${n}"].handler.call(this, myVal, oldValue);
          }
          if (this.\$watcher["${n}"].props) {
            bbn.fn.iterate(this.\$watcher["${n}"].props, (a, n) => {
              if (a.handler && !bbn.fn.isSame(myVal[n], oldValue?.[n])) {
                a.handler.call(this, myVal[n], oldValue?.[n]);
              }
            });
          }
        }
      }
    }

    return this.\$computed["${n}"].val;
  }`;
      if (obj.computed[n].set) {
        let setFn = obj.computed[n].set.toString();
        code += `,
  set ` + setFn.substr(setFn.indexOf('('));
      }
      code += `
});
    `;

        }
      }

      const acceptedAttr = bbn.wc.possibleAttributes
        .concat(bbn.wc.possibleAttributes.map(a => ':' + a))
        .concat(Object.keys(obj.props))
        .concat(Object.keys(obj.props).map(a => ':' + a));
      code += `
      Object.defineProperty(${name}, "\$acceptedAttributes", {
        value: ${JSON.stringify(acceptedAttr)},
        configurable: false,
        writable: false
      });`;

      code += `
window.${fnName} = function(el, id) {
  const a = Object.create(${name});
  Object.defineProperty(a, '\$options', {
    value: {
      name: '${tag}',
      _componentTag: '${tag}',
      components: bbn.fn.createObject(),` + (
        obj.tag ? `
      tag: '${obj.tag}',` : ''
      ) + `
      get propsData() {
        if (a.\$el) {
          return a.\$el.bbnSchema?.props || {};
        }

        return {};
      }
    },
    writable: false,
    configurable: false
  });
  bbnComponentPrototype.\$init.apply(a, arguments);
  return a;
};
Object.defineProperty(window.${name}, 'constructor', {
  value: window.${fnName},
  writable: false,
  configurable: false
});
${fnName}.name = '` + fnName + `';
${fnName}.bbnClass = ` + publicClass + `;
${fnName}.availableSlots = bbn.fn.createObject();
${fnName}.dataModels = bbn.fn.createObject();
${fnName}.name = "${name}";
Object.assign(${fnName}.availableSlots, bbn.wc.retrieveSlots(` + publicClass + `.constructor.bbnTpl))
Object.assign(${fnName}.dataModels, bbn.wc.retrieveModels(` + publicClass + `.constructor.bbnTpl))
`;

      bbn.fn.iterate (stat.methods, (a, n) => {
        const fn = a.toString
        code += `
    ${fnName}["${n}"] = ${fn};`;
      });
      code += `
let vars = ${JSON.stringify(stat.vars)};
bbn.fn.iterate(vars, (a, n) => {
  ${fnName}[n] = a;
});`;

      return code;
    }
  })
})();
