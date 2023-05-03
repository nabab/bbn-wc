(() => {
  bbn.fn.autoExtend('wc', {
    /**
     * This function takes in a template and returns a string version of the template
     * @param {Array} tpl - The template array to be converted
     * @param {number} depth - The depth's level of where we are in the template
     * @return {string} The string version of the template
     */
    templateToString(tpl, depth = 0) {
      res = depth ? '' : '`';
      let hasIf = false;
      let hasElseIf = false;
      let numElse = 0;
      let hasElse = false;
      const space = ' ';
      const closing = ')';
      // Each element
      bbn.fn.each(tpl, ele => {
        if (ele.text) {
          res += ele.text.trim();
        }
        else if (ele.tag) {
          if (ele.props['bbn-for']) {
            let bits = ele.props['bbn-for'].split(' in ');
            if (bits.length !== 2) {
              bbn.fn.error("Malformed for loop");
            }

            depth++;
            res += ('` +\n' + space.repeat(depth*2) + '(() => {\n'
                + space.repeat(depth*2+2) + 'const bbnConstSt = "";\n'
                + space.repeat(depth*2+2) + 'bbn.fn.each (' + bits[1] + ', ' + bits[0] + ' => {\n'
                + space.repeat(depth*2+4) + 'bbnConstSt += `\n'
            );
          }
          if (ele.props['bbn-if']) {
            if (hasIf) {
              res += '` : ``) + `';
            }
            res += '`\n' + space.repeat(depth*2) + ' + (';
            res += ele.props['bbn-if'] + ' ? `\n';
            hasIf = true;
            hasElseIf = hasElse = false;
            numElse = 0;
          }
          else if (ele.props['bbn-elseif']) {
            numElse++;
            hasElseIf = true;
            hasIf = hasElse = false;
            res += '` : ( ' + ele.props['bbn-elseif'] + ' ? `\n';
          }
          else if (ele.props['bbn-else']) {
            hasElse = true;
            hasElseIf = hasIf = false;
            res += '` +\n' + space.repeat(depth*2) + '(';
            res += ele.props['bbn-if'] + ' ? `';
            numElse = 0;
          }
          else if (hasIf) {
            res += '` : ``)\n';
            hasIf = hasElse = hasElseIf = false;
            numElse = 0;
          }
          else if (hasElseIf) {
            res += '` : ``' + closing.repeat(numElse) + '\n';
            hasIf = hasElse = hasElseIf = false;
            numElse = 0;
          }
          else if (hasElse) {
            res += '`' + closing.repeat(numElse + 1) + '\n';
            hasIf = hasElse = hasElseIf = false;
            numElse = 0;
          }

          res += (space.repeat(depth*2) + '<' + ele.tag);
          let propNum = 0;
          this.bbn.fn.each(ele.props, (value, name) => {
            if (name.indexOf('bbn-') !== 0) {
              if (!propNum) {
                res += ' ';
              }
              else {
                res += ('\n' + space.repeat(depth*2 + ele.tag.length + 2));
              }

              if (name === ':class') {
                res += ('class="${bbn.wc.convertClasses(' + value + ')}"');
              }
              else if (name === ':style') {
                res += ('style="${bbn.wc.convertStyles(' + value + ')}"');
              }
              else if (name.indexOf(':') === 0) {
                res += (name.substr(1) + '="${' + value + '}"');
              }
              else {
                res += (name + '="' + value + '"');
              }
              propNum++;
            }
          });
          res += '>\n';

          if (ele.props['bbn-html']) {
            res += '${' + value + '}\n';
          }
          else if (ele.props['bbn-text']) {
            res += '${bbn.fn.html2text(' + value + ')}\n';
          }

          if (ele.items) {
            res += (bbn.wc.templateToString(ele.items, depth + 1) + '\n');
          }
          else if (ele.slots) {
            res += (bbn.wc.templateToString(ele.slots, depth + 1) + '\n');
          }
          res += (space.repeat(depth*2) + '</' + ele.tag + '>');
          if (ele.props['bbn-for']) {
            depth--;
            res += ('`;\n' + space.repeat(depth*2+2) + '})\n'
                + space.repeat(depth*2+2) + 'return bbnConstSt;\n'
                + space.repeat(depth*2) + '})() + `'
            );
          }
        }
      });

      if (hasIf) {
        res += '` : ``) + `';
        hasIf = hasElse = hasElseIf = false;
        numElse = 0;
      }
      else if (hasElseIf) {
        res += '` : ``' + closing.repeat(numElse) + '\n';
        hasIf = hasElse = hasElseIf = false;
        numElse = 0;
      }
      else if (hasElse) {
        res += '`' + closing.repeat(numElse + 1) + '\n';
        hasIf = hasElse = hasElseIf = false;
        numElse = 0;
      }
      
      if (!depth) {
        res += '`';
      }

      return res;
    },

  })
})();
