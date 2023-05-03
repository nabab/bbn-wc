(() => {
  const x = (obj, spaces, content)  => {
    if (!obj) {
      obj = bbn.fn.createObject({text: ''});
    }
    if (content) {
      obj.text += ' '.repeat(spaces) + content + '\n';
    }
    else {
      obj.text += '\n';
    }

    return obj;
  };

  const forbidden = ['bbn-forget', 'bbn-for', 'bbn-if', 'bbn-elseif', 'bbn-else'];

  const treatCondition = (node, arr, sp, hashName) => {
    const c = x();
    let tmp = arr.filter(a => (a.conditionId === node.conditionId));
    if (!tmp.length || !node.conditionId) {
      return c.text;
    }

    x(c, sp, `_isCondTrue = false;`);
    x(c, sp, '// Checking the set of conditions (if any other) on the first condition');
    bbn.fn.each(tmp, (cond, j) => {
      // No need to check thge first as _isCondTrue has just been defined
      if (j) {
        x(c, sp, `if (!_isCondTrue) {`);
        sp += 2;
      }
      x(c, sp, `_isCondTrue = _sIr("${cond.condition.hash}", ${cond.condition.type === 'else' ? 'true' : cond.condition.exp}, ${hashName});`);
      if (j) {
        sp -= 2;
        x(c, sp, `}`);
        x(c, sp, `else {`);
        x(c, sp, `  _sIr("${cond.condition.hash}", false, ${hashName});`);
        x(c, sp, `}`);
      }
      x(c, sp, `if (_gIs("${cond.condition.hash}", ${hashName}) !== "OK") {`)
      if (cond.id === node.id) {
        x(c, sp, '  _todo = true;');
      }
      x(c, sp, `  let _tmp = _gIv("${cond.condition.hash}", ${hashName});`);
      x(c, sp, `  let _e = _t.\$retrieveElement("${cond.id}", ${hashName});`);
      x(c, sp, `  if (!_tmp) {`);
      x(c, sp, `    if (_e && !bbn.fn.isComment(_e)) {`);
      //x(c, sp, `      bbn.fn.log("REMOVING ${cond.id} from node2fn")`);
      x(c, sp, `      let _cp = bbn.wc.getComponent(_e.bbnComponentId)?.bbn || _t;`);
      x(c, sp, `      _t.\$removeDOM(_e);`);
      x(c, sp, `      _e = false;`);
      x(c, sp, `    }`);
      x(c, sp, `    if (!_e) {`);
      x(c, sp, `      _t.\$createElement({`);
      x(c, sp, `        id: "${cond.id}",`);
      x(c, sp, `        hash: "${cond.condition.hash}",`);
      x(c, sp, `        loopHash: ${hashName},`);
      x(c, sp, `        conditionId: "${cond.conditionId}",`);
      x(c, sp, `        comment: true`);
      x(c, sp, `      }, _eles.at(-1));`);
      x(c, sp, `    }`);
      x(c, sp, `  }`);
      x(c, sp, `}`);
    });

    return c.text;
  };
  /**
   * Generates the code recursively for a loop
   * @param {Object} node 
   * @param {String} rv 
   * @param {String} hashName   
   * @param {Number} sp 
   * @param {Array} done 
   * @returns 
   */
  const getLoop = (node, hashName, sp) => {
    const clone = bbn.fn.clone(node);
    delete clone.loop;
    const c = x();
    const hash = 'bbnLoopHash_' + bbn.fn.randomString(15);
    const isNumber = 'bbnLoopIsNumber_' + bbn.fn.randomString(15);
    const isArray = 'bbnLoopIsArray_' + bbn.fn.randomString(15);
    const varName = 'bbnLoopName_' + bbn.fn.randomString(15);
    const listName = 'bbnLoopList_' + bbn.fn.randomString(15);
    const parentName = 'bbnLoopParent_' + bbn.fn.randomString(15);
    const indexName = node.loop.index || ('bbnLoopIndex_' + bbn.fn.randomString(15));
    // Starting the loop

    x(c, sp, `let ${varName} = _sIr('${node.loop.hash}', ${node.loop.exp}, ${hashName});`);
    x(c, sp, `let ${isNumber} = bbn.fn.isNumber(${varName});`);
    x(c, sp, `let ${parentName} = _eles.at(-1);`);
    x(c, sp, `let ${listName} = [];`);
    x(c, sp, `let ${isArray} = bbn.fn.isArray(${varName});`);
    x(c, sp, `if (${isNumber}) {`);
    x(c, sp, `  ${varName} = Object.keys((new Array(${varName})).fill(0)).map(a=>parseInt(a));`);
    x(c, sp, `}`);
    x(c, sp, `for (let ${indexName} in ${varName}) {`);
    x(c, sp, `  if (${isArray}) {`);
    x(c, sp, `    ${indexName} = parseInt(${indexName});`);
    x(c, sp, `  }`);
    x(c, sp, `  let ${node.loop.item} = ${isNumber} ? ${indexName} : ${node.loop.exp}[${indexName}];`);
    x(c, sp, `  _h = '${node.loop.hash}-${indexName}' + ${node.loop.key ? node.loop.item + '[' + node.loop.key + ']' : indexName};`);
    x(c, sp, `  const ${hash} = (${hashName} ? ${hashName} + '-' : '') + _h;`);
    x(c, sp, `  ${listName}.push(${hash});`);
    x(c, sp, `  _sIr('${node.loop.item}', ${node.loop.item}, ${hash});`);
    if (node.loop.index) {
      x(c, sp, `  _sIr('${node.loop.index}', ${node.loop.index}, ${hash});`);
    }

    sp += 2;
    c.text += nodesToFunction(
      [clone],
      sp,
      hash
    );
    sp -= 2;
    // Ending the loop
    x(c, sp, `}`);
    x(c, sp, `Array.from(${parentName}.childNodes).forEach((a) => {`);
    x(c, sp, `  if ((a.bbnId === "${node.id}") && (${listName}.indexOf(a.bbnHash) === -1)) {`);
    x(c, sp, `    _t.\$removeDOM(a);`);
    x(c, sp, `  }`);
    x(c, sp, `});`);
    return c.text;
  };

  /**
   * Recursive function that takes an array of objects representing nodes in an 
   * HTML-like structure and generates JavaScript code based on those nodes. 
   * 
   * @param {Array} arr the nodes array
   * @param {String} varName variable name that is used to reference the data object that corresponds to the current node
   * @param {Number} sp number of spaces to use for indentation in the generated code
   * @param {Array} done array that keeps track of variables that have already been defined to avoid re-definition
   * @returns {String}
   */
  const nodesToFunction = (arr, sp, hashName) => {
    const c = x();
    let conditions = [];
    let conditionId = null;
    bbn.fn.each(arr, (node, i) => {
      x(c, sp, '');
      x(c, sp, '// Taking care of the node ' + node.id);
      if (node.loop?.exp) {
        c.text += getLoop(node, hashName, sp);
        return;
      }

      if (node.condition) {
        if ((node.conditionId !== conditionId) && !conditions.includes(node.conditionId)) {
          conditions.push(node.conditionId);
          conditionId = node.conditionId;
          c.text += treatCondition(node, arr, sp, hashName);
        }

        let condText = (node.condition.type === 'elseif' ? 'else if' : node.condition.type);
        if (node.condition.type !== 'else') {
          condText += ' (_gIv("' + node.condition.hash + '", ' + hashName + '))';
        }
        condText += ' {';
        x(c, sp, condText);
        sp += 2;
      }

      if (node.forget?.exp) {
        x(c, sp, `_sIr("${node.forget.hash}", ${node.forget.exp}, ${hashName});`);
        x(c, sp, `if (!_forgotten["${node.id}"]) {`);
        x(c, sp, `  _forgotten["${node.id}"] = bbn.fn.createObject();`);
        x(c, sp, `}`);
        x(c, sp, `_forgotten["${node.id}"][${hashName} || '_root'] = _gIv("${node.forget.hash}", ${hashName});`);
      }

      if (node.text) {
        x(c, sp, `_sIr("${node.hash}", \`${bbn.fn.escapeTicks(node.text)}\`, ${hashName});`);
        x(c, sp, `if (!_t.\$numBuild || (_gIs("${node.hash}", ${hashName}) !== "OK")) {`);
        x(c, sp, `  let _e = _t.\$retrieveElement("${node.id}", ${hashName});`);
        x(c, sp, `  if (_e) {`);
        x(c, sp, `    _e.textContent = _gIv("${node.hash}", ${hashName});`);
        x(c, sp, `  }`);
        x(c, sp, `  else {`);
        x(c, sp, `    _t.\$createText({`);
        x(c, sp, `      "id": "${node.id}",`);
        x(c, sp, `      "hash": "${bbn.fn.escapeDquotes(node.hash)}",`);
        x(c, sp, `      "text": _gIv("${node.hash}", ${hashName}),`);
        x(c, sp, `      "loopHash": ${hashName},`);
        x(c, sp, `    }, _eles.at(-1));`);
        x(c, sp, `  }`);
        x(c, sp, `}`);
      }
      else if (node.tag) {
        const eleName = 'bbnEle_' + bbn.fn.randomString(15);
        const isAnew = 'bbnAnew_' + bbn.fn.randomString(15);
        x(c, sp, `let ${eleName};`);
        x(c, sp, `let ${isAnew};`);
        if (node.pre || !['transition', 'template'].includes(node.tag)) {
          if (node.forget?.exp) {
            x(c, sp, `if (!_forgotten["${node.id}"]?.[${hashName} || '_root']) {`);
            sp += 2;
            x(c, sp, `if (['NEW', 'MOD'].includes(_gIs("${node.forget.hash}", ${hashName}))) {`);
            x(c, sp, `  _todo = true;`);
            x(c, sp, `}`);
          }

          if (bbn.fn.numProperties(node.attr)) {
            let exps = [];
            if (node.attr['bbn-bind']) {
              x(c, sp, `_tmp =  _sIr("${node.attr['bbn-bind'].hash}", ${node.attr['bbn-bind'].exp}, ${hashName});`);
              x(c, sp, `if (!_todo && (_gIs("${node.attr['bbn-bind'].hash}", ${hashName}) !== "OK")) {`);
              x(c, sp, `  _todo = true;`);
              x(c, sp, `}`);
            }
            else {
              x(c, sp, `_tmp = null;`);
            }
            x(c, sp, `_props = {`);
            for (let n in node.attr) {
              if (['bbn-bind', 'bbn-for', 'bbn-if', 'bbn-elseif', 'bbn-else', 'bbn-forget'].includes(n)) {
                continue;
              }

              let desc = '  "' + n + '": ';
              if (node.attr[n].exp) {
                if (n === 'class') {
                  desc +=  'bbn.wc.convertClasses(';
                }
                else if (n === 'style') {
                  desc +=  'bbn.wc.convertStyles(';
                }
                desc += '_sIr("' + node.attr[n].hash + '", ' + node.attr[n].exp + ', ' + hashName + ')';
                if (['class', 'style'].includes(n)) {
                  desc +=  ')';
                }
                desc += ',';
                exps.push(n);
              }
              else {
                desc += '"' + bbn.fn.escapeDquotes(node.attr[n].value) + '",';
              }
              x(c, sp, desc);
            }
            x(c, sp, `};`);

            if (node.attr['bbn-bind']) {
              x(c, sp, `if (_tmp) {`);
              x(c, sp, `  _props = bbn.fn.extend({}, _tmp, _props);`);
              x(c, sp, `}`);
            }
            bbn.fn.each(exps, exp => {
              x(c, sp, `if (!_todo && (_gIs("${node.attr[exp].hash}", ${hashName}) !== "OK")) {`);
              x(c, sp, `  _todo = true;`);
              x(c, sp, `}`);
            });
            if (node.attr['bbn-portal']) {
              x(c, sp, `if (_gIs("${node.attr['bbn-portal'].hash}", ${hashName}) !== "OK") {`);
              x(c, sp, `  _portals['${node.id}'] = gIv("${node.attr['bbn-portal'].hash}", ${hashName});`);
              x(c, sp, `  if (bbn.fn.isString(_portals['${node.id}'])) {`);
              x(c, sp, `    _portals['${node.id}'] = document.body.querySelector(_portals['${node.id}']);`);
              x(c, sp, `  }`);
              x(c, sp, `}`);
            }
            if (node.model) {
              bbn.fn.iterate(node.model, m => {
                x(c, sp, `if (!_todo && (_gIs("${m.hash}", ${hashName}) !== "OK")) {`);
                x(c, sp, `  _todo = true;`);
                x(c, sp, `}`);
              })
            }
          }

          if (node.tag === 'slot') {
            if (node.bbnId === '0-0-0-0-1-1-3'){ 
              x(c, sp, `bbn.fn.log("//////////// NO REPLACE?", _t.\$el.bbnSlots, a, a.mounted);`);
            }
            //x(c, sp, `  bbn.fn.log("This is a slot in " + _t.\$options.name);`);
            x(c, sp, `if (_t.\$el.bbnSlots["${node.attr?.name?.value || 'default'}"]) {`);
            x(c, sp, `  bbn.fn.each(_t.\$el.bbnSlots["${node.attr?.name?.value || 'default'}"].items, a => {`);
            //x(c, sp, `    bbn.fn.log("This is a slot element", a)`);
            x(c, sp, `    if (!a.mounted) {`);
            x(c, sp, `      if ((_eles.at(-1) !== _t.$el) && bbn.wc.isComponent(_eles.at(-1))) {`);
            x(c, sp, `        if (!bbn.fn.getRow(_eles.at(-1).bbnSlots.default.items, {ele: a.ele})) {`);
            x(c, sp, `          _eles.at(-1).bbnSlots.default.items.push(a);`);
            x(c, sp, `        }`);
            x(c, sp, `      }`);
            x(c, sp, `      else {`);
            x(c, sp, `        _eles.at(-1).appendChild(a.ele);`);
            x(c, sp, `        a.mounted = true;`);
            x(c, sp, `      }`);
            x(c, sp, `    }`);
            x(c, sp, `  });`);
            x(c, sp, `}`);
            if (node.forget?.exp) {
              sp -= 2;
              x(c, sp, `}`);
            }
            if (node.condition) {
              sp -= 2;
              x(c, sp, `}`);
            }

            return;
          }

          x(c, sp, `if (_todo) {`);
          //x(c, sp, `  bbn.fn.log("IN TODO " + _t.$options.name);`);
          //x(c, sp, `  bbn.fn.log("DOING ${node.id} ${node.tag}");`);
          x(c, sp, `  _tmp = {`);
          x(c, sp, `    "id": "${node.id}",`);
          x(c, sp, `    "tag": "${node.tag}",`);
          x(c, sp, `    "componentId": _t.\$cid,`);
          x(c, sp, `    "loopHash": ${hashName},`);
          if (node.condition) {
            x(c, sp, '    "condition": "' + node.conditionId + '",');
          }
          if (node.model) {
            x(c, sp, '    "model": ' + JSON.stringify(node.model) + ',');
          }
          if (node.pre) {
            x(c, sp, `    "pre": \`${node.pre}\`,`);
          }
          if (node.directives) {
            x(c, sp, '    "directives": ' + JSON.stringify(node.directives) + ',');
          }
          if (bbn.fn.numProperties(node.events)) {
            x(c, sp, '    "events": ' + JSON.stringify(node.events) + ',');
          }
          if (bbn.fn.numProperties(node.attr)) {
            x(c, sp, '    "props": _props,');
          }
          x(c, sp, `  };`);
          if (node.tag === 'component') {
            x(c, sp, `  if (bbn.fn.isObject(_props.is)) {`);
            x(c, sp, `    _tmp.tag = 'bbn-anonymous';`);
            x(c, sp, `    _tmp.cfg = _props.is;`);
            x(c, sp, `  }`);
            x(c, sp, `  else {`);
            x(c, sp, `    _tmp.tag = _props.is;`);
            x(c, sp, `  }`);
          }
          if (node.model) {
            for (let n in node.model) {
              x(c, sp, `  _tmp.model["${n}"].value = _sIr("${node.model[n].hash}", ${node.model[n].exp}, ${hashName});`);
            }
          }
          sp += 2;
          x(c, sp, `${eleName} = _t.\$retrieveElement(_tmp.id, _tmp.loopHash);`);
          x(c, sp, `${isAnew} = false;`);
          x(c, sp, `if ((${eleName} !== _t.\$el) && (`);
          x(c, sp, `    !${eleName}`);
          x(c, sp, `    || bbn.fn.isComment(${eleName})`);
          x(c, sp, `    || !bbn.wc.isTag(_tmp.tag, ${eleName})`);
          x(c, sp, `  )`);
          x(c, sp, `) {`);
          x(c, sp, `  ${isAnew} = true;`);
          x(c, sp, `}`);
          x(c, sp, `${eleName} = await _t.\$createElement(_tmp, _eles.at(-1));`);
          if (node.model || bbn.fn.numProperties(node.events || {})) {
            x(c, sp, `if (${isAnew}) {`);
            sp += 2;
            if (node.model) {
              bbn.fn.iterate(node.model, (m, name) => {
                const modelVarName = m.exp;
                const modelVarRoot = modelVarName.split(/[\.\[]+/)[0];
                const eventName = m.modifiers.includes('lazy') ? 'change' : 'input';
                x(c, sp, `_t.\$dataModels["${m.hash}"]["${node.id}"]["${name}"][${hashName} || "_root"] = ${eleName};`);
                x(c, sp, `${eleName}.addEventListener("${eventName}", _bbnEventObject => {`);
                x(c, sp, `  let \$event = _bbnEventObject;`);
                x(c, sp, `  let _bbnEventValue = \$event.detail?.args ? \$event.detail.args[0] : \$event.target?.value;`);
                x(c, sp, `  if (${modelVarName} !== _bbnEventValue) {`);
                if (modelVarRoot === modelVarName) {
                  x(c, sp, `  _t["${modelVarRoot}"] = _bbnEventValue;`);
                }
                x(c, sp, `    ${modelVarName} = _bbnEventValue;`);
                x(c, sp, `    bbn.fn.log("VALUE ${modelVarName} CHANGED THROUGH MODEL TO " + _bbnEventValue);`);
                x(c, sp, `    \$event.target.bbnSchema.model["${name}"].value = _bbnEventValue;`);
                x(c, sp, `    _t.\$tick();`);
                x(c, sp, `  }`);
                x(c, sp, `});`);
              });
            }

            if (node.events) {
              for (let n in node.events) {
                let ev = node.events[n];
                //x(c, sp, `bbn.fn.log("SETTING EVENT ${n} ON " + _t.\$options.name, _ele, ${isAnew});`);
                x(c, sp, `${eleName}.addEventListener("${n}", _bbnEventObject => {`);
                //x(c, sp, `  bbn.fn.log("EXECUTING EVENT ${n} ${ev.action} ON ${node.tag}", _bbnEventObject.detail);`);
                x(c, sp, `  let \$event = _bbnEventObject;`);

                if (ev.prevent) {
                  x(c, sp, `  $event.preventDefault();`);
                }

                if (ev.stop) {
                  x(c, sp, `  $event.stopImmediatePropagation();`);
                }

                if (ev.action) {
                  x(c, sp, `  const args = _bbnEventObject.detail?.args || [];`);
                  x(c, sp, `  args.push(_bbnEventObject);`);
                  let act = `  ${ev.action}`
                  if ((ev.action.indexOf(';') === -1) && (ev.action.indexOf('=') === -1) && (ev.action.indexOf('++') === -1) && (ev.action.indexOf('--') === -1) && (ev.action[ev.action.length-1] !== ')')) {
                    act += '(...args)';
                  }
                  act += `;`;
                  x(c, sp, act);
                  x(c, sp, `  bbn.fn.iterate(_bbnCurrentData, (_bbnCurrentDataValue, _bbnCurrentDataIndex) => {`);
                  x(c, sp, `    if (_bbnCurrentDataValue !== eval(_bbnCurrentDataIndex)) {`);
                  x(c, sp, `      if (_t[_bbnCurrentDataIndex] !== undefined) {`);
                  x(c, sp, `        _t[_bbnCurrentDataIndex] = eval(_bbnCurrentDataIndex);`);
                  x(c, sp, `      }`);
                  x(c, sp, `      _bbnCurrentData[_bbnCurrentDataIndex] = _t[_bbnCurrentDataIndex];`);
                  x(c, sp, `    }`);
                  x(c, sp, `  });`);
                }
                x(c, sp, `  _t.\$tick();`);
                x(c, sp, `});`);
              }
            }

            sp -= 2;
            x(c, sp, `}`);
          }

          sp -= 2;
          x(c, sp, `}`);
          x(c, sp, `else {`);
          x(c, sp, `  ${eleName} = _t.\$retrieveElement("${node.id}", ${hashName});`);
          //x(c, sp, `  bbn.fn.log("OUT TODO", ${eleName}, "${node.id}", ${hashName});`);
          x(c, sp, `}`);
          if (node.forget?.exp) {
            x(c, sp, `  if (${eleName} && (_gIs("${node.forget.hash}", ${hashName}) === 'MOD')) {`);
            x(c, sp, `    bbn.fn.each(Array.from(_eles.at(-1).childNodes), node => {`);
            x(c, sp, `      if (node.bbnSchema.id.indexOf("${node.id}-") === 0) {`);
            x(c, sp, `        ${eleName}.appendChild(node);`);
            x(c, sp, `      }`);
            x(c, sp, `    });`);
            x(c, sp, `  }`);
            sp -= 2;
            x(c, sp, `}`);
            // Ele is the current parent
            x(c, sp, `else {`);
            x(c, sp, `  if (_gIs("${node.forget.hash}", ${hashName}) === 'MOD') {`);
            x(c, sp, `    ${eleName} = _t.\$retrieveElement("${node.id}", ${hashName});`);
            x(c, sp, `    if (${eleName}) {`);
            x(c, sp, `      bbn.fn.each(Array.from(${eleName}.childNodes), node => {`);
            x(c, sp, `        _eles.at(-1).appendChild(node);`);
            x(c, sp, `      });`);
            x(c, sp, `      _t.\$removeDOM(${eleName});`);
            x(c, sp, `    }`);
            x(c, sp, `  }`);
            x(c, sp, `  ${eleName} = _eles.at(-1);`);
            x(c, sp, `}`);
          }
        }
        else {
          x(c, sp, `${eleName} = _eles.at(-1);`);
        }

        if (node.pre) {
          x(c, sp, `if (${eleName}) {`);
          x(c, sp, `  ${eleName}.innerHTML = \`${bbn.fn.escapeTicks(node.pre)}\`;`);
          x(c, sp, `}`);
        }
        else if (node.items?.length || node.slots?.length) {
          x(c, sp, `if (!${eleName}) {`);
          x(c, sp, `  bbn.fn.log(${isAnew}, "ELEMENT ISSUE", "${node.id}", "${node.tag}", ${hashName});`);
          x(c, sp, `}`);
          x(c, sp, `if (!bbn.fn.isComment(${eleName})) {`);
          x(c, sp, `  // New parent: ${node.id}`);
          x(c, sp, `  _eles.push(${eleName});`);
          c.text += nodesToFunction(
            node.items?.length ? node.items : node.slots,
            sp + 2,
            hashName
          );
          x(c, sp, `  // Parent back to: ${node.id.split('-').slice(0, -1).join('-')}`);
          x(c, sp, `  ${eleName} = _eles.pop();`);
          x(c, sp, `}`);
        }

        if (!['transition', 'template'].includes(node.tag)) {
          x(c, sp, `if (!_forgotten["${node.id}"]?.[${hashName} || '_root'] && ${isAnew} && bbn.wc.isComponent(${eleName})) {`);
          x(c, sp, `  _t.\$insertElement(${eleName}, _portals["${node.id}"] || _eles.at(-1));`);
          x(c, sp, `}`);
        }
      }

      if (node.condition) {
        sp -= 2;
        x(c, sp, `//Ending condition`);
        x(c, sp, `}`);
      }
    });

    return c.text;
  };

  /**
   * Recursive function that takes an array of objects representing nodes in an 
   * HTML-like structure and generates JavaScript code based on those nodes. 
   * 
   * @param {Array} arr the nodes array
   * @param {String} varName variable name that is used to reference the data object that corresponds to the current node
   * @returns {String}
   */
  Object.defineProperty(bbnComponentPrototype, '$nodesToFunction', {
    writable: false,
    configurable: false,
    value: function(arr, sp, hashName) {
      return nodesToFunction(arr, sp, hashName);
    }
  });
})();
