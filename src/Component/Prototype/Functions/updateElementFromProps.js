(() => {
  /**
   * (Re)generates the whole component's vDOM and DOM if needed, picking the right root, shadow or not
   * - Updates the component element based on its own schema ($el.bbnSchema)
   * - Updates the schema
   * - Generates/update the DOM when needed
   * 
   * @param {Boolean} shadow The content will go to the shadow DOM if true
   * @returns {Promise}
   */
  Object.defineProperty(bbnComponentPrototype, '$updateElementFromProps', {
    writable: false,
    configurable: false,
    value: function(node, ele) {
      if (node.comment) {
        return;
      }

      /** @constant {Object} props */
      const props = node.props || bbn.fn.createObject();
      /** @constant {Boolean} isComponent */
      const isComponent = bbn.wc.isComponent(node);
      /** @constant {bbnComponentObject} cpSource */
      const cpSource = this;//node.componentId ? bbn.wc.getComponent(node.componentId)?.bbn : this;
      if (!cpSource) {
        bbn.fn.log(node, bbn.wc.getComponent(node.componentId));
        bbn.fn.warning("The component source is not defined");
        return;
      }
      /** @var {Object} attr The attributes of the element to be built */
      const attr = bbn.fn.createObject();
      let isChanged = false;
      // Other normal props are prioritarian
      for (let n in props) {
        switch (n) {
          case 'ref':
            bbn.fn.checkType(props.ref, 'string');
            cpSource.$setRef(props.ref, ele);
            break;
          case 'class':
            if (ele !== this.$el) {
              if (ele.className !== props['class']) {
                ele.className = props['class'];
              }
            }
            break;
          case 'style':
            if (ele !== this.$el) {
              if (props.style !== ele.style.cssText) {
                ele.style.cssText = bbn.wc.convertStyles(props.style);
              }
            }
            break;
          default:
            if (n.indexOf('bbn-') !== 0) {
              attr[n] = props[n];
            }
        }
      }

      if (Object.hasOwn(props, 'bbn-show')) {
        if (props['bbn-show'] && (ele.style.display === 'none')) {
          ele.style.removeProperty('display');
        }
        else if (!props['bbn-show']) {
          ele.style.display = 'none';
        }
      }

      if (node.model) {
        for (let n in node.model) {
          let isC = false;
          if (isComponent) {
            if (ele.bbnSchema.props[n] !== node.model[n].value) {
              ele.bbnSchema.props[n] = node.model[n].value;
              isChanged = true;
              isC = true;
            }
          }
          else if ((ele[n] !== undefined) && (ele[n] !== node.model[n].value)) {
            isChanged = true;
            isC = true;
            ele[n] = node.model[n].value;
          }
          /*
          if (isC) {
            bbn.fn.iterate(this.$dataModels, (id, exp) => {
              if (exp === node.model[n].exp) {
                if (node.id === id) {
                  return false;
                }
                const twinModelEle = this.$retrieveElenment(id, node.loopHash);
                if (twinModelEle) {
                  twinModelEle[n] = node.model[n].value;
                }
              }
            })
          }
          */
        }
      }
      else if (Object.hasOwn(props, 'bbn-html') && (ele.innerHTML !== props['bbn-html'])) {
        ele.innerHTML = props['bbn-html'];
        isChanged = true;
      }
      else if (Object.hasOwn(props, 'bbn-text') && (ele.innerText !== props['bbn-text'])) {
        ele.innerText = props['bbn-text'];
        isChanged = true;
      }

      // Setting up attributes
      if (!isComponent) {
        bbn.fn.iterate(attr, (value, name) => {
          if (bbn.fn.isString(value)) {
            const isAttr = ele[name] !== undefined;
            if (isAttr) {
              const attr = ele[name];
              if (attr !== value) {
                if (!value) {
                  ele.removeAttribute(name);
                }
                else {
                  ele.setAttribute(name, value);
                }
              }
            }
          }
        });
      }

      if (isChanged) {
        if (isComponent && ele.bbn?.$isMounted) {
          //bbn.fn.log("IS CHANGED AND FORCING UPDATE", ele);
          //ele.bbn.$forceUpdate();
        }
      }
    }
  });
})();
