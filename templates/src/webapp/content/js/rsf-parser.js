var RSF = RSF || {};

(function() {
   // Since Javascript is not multi-threaded, these working variables may be shared 
   // during a template parse
  var t;
  var parser;
  var tagstack;
  var lumpindex = 0;
  var nestingdepth = 0;
  var justended = false;
  
  var defstart = -1;
  var defend = -1;   
  
  var baseURL;
  
  var debugMode = false;
  
  function init(baseURLin, debugModeIn) {
    t.rootlump = RSF.XMLLump(0, -1);
    tagstack = [t.rootlump];
    lumpindex = 0;
    nestingdepth = 0;
    justended = false;
    defstart = -1;
    defend = -1;
    baseURL = baseURLin;
    debugMode = debugModeIn;
  }
  
  function findTopContainer() {
    for (var i = tagstack.length - 1; i >= 0; --i ) {
      var lump = tagstack[i];
      if (lump.rsfID) {
        return lump;
      }
    }
    return t.rootlump;
  }
  
  function newLump() {
    var togo = RSF.XMLLump(lumpindex, nestingdepth);
    if (debugMode) {
      togo.line = parser.getLineNumber();
      togo.column = parser.getColumnNumber();
    }
    //togo.parent = t;
    t.lumps[lumpindex] = togo;
    ++lumpindex;
    return togo;
  }
  
  function addLump(mmap, ID, lump) {
  	 var list = mmap[ID];
  	 if (!list) {
  	 	 list = [];
  	 	 mmap[ID] = list;
  	 }
  	 list[list.length] = lump;
  }
  
  function checkContribute(ID, lump) {
    if (ID.indexOf("scr=contribute-") !== -1) {
      var scr = ID.substring("scr=contribute-".length);
      addLump(t.collectmap, scr, lump);
      }
    }
  
  function rewriteUrl(url) {
    var po = RSF.parseUri(url);
    if (po.protocol || url.charAt(0) === '/') {
      return url;
    }
    else return baseURL + url;
  }
  
  function processTagStart(isempty, text) {
    ++nestingdepth;
    if (justended) {
      justended = false;
      var backlump = newLump();
      backlump.nestingdepth--;
    }
    if (t.firstdocumentindex === -1) {
      t.firstdocumentindex = lumpindex;
    }
    var headlump = newLump();
    var stacktop = tagstack[tagstack.length - 1];
    headlump.uplump = stacktop;
    var tagname = parser.getName();
    headlump.tagname = tagname;
    // NB - attribute names and values are now NOT DECODED!!
    headlump.attributemap = parser.m_attributes;
    for (var attrname in headlump.attributemap) {
      var attrval = headlump.attributemap[attrname];
      if (attrval === "href" || attrval === "src" || attrval === "codebase" || attrval === "action") {
        attrval = rewriteUrl(attrval);
        headlump.attributemap[attrname] = attrval;
        }
      }
    var ID = headlump.attributemap? headlump.attributemap[RSF.ID_ATTRIBUTE] : null;
    if (ID) {
        checkContribute(ID, headlump);
        headlump.rsfID = ID;
        var downreg = findTopContainer();
        if (!downreg.downmap) {
          downreg.downmap = {};
          }
        addLump(downreg.downmap, ID, headlump);
        addLump(t.globalmap, ID, headlump);
        var colpos = ID.indexOf(":");
       if (colpos !== -1) {
       var prefix = ID.substring(0, colpos);
          if (!stacktop.finallump) {
            stacktop.finallump = {};
            }
          stacktop.finallump[prefix] = headlump;
        }
    }
    
    // TODO: accelerate this by grabbing original template text (requires parser
    // adjustment) as well as dealing with empty tags
    headlump.text = "<" + tagname + RSF.dumpAttributes(headlump.attributemap) + ">";
    tagstack[tagstack.length] = headlump;
    if (isempty) {
      processTagEnd();
    }
  }
  
  function processTagEnd() {
    var endlump = newLump();
    --nestingdepth;
    endlump.text = "</" + parser.getName() + ">";
    var oldtop = tagstack[tagstack.length - 1];
    oldtop.close_tag = t.lumps[lumpindex - 1];
    tagstack.length --;
    justended = true;
  }
  
  function processDefaultTag() {
    if (defstart !== -1) {
      if (t.firstdocumentindex === -1) {
        t.firstdocumentindex = lumpindex;
        }
      var text = parser.getContent().substr(defstart, defend - defstart);
      justended = false;
      var newlump = newLump();
      newlump.text = text; 
      defstart = -1;
    }
  }
  // Public definitions begin here
  
  RSF.ID_ATTRIBUTE = "rsf:id";
  
  RSF.HTML_CONSTANTS = {
    "href": ["a", "link"],
    "src": ["img", "frame", "script", "iframe", "style", "input", "embed"],
    "action": ["form"],
    "codebase": ["applet", "object"]
  };
  
  RSF.getPrefix = function(id) {
   var colpos = id.indexOf(':');
   return colpos === -1? id : id.substring(0, colpos);
   };
  
  RSF.SplitID = function(id) {
    var colpos = id.indexOf(':');
    if (colpos === -1) {
      this.prefix = id;
      }
    else {
      this.prefix = id.substring(0, colpos);
      this.suffix = id.substring(colpos + 1);
     }
  };
  RSF.XMLLump = function (lumpindex, nestingdepth) {
    return {
      //rsfID: "",
      //text: "",
      //downmap: {},
      //attributemap: {},
      //finallump: {},
      nestingdepth: nestingdepth,
      lumpindex: lumpindex,
      parent: t
    };
  };
  
  RSF.XMLViewTemplate = function() {
    return {
      globalmap: {},
      collectmap: {},
      lumps: [],
      firstdocumentindex: -1
    };
  };
  
  /** Accepts a hash of structures with free keys, where each entry has either
   * href or nodeId set - on completion, callback will be called with the populated
   * structure with fetched resource text in the field "resourceText" for each
   * entry.
   */
  RSF.fetchResources = function(resourceSpecs, callback) {
    var complete = true;
    for (var key in resourceSpecs) {
      var resourceSpec = resourceSpecs[key];
      if (resourceSpec.href && !resourceSpec.resourceText) {
        var templateCallback = function () {
          var thisSpec = resourceSpec;
          return {
            success: function(response) {
              thisSpec.resourceText = response.responseText;
              thisSpec.queued = false; 
              RSF.fetchResources(resourceSpecs, callback);
              }
            }
          }();
         if (!resourceSpec.queued) {
           RSF.queueAJAXRequest("fetchResources", "get", resourceSpec.href, "", templateCallback);
           resourceSpec.queued = true;
         }
         complete = false;             
        }
      else if (resourceSpec.nodeId && !resourceSpec.resourceText) {
        var node = document.getElementById(resourceSpec.nodeId);
        // upgrade this to somehow detect whether node is "armoured" somehow
        // with comment or CDATA wrapping
        resourceSpec.resourceText = RSF.getElementText(node);
      }
    }
    if (complete) {
      callback(resourceSpecs);
    }
  };
  
    // TODO: find faster encoder
  RSF.XMLEncode = function (text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
    };
  
  RSF.dumpAttributes = function(attrcopy) {
    var togo = "";
    for (var attrname in attrcopy) {
      togo += " " + attrname + "=\"" + attrcopy[attrname] + "\"";
      }
    return togo;
    };
  
  RSF.aggregateMMap = function (target, source) {
    for (var key in source) {
      var targhas = target[key];
      if (!targhas) {
        target[key] = [];
      }
      target[key] = target[key].concat(source[key]);
    }
  };
  
  /** Returns a "template structure", with globalmap in the root, and a list
   * of entries {href, template} for each parsed template.
*/
  RSF.parseTemplates = function(resourceSpec, templateList, opts) {
    var togo = [];
    togo.globalmap = {};
    for (var i = 0; i < templateList.length; ++ i) {
      var resource = resourceSpec[templateList[i]];
      var lastslash = resource.href.lastIndexOf("/");
      var baseURL = lastslash === -1? "" : resource.href.substring(0, lastslash + 1);
        
        var template = RSF.parseTemplate(resource.resourceText, baseURL, 
          opts.scanStart && i === 0, opts);
        if (i == 0) {
          RSF.aggregateMMap(togo.globalmap, template.globalmap);
        }
        template.href = resource.href;
        template.baseURL = baseURL;

        togo[i] = template;
        RSF.aggregateMMap(togo.globalmap, template.rootlump.downmap);
      }
      return togo;
    };
  
  RSF.parseTemplate = function(template, baseURL, scanStart, opts) {
    t = RSF.XMLViewTemplate();
    opts = opts || {};
    init(baseURL, opts.debugMode);     

    var idpos = template.indexOf(RSF.ID_ATTRIBUTE);
    if (idpos === -1) return t;
    if (scanStart) {
      var brackpos = template.indexOf('>', idpos);
      parser = new XMLP(template.substring(brackpos + 1));
    }
    else {
      parser = new XMLP(template); 
      }

    parseloop: while(true) {
      var iEvent = parser.next();
//        if (iEvent === XMLP._NONE) break parseloop;
//        continue;
     
      switch(iEvent) {
        case XMLP._ELM_B:
          processDefaultTag()
          //var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
          processTagStart(false, "");
          break;
        case XMLP._ELM_E:
          processDefaultTag()
          processTagEnd();
          break;
        case XMLP._ELM_EMP:
          processDefaultTag()
          //var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());    
          processTagStart(true, "");
          break;
        case XMLP._PI:
        case XMLP._DTD:
          defstart = -1;
          continue; // not interested in reproducing these
        case XMLP._TEXT:
        case XMLP._ENTITY:
        case XMLP._CDATA:
        case XMLP._COMMENT:
          if (defstart === -1) {
            defstart = parser.m_cB;
            }
          defend = parser.m_cE;
          break;
        case XMLP._ERROR:
          RSF.setLogging(true);
          var message = "Error parsing template: " + parser.m_cAlt + 
          " at line " + parser.getLineNumber(); 
          RSF.log(message);
          RSF.log("Just read: " + parser.m_xml.substring(parser.m_iP - 30, parser.m_iP));
          RSF.log("Still to read: " + parser.m_xml.substring(parser.m_iP, parser.m_iP + 30));
          throw (message);
          //alert(message);
          break parseloop;
        case XMLP._NONE:
          break parseloop;
        }
      }
    return t;
//       alert("document complete: " + chars.length + " chars");
  
    }
})();
