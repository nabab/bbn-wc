(() => {
  const x = (obj, spaces, content)  => {
    if (!obj) {
      obj = bbn.fn.createObject({text: ''});
    }
    if (content) {
      obj.text += ' '.repeat(spaces) + content + '\n';
    }

    return obj;
  };
  /**
   * (Re)generates the whole component's vDOM and DOM if needed, picking the right root, shadow or not
   * - Updates the component element based on its own schema ($el.bbnSchema)
   * - Updates the schema
   * - Generates/update the DOM when needed
   * 
   * @param {Boolean} shadow The content will go to the shadow DOM if true
   * @returns {Promise}
   */
  Object.defineProperty(bbnComponentPrototype, '$templateToFunction', {
    writable: false,
    configurable: false,
    value: function(tpl, sp = 0) {
      let hashName = '_bbnHash';
      let c = x();
      x(c, sp, `async (_t, _d) => {`);
      sp += 2;
      let code2 = '';
      x(c, sp, `const _r = _t.\$currentResult;`);
      x(c, sp, `_r._num++;`);
      x(c, sp, `let ${hashName} = '';`);
      x(c, sp, `bbn.fn.iterate(_r, a => {`);
      x(c, sp, `  bbn.fn.iterate(a, b => {`);
      x(c, sp, `    if (b.state !== 'DEL') {`);
      x(c, sp, `      b.state = 'TMP';`);
      x(c, sp, `    }`);
      x(c, sp, `  });`);
      x(c, sp, `});`);
      x(c, sp, `const _bbnCurrentData = bbn.fn.createObject();`);
      for (let n in this.$namespaces) {
        if (this.$namespaces[n] === 'method') {
          x(c, sp, `const ${n} = _t.${n}.bind(_t);`);
        }
        else if (n.indexOf('$') === 0) {
          x(c, sp, `const ${n} = _t.${n};`);
        }
        else {
          x(c, sp, `let ${n} = _t["${n}"];`);
          x(c, sp, `_bbnCurrentData["${n}"] = ${n};`);
        }
      }
      
      x(c, sp, `// _setInternalResult`);
      x(c, sp, `const _sIr = (_name, _exp, _hash) => {`);
      x(c, sp, `  return _t.\$_setInternalResult(_r, _name, _exp, _hash);`);
      x(c, sp, `};`);
      x(c, sp, `// _getInternalState`);
      x(c, sp, `const _gIs = (_name, _hash) => {`);
      x(c, sp, `  return _t.\$_getInternalState(_r, _name, _hash);`);
      x(c, sp, `};`);
      x(c, sp, `// _getInternalValue`);
      x(c, sp, `const _gIv = (_name, _hash) => {`);
      x(c, sp, `  return _t.\$_getInternalValue(_r, _name, _hash);`);
      x(c, sp, `};`);
      x(c, sp, `const _eles = [_t.\$el];`);
      x(c, sp, `let _isCondTrue = false;`);
      x(c, sp, `let _props;`);
      x(c, sp, `let _tmp;`);
      x(c, sp, `let _isAnew;`);
      x(c, sp, `const _forgotten = bbn.fn.createObject();`);
      x(c, sp, `const _portals = bbn.fn.createObject();`);
      x(c, sp, `let _todo = !_t.\$numBuild;`);
      if ((tpl.length === 1)
          && tpl[0].items
          && !tpl[0].attr?.['bbn-if']
          && !tpl[0].attr?.['bbn-for']
          && !tpl[0].attr?.['bbn-forget']
          && !bbn.wc.isComponent(tpl[0])
          && (tpl[0].tag !== 'slot')
          && (tpl[0].tag !== 'template')
          && (tpl[0].tag !== 'component')
      ) {
        if (tpl[0].attr) {
          x(c, sp, `_props = {`);
          for (let n in tpl[0].attr) {
            if (tpl[0].attr[n].exp) {
              x(c, sp, `  "${n}": _sIr("${tpl[0].attr[n].hash}", ${tpl[0].attr[n].exp}, ${hashName}),`);
            }
            else {
              x(c, sp, `  "${n}": "${bbn.fn.escapeDquotes(tpl[0].attr[n].value)}",`);
            }
          }
          x(c, sp, `};`);
          //x(c, sp, `bbn.fn.log("PROPS", _props);`);
          x(c, sp, `_t.\$updateFromSchema(_props);`);
        }
        c.text += this.$nodesToFunction(tpl[0].items, sp, hashName);
      }
      else {
        c.text += this.$nodesToFunction(tpl, sp, hashName);
      }
      c.text += code2;
      x(c, sp, `bbn.fn.iterate(_r, a => {`);
      x(c, sp, `  bbn.fn.iterate(a, b => {`);
      x(c, sp, `    if (b.state === 'TMP') {`);
      x(c, sp, `      b.state = 'DEL';`);
      x(c, sp, `    }`);
      x(c, sp, `  });`);
      x(c, sp, `});`);
      x(c, sp, `return _r;`);
      sp -= 2;
      x(c, sp, `}`);
        
      return c.text;
  
    }
  });
})();
