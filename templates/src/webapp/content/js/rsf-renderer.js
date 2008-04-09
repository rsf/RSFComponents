
var RSFRenderer = function() {

  function getFullIDSegment(ID, localID) {
    return RSF.getPrefix(ID) + ':' + localID + ':';
  }
  
  function computeFullID(component) {
    var stack = [];
    var move = component;
    if (!(component instanceof RSF.UIBranchContainer)) {
      stack[0] = component.ID;
      move = component.parent;
      }
    while (move.parent) {
      if (!move.noID) {
        stack[stack.length] = getFullIDSegment(move.ID, move.localID);
      }
      move = move.parent;
    }
    return stack.reverse().join("");
  }
  
  function fixupTree(tree) {
    if (tree.children) {
    	 tree.childmap = {};
      for (var i = 0; i < tree.children.length; ++ i) {
        var child = tree.children[i];
        child.parent = tree;
        child.fullID = computeFullID(child);
        var colpos = child.ID.indexOf(":"); 
        if (colpos === -1) {
          tree.childmap[child.ID] = child;
        }
        else {
          var prefix = child.ID.substring(0, colpos);
        	var childlist = tree.childmap[prefix]; 
        	if (!childlist) {
        		childlist = [];
        		tree.childmap[prefix] = childlist;
        	}
       
        	childlist[childlist.length] = child;
        }     
        
        fixupTree(child);
      }
    }
  }
  var globalmap = {}
  var branchmap = {}
  var texts = []
  
  function resolveInScope(searchID, defprefix, scope, child) {
    var deflump;
    var scopelook = scope[searchID];
    if (scopelook) {
      for (var i = 0; i < scopelook.length; ++ i) {
        var scopelump = scopelook[i];
        if (!deflump && scopelump.rsfID == defprefix) {
          deflump = scopelump;
        }
        if (scopelump.rsfID == searchID) {
          return scopelump;
        }
      }
    }
    return deflump;
  }
  
  function resolveCall(sourcescope, child) {
    var searchID = child.ID;
    var split = new RSF.SplitID(searchID);
    var defprefix = split.prefix + ':';
    var match = resolveInScope(searchID, defprefix, sourcescope.downmap, child);
    if (match) return match;
    if (child.children) {
      match = resolveInScope(searchID, defprefix, globalmap, child);
      if (match) return match;
    }
    return null;
  }
  
  function resolveRecurse(basecontainer, parentlump) {
    for (var i = 0; i < basecontainer.children.length; ++ i) {
      var branch = basecontainer.children[i];
      if (branch.children) { // it is a branch TODO
        var resolved = resolveCall(parentlump, branch);
        if (resolved) {
          branchmap[branch] = resolved;
          resolveRecurse(branch, resolved);
        }
      }
    }
  }
  
  function resolveBranches(globalmapp, basecontainer, parentlump) {
    branchmap = {};
    globalmap = globalmapp;
    branchmap[basecontainer] = parentlump;
    resolveRecurse(basecontainer, parentlump);
  }

  function out(text) {
    RSF.log("|"+ text + "|");
    texts[texts.length] = text;
  }
  
  function dumpBranchHead(branch, targetlump) {
    var attrcopy = {};
    RSF.assign(attrcopy, targetlump.attributemap);
    adjustForID(attrcopy, branch);
    out("<" + targetlump.tagname + " ");
    out(RSF.dumpAttributes(attrcopy));
    out ("/>");
  }
  
  function dumpTillLump(lumps, start, limit) {
    for (; start < limit; ++ start) {
      out(lumps[start].text);
    }
  }

  function dumpScan(lumps, renderindex, basedepth, closeparent, insideleaf) {
    var start = renderindex;
    while (true) {
      if (renderindex === lumps.length)
        break;
      var lump = lumps[renderindex];
      if (lump.nestingdepth < basedepth)
        break;
      if (lump.rsfID) {
        if (!insideleaf) break;
        if (insideleaf && lump.nestingdepth > basedepth + (closeparent?0:1) ) {
          RSF.log("Error in component tree - leaf component found to contain further components - at " +
              lump.toString());
        }
        else break;
      }
      // target.print(lump.text);
      ++renderindex;
    }
    // ASSUMPTIONS: close tags are ONE LUMP
    if (!closeparent && (renderindex == lumps.length || !lumps[renderindex].rsfID))
      --renderindex;
    
    dumpTillLump(lumps, start, renderindex);
    //target.write(buffer, start, limit - start);
    return renderindex;
  }
  
  
  /*** TRC METHODS ***/
  
  function isEmpty(trc) {
    return trc.endopen.lumpindex === trc.close.lumpindex;
  }
  
  function closeTag(trc) {
    if (!trc.iselide) {
      out("</" + trc.uselump.tagname + ">");
    }
  }

  function renderUnchanged(trc) {
  	// TODO needs work since we don't keep attributes in text
    dumpTillLump(trc.uselump.parent.lumps, trc.uselump.lumpindex + 1,
        trc.close.lumpindex + (trc.iselide ? 0 : 1));
  }
  
  function replaceAttributes(trc) {
    if (!trc.iselide) {
      out(RSF.dumpAttributes(trc.attrcopy));
    }
    dumpTemplateBody(trc);
  }

  function replaceAttributesOpen(trc) {
    if (trc.iselide) {
      replaceAttributes(trc);
    }
    else {
      out(RSF.dumpAttributes(trc.attrcopy));
      out(isEmpty(trc) ? "/>" : ">");

      trc.nextpos = trc.endopen.lumpindex + 1;
    }
  }

  function dumpTemplateBody(trc) {
    if (isEmpty(trc)) {
      if (!trc.iselide) {
        out("/>");
      }
    }
    else {
      if (!trc.iselide) {
        out(">");
      }
      dumpTillLump(trc.uselump.parent.lumps, trc.endopen.lumpindex + 1,
          trc.close.lumpindex + (trc.iselide ? 0 : 1), trc.pos);
    }
  }

  function rewriteLeafOpen(trc, value) {
  	if (trc.iselide) {
      rewriteLeaf(trc.value);
    }
    else {
      if (value)
        replaceBody(trc, value);
      else
        replaceAttributesOpen(trc);
    }
  }
  
  function replaceBody(trc, value) {
    out(RSF.dumpAttributes(trc.attrcopy));
    if (!trc.iselide) {
      out(">");
    }
    out(RSF.XMLEncode(value));
    closeTag(trc);
  }
  
  /*** END TRC METHODS**/
  function renderComponent(torendero, trc) {
    var attrcopy = trc.attrcopy;
    var lumps = trc.uselump.parent.lumps;
    var lumpindex = trc.uselump.lumpindex;
    if (torendero instanceof RSF.UIOutput) {
      rewriteLeafOpen(trc, torendero.value.toString());
      }
    }
  
  function adjustForID(attrcopy, component) {
    delete attrcopy["rsf:id"];
    attrcopy.id = component.fullID;
  }
  
  function renderComponentSystem(torendero, lump) {
    var lumpindex = lump.lumpindex;
    var lumps = lump.parent.lumps;
    var nextpos = -1;
    var outerendopen = lumps[lumpindex + 1];
    var outerclose = lump.close_tag;

    nextpos = outerclose.lumpindex + 1;

    var payloadlist = lump.downmap["payload-component"];
    var payload = payloadlist? payloadlist[0] : null;
    if (torendero == null) {
    	// no support for SCR yet
    }
    else {
    	// else there IS a component and we are going to render it. First make
      // sure we render any preamble.
      var endopen = outerendopen;
      var close = outerclose;
      var uselump = lump;
      if (payload) {
        endopen = lumps[payload.lumpindex + 1];
        close = payload.close_tag;
        uselump = payload;
        dumpTillLump(lumps, lumpindex, payload.lumpindex);
        lumpindex = payload.lumpindex;
      }

      var attrcopy = {};
      RSF.assign(attrcopy, lump.attributemap);
      adjustForID(attrcopy, torendero);
      //decoratormanager.decorate(torendero.decorators, uselump.getTag(), attrcopy);
      var iselide = lump.rsfID.charAt(0) === '~';
      var rendercontext = {
        attrcopy: attrcopy,
        uselump: uselump,
        endopen: endopen,
        close: close,
        nextpos: nextpos,
        iselide: iselide};
      
      // ALWAYS dump the tag name, this can never be rewritten. (probably?!)
      if (!iselide) {
        out("<" + uselump.tagname);
       }
    

      renderComponent(torendero, rendercontext);
      // if there is a payload, dump the postamble.
      if (payload != null) {
        // the default case is initialised to tag close
        if (rendercontext.nextpos === nextpos) {
          dumpTillLump(lumps, close.lumpindex + 1, outerclose.lumpindex + 1, rsc.pos);
        }
      }
      nextpos = rendercontext.nextpos;
      }
  return nextpos;
  }
  
  function renderContainer(child, targetlump) {
    var t2 = targetlump.parent;
    var firstchild = t2.lumps[targetlump.lumpindex + 1];
    if (child instanceof RSF.UIBranchContainer) {
      dumpBranchHead(child, targetlump);
    }
    else {
      renderComponentSystem(child, targetlump);
    }
    renderRecurse(child, targetlump, firstchild);
  }
  
  function fetchComponent(basecontainer, id, lump) {
    if (id.indexOf("msg=") === 0) {
      var key = id.substring("msg=".length);
      // TODO messages
    }
    while (basecontainer) {
      var togo = basecontainer.childmap[id];
      if (togo)
        return togo;
      basecontainer = basecontainer.parent;
    }
    return null;
  }

  function fetchComponents(basecontainer, id) {
    var togo;
    while (basecontainer) {
      togo = basecontainer.childmap[id];
      if (togo)
        break;
      basecontainer = basecontainer.parent;
    }
    return togo;
  }

  function findChild(sourcescope, child) {
    var split = new RSF.SplitID(child.ID);
    var headlumps = sourcescope.downmap[child.ID];
    if (headlumps == null) {
      headlumps = sourcescope.downmap[split.prefix + ":"];
    }
    return headlumps == null ? null : headlumps[0];
  }
  
  function renderRecurse(basecontainer, parentlump, baselump) {
    var renderindex = baselump.lumpindex;
    var basedepth = parentlump.nestingdepth;
    var t1 = parentlump.parent;
    while (true) {
      renderindex = dumpScan(t1.lumps, renderindex, basedepth, true, false);
      if (renderindex === t1.lumps.length) { 
        break;
      }
      var lump = t1.lumps[renderindex];  
      if (lump.nestingdepth < basedepth) {
        break;
      } 
      var id = lump.rsfID;
      if (id.indexOf(':') !== -1) {
        var prefix = RSF.getPrefix(id);
        var children = fetchComponents(basecontainer, prefix);
        if (children) {
          for (var i = 0; i < children.length; ++ i) {
            var child = children[i];
            if (child.children) { // it is a branch TODO
              var targetlump = branchmap[child];
              if (targetlump) {
                renderContainer(child, targetlump);
              }
            }
            else { // repetitive leaf
              var targetlump = findChild(parentlump, child);
              var renderend = renderComponentSystem(child, targetlump);
              var wasopentag = t1.lumps[renderend].nestingdepth >= targetlump.nestingdepth;
              var newbase = child.children? child : basecontainer;
              if (wasopentag) {
                renderRecurse(newbase, targetlump, t1.lumps[renderend]);
                renderend = targetlump.close_tag.lumpindex + 1;
              }
              if (i !== children.length - 1) {
                dumpScan(t1.lumps, renderend, targetlump.nestingdepth - 1, false, false);
              }
              else {
                dumpScan(t1.lumps, renderend, targetlump.nestingdepth, true, false);
              }
            }
          }
        }
        
        var finallump = lump.uplump.finallump[prefix];
        var closefinal = finallump.close_tag;
        renderindex = closefinal.lumpindex + 1;
      }
      else {
        var component;
        if (id) {
          component = fetchComponent(basecontainer, id, lump);
        }
        if (component instanceof RSF.UIBranchContainer) {
          renderContainer(component);
          renderindex = lump.close_tag.lumpindex + 1;
        }
        else {
          renderindex = renderComponentSystem(component, lump);
        }
      }
      if (renderindex === t1.lumps.length) {
        break;
      }
    }
  }
  
  return {
    assign: function(target, args) {
      for (var arg in args) {
        target[arg] = args[arg];
        }
    },
    
    extend: function(o) {
      function F() {}
      F.prototype = o;
      return new F();
    },
  
    UIContainer: function() {
      
    },
    UIBranchContainer: function (args) {
      RSF.assign(this, args);
      },
    UIOutput: function(args) {
      RSF.assign(this, args);
    },
    ViewRoot: function (args) {
      RSF.assign(this, args);
    },
    transform: function(list, transformer) {
    	var togo = [];
    	for (var i = 0; i < list.length; ++ i) {
    		togo[togo.length] = transformer(list[i], i);
    	}
    	return togo;
    },
    renderTemplate: function(template, tree) {
      fixupTree(tree);
      resolveBranches(template.globalmap, tree, template.rootlump);
      texts = [];
      renderRecurse(tree, template.rootlump, template.lumps[template.roottagindex]);
      return texts.join("");
    }
  };
}();

fluid.mixin(RSF, RSFRenderer);

