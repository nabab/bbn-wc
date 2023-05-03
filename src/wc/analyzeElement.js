(() => {
  const parser = new DOMParser();
  bbn.fn.autoExtend('wc', {
    /**
     * Create an object of the HTML element with all the VUE prefixes
     * replaced by BBN prefixes
     * @return {Object} res
     */
    analyzeElement(ele, map, idx) {
      if (!ele.getAttributeNames) {
        throw new Error("Only tags can be analyzed");
      }

      const attr = ele.getAttributeNames().sort();
      if (!map) {
        map = bbn.fn.createObject();
      }

      let res = {
        id: idx,
        tag: ele.tagName.toLowerCase(),
        attr: bbn.fn.createObject(),
        events: bbn.fn.createObject(),
        items: []
      };

      if ((res.tag === 'component') && (attr.indexOf(':is') > -1)) {
        let is = ele.getAttribute(':is').trim();
        const bits = is.split('.');
        if ((bits[0] === '$options')
          && (bits[1] === 'components')
          && (bits.length === 3)
        ) {
          res.tag = bits[2];
          attr.splice(attr.indexOf(':is'), 1);
        }
      }

      attr.forEach(attrName => {
        const main = attrName.indexOf(':') > 0 ? attrName.split(':') : [attrName];
        const modifiers = main[0].split('.');
        const modelValue = main.length > 1 ? main[1] : 'value';
        let a = modifiers.splice(0, 1)[0];
        // replaces v- by bbn-
        if (a.indexOf('v-') === 0) {
          a = 'bbn-' + a.substr(2);
        }
        // replaces else-if by elseif
        if ('bbn-else-if' === a) {
          a = 'bbn-elseif';
        }
        if (a === 'bbn-on') {
          a = '@' + main[1];
        }

        let value = ele.getAttribute(attrName).trim();

        // Events
        if (a.indexOf('@') === 0) {
          let o = bbn.fn.createObject();
          bbn.fn.each(modifiers, modifier => {
            o[modifier] = true;
          });
          o.action = value;
          res.events[a.substr(1)] = o;
          return;
        }

        /** @var {String} name The attribute's real name */
        const name = a.indexOf(':') === 0 ? a.substr(1) : a;
        if (res.attr[name] !== undefined) {
          bbn.fn.warning(bbn._("The attribute %s can't be defined more than once", name));
          return;
        }
        // create the attribute object
        res.attr[name] = bbn.fn.createObject({
          id: idx + '-' + name,
          value: undefined
        });


        // Dynamic attributes
        if (a.indexOf(':') === 0) {
          res.attr[name].exp = value;
          res.attr[name].hash = bbn.fn.hash(value);
          map[res.attr[name].hash] = [];
        }
        // Special attributes
        else if (a.indexOf('bbn-') === 0) {
          switch (a) {
            case 'bbn-for':
              if (attr['bbn-elseif'] || attr['bbn-else']) {
                throw new Error(bbn._("bbn-for can't be used with bbn-else-if or bbn-else"));
              }

              // Retrieving the expression used by loop
              const match = value.match(/\sin\s/);
              if (!match) {
                throw new Error(bbn._("Invalid loop expression"));
              }
        
              const itemExp = value.substr(0, match.index).trim();
              const valueExp = value.substr(match.index + match[0].length).trim();
              /** @var {Object} args An object with the name of the loop argument(s) used by the function */
              let args = bbn.fn.createObject();
              /** @todo Could do better! */
              // The first part of the expression is between parenthesis
              // which should mean there are 2 variables
              if (itemExp.indexOf(')') > -1) {
                /** @var {Array} tmp first part of the expression without the parenthesis and split by coma */
                let tmp = bbn.fn.substr(itemExp, 1, -1).split(',');
                // There's at least one expression
                if (!tmp.length) {
                  throw new Error(bbn._("Invalid loop expression"));
                }
        
                // That would be the value's name'
                args.value = tmp[0].trim();
                // There is a second expression
                if (tmp.length === 2) {
                  // The index name variable used by the function
                  args.index = tmp[1].trim();
                }
              }
              // No parenthesis, there is just the value's name
              else {
                args.value = itemExp;
              }

              // No value no chocolate
              if (!args.value) {
                bbn.fn.error(bbn._("Invalid loop expression"));
              }

              res.loop = bbn.fn.createObject({
                exp: valueExp,
                item: args.value,
                index: args.index || null,
                hash: bbn.fn.hash(valueExp),
                original: value,
                value: undefined
              });
              map[res.loop.hash] = bbn.fn.createObject();
              break;
            case 'bbn-if':
            case 'bbn-elseif':
            case 'bbn-else':
              if (res.condition) {
                bbn.fn.error(bbn._("There can't be more than one conditional expressions on the same tag"));
              }

              let type = a.substr(4);
              let hash = bbn.fn.hash(value);
              res.condition = bbn.fn.createObject({
                type,
                exp: value,
                hash
              });
              if (res.condition.type !== 'else') {
                map[value] = [];
              }

              break;
            case 'bbn-model':
              if (!res.model) {
                res.model = bbn.fn.createObject();
              }
              res.model[modelValue] = bbn.fn.createObject({
                exp: value,
                hash: bbn.fn.hash(value),
                value: undefined,
                modifiers: modifiers
              });
              map[value] = [];
              break;
            case 'bbn-cloak':
              res.cloak = bbn.fn.createObject({
                exp: value,
                hash: bbn.fn.hash(value),
                value: undefined
              });
              map[value] = [];
              break;
            case 'bbn-pre':
              res.pre = ele.innerHTML;
              break;
            case 'bbn-forget':
              res.forget = bbn.fn.createObject({
                exp: value,
                hash: bbn.fn.hash(value),
                value: undefined
              });
              map[value] = [];
              break;
            default:
              if (bbn.wc.directives[a]) {
                if (!res.directives) {
                  res.directives = bbn.fn.createObject();
                }

                res.directives[a] = bbn.fn.createObject({
                  exp: value,
                  hash: bbn.fn.hash(value),
                  modifiers: modifiers,
                  valueName: main[1] || null,
                  oldValue: undefined,
                  value: undefined,
                  lastUpdate: null
                });

              }
              else {
                map[value] = [];
                res.attr[name].exp = value;
                res.attr[name].hash = bbn.fn.hash(value);
              }
          }
        }
        // Regular attributes
        else {
          res.attr[name].hash = bbn.fn.hash(value);
          res.attr[name].value = value;
        }
      });

      let childNodes = res.pre ? [] : ele.childNodes;
      if (ele.tagName === 'TEMPLATE') {
        const doc = parser.parseFromString(
          // There shouldn't be self-closing in the embedded HTML except if in template
          bbn.wc.removeSelfClosing(ele.innerHTML),
          "text/html"
        );
        childNodes = doc.documentElement.querySelector('body').childNodes;
      }
      
      let num = 0;
      Array.from(childNodes).forEach(node => {
        if (node instanceof Comment) {
          return;
        }

        if (node && node.getAttributeNames) {
          let tmp = bbn.wc.analyzeElement(node, map, idx + '-' + num);
          res.items.push(tmp.res);
          num++;
        }
        // No text nodes in the slots
        else if (node.textContent) {
          const txt = bbn.fn.removeExtraSpaces(node.textContent);
          if (txt) {
            let hash = bbn.fn.hash(txt);
            map[hash] = [];
            res.items.push({
              id: idx + '-' + num,
              text: node.textContent,
              hash: hash,
              value: undefined
            });
            num++;
          }
        }
        else {
          bbn.fn.log("Unknown node", node)
        }
      });
      let isIf = false;
      let conditionId =null;
      bbn.fn.each(res.items, (item, idx) => {
        if (item.condition) {
          if (item.condition.type === 'if') {
            conditionId = bbn.fn.randomString(32);
            item.conditionId = conditionId;
            isIf = true;
          }
          else if (!isIf) {
            bbn.fn.error(bbn._("There can't be an elseif or an else without an if"));
          }
          else {
            item.conditionId = conditionId;
          }
          if (item.condition.type === 'else') {
            isIf = false;
          }
        }
        else {
          isIf = false;
        }
      });

      return {
        res,
        map
      };
    }
  })
})();
