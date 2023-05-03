(() => {
  /**
   * Creates an element in the given target
   * @param {HTMLElement} d 
   * @param {HTMLElement} target 
   * @returns 
   */
  Object.defineProperty(bbnComponentPrototype, '$createElement', {
    writable: false,
    configurable: false,
    value: async function(node, target, before) {
      const d = bbn.fn.clone(node);
      // Components have an hyphen
      const isComponent = bbn.wc.isComponent(d);
      /** @constant {Array} todo A list of function to apply once the element will ne created */
      const todo = [];
      /** @constant {bbnComponentFunction} cpSource */
      const cpSource = this;//d.componentId ? bbn.wc.getComponent(d.componentId)?.bbn : this;
      const oldEle = cpSource.$retrieveElement(d.id, d.loopHash);
      let replace = false;
      let isAnonymous = false;
      let ele;
      if (oldEle) {
        const isComment = bbn.fn.isComment(oldEle);
        if (
          (oldEle !== this.$el)
          && (
            (!!d.comment !== isComment)
            || (
              !isComment
              && d.tag
              && !bbn.wc.isTag(d.tag, oldEle)
            )
          )
        ) {
          //bbn.fn.log("REPLACING " + d.id, isComment, d, oldEle);
          replace = true;
        }
        else {
          ele = oldEle;
        }
      }

      /** @todo check todo */
      let tag = d.tag;
      let originalTag;
      if (tag && this.$cfg.componentNames[tag]) {
        tag = this.$cfg.componentNames[tag];
      }
      /** 
       * @todo Add the possibility to change the tag using Customized built-in elements 
       * See createElement
       */
      else if (isComponent) {
        if (this.$addUnknownComponent(tag)) {
          await this.$fetchComponents(tag);
        }
        const originalComponent = window[bbn.fn.camelize(tag) + 'Creator'];
        if (originalComponent?.bbnTag && (originalComponent.bbnTag !== tag)) {
          originalTag = d.tag;
          tag = originalComponent.bbnTag;
        }
      }

      if (!oldEle || replace) {
        if (d.comment) {
          ele = document.createComment(" ***_BBN_*** ");
        }
        else {
          /** 
           * @todo Add the possibility to change the tag using Customized built-in elements 
           * See createElement
           */
          if (isComponent) {
            if (replace && oldEle?.tagName && (tag === oldEle.tagName.toLowerCase())) {
              replace = false;
            }
          }

          /** @constant {HTMLElement} ele */
          const constructorArgs = [tag];
          if (originalTag) {
            constructorArgs.push({
              is: originalTag
            });
          }
          ele = document.createElement(...constructorArgs);
          if (originalTag) {
            ele.setAttribute("is", originalTag);
          }
          if (tag === 'bbn-anonymous') {
            if (d.cfg){
              if (d.cfg.mixins && d.cfg.mixins.indexOf(bbn.wc.mixins.basic) === -1) {
                d.cfg.mixins.push(bbn.wc.mixins.basic);
              }
              Object.defineProperty(ele, 'bbnCfg', {
                value: d.cfg,
                writable: false,
                configurable: false
              });
              if (d.cfg.template) {
                const tmp = bbn.wc.stringToTemplate(d.cfg.template, true);
                Object.defineProperty(ele, 'bbnTpl', {
                  value: tmp.res,
                  writable: false,
                  configurable: false
                });
                Object.defineProperty(ele, 'bbnMap', {
                  value: tmp.map,
                  writable: false,
                  configurable: false
                });
              }
            }
          }
        }

        // Giving to all elements property bbnId
        Object.defineProperty(ele, 'bbnId', {
          value: d.id,
          writable: false,
          configurable: false
        });

        // Outer schema of the component, with the slots
        Object.defineProperty(ele, 'bbnSchema', {
          value: d,
          writable: true,
          configurable: true
        });

        Object.defineProperty(ele, 'bbnComponentId', {
          value: cpSource.$cid,
          writable: false,
          configurable: false
        });

        if (d.loopHash) {
          Object.defineProperty(ele, 'bbnHash', {
            value: d.loopHash,
            writable: false,
            configurable: false
          });
          Object.defineProperty(ele, 'bbnIndex', {
            value: d.loopIndex,
            writable: false,
            configurable: false
          });
        }
        if (isComponent) {
          // Outer schema of the component, with the slots
          Object.defineProperty(ele, 'bbnSlots', {
            value: tag === 'bbn-anonymous' ? bbn.wc.retrieveSlots(ele.bbnTpl) : bbn.fn.clone(ele.constructor.bbnSlots),
            writable: false,
            configurable: false
          });

          // Outer schema of the component, with the slots
          Object.defineProperty(ele, 'bbnModels', {
            value: tag === 'bbn-anonymous' ? bbn.wc.retrieveModels(ele.bbnTpl) : bbn.fn.clone(ele.constructor.bbnModels),
            writable: false,
            configurable: false
          });

        }
      }
      else {
        ele = oldEle;
        if (!bbn.fn.isSame(ele.bbnSchema.props,  d.props)) {
          ele.bbnSchema = d;
          if (isComponent && ele.bbn && ele.bbn.$isMounted) {
            ele.bbn.$tick();
          }
        }
      }

      if (!d.comment) {
        cpSource.$updateElementFromProps(d, ele);

        if (d.pre) {
          ele.innerHTML = d.pre;
        }

      }

      if (oldEle && !replace) {
        if (!d.comment && d.directives) {
          bbn.wc.updateDirectives(d.directives, ele);
        }
        return oldEle;
      }

      cpSource.$addToElements(d.id, ele, d.loopHash, d.loopIndex);

      if (!isComponent) {
        this.$insertElement(ele, target, before, oldEle);
      }

      if (!d.comment && d.directives) {
        bbn.wc.insertDirectives(d.directives, ele);
      }

      return ele;
    }
  });
})();
