var fluid = fluid || {};

fluid.mixin = function (target, args) {
    for (var arg in args) {
        if (args.hasOwnProperty (arg)) {
            target[arg] = args[arg];
        }
    }
};

var RSFParser = function() {
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
   
   function init() {
     t.rootlump = RSF.XMLLump(0, -1);
     tagstack = [];
     lumpindex = 0;
     nestingdepth = 0;
     justended = false;
     defstart = -1;
     defend = -1;
   }
   
   function getStackTop() {
     return tagstack.length == 0? t.rootlump : tagstack[tagstack.length - 1];
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
     togo.line = parser.getLineNumber();
     togo.column = parser.getColumnNumber();
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
   
   function processTagStart(isempty, text) {
     ++nestingdepth;
     if (justended) {
       justended = false;
       var backlump = newLump();
       backlump.nestingdepth--;
     }
     var headlump = newLump();
     var stacktop = getStackTop();
     headlump.uplump = stacktop;
     if (t.roottagindex === -1) {
       t.roottagindex = lumpindex;
     }
     var tagname = parser.getName();
     headlump.tagname = tagname;
     for (var i = 0; i < parser.getAttributeCount(); ++ i) {
       headlump.attributemap[parser.getAttributeName(i)] 
         = parser.getAttributeValue(i);
     }
     var ID = headlump.attributemap[RSF.ID_ATTRIBUTE];
     if (ID) {
         headlump.rsfID = ID;
         var downreg = findTopContainer();
         addLump(downreg.downmap, ID, headlump);
         addLump(t.globalmap, ID, headlump);
         var split = new RSF.SplitID(ID);
         if (split.prefix === "message-for:") {
           
         }
         else if (split.suffix !== undefined) {
           stacktop.finallump[split.prefix] = headlump;
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
     --nestingdepth;
     var endlump = newLump();
     endlump.text = "</" + parser.getName() + ">";
     var oldtop = getStackTop();
     oldtop.close_tag = t.lumps[lumpindex - 1];
     tagstack.length --;
     justended = true;
   }
   
   function processDefaultTag() {
     if (defstart !== -1) {
       var text = parser.getContent().substr(defstart, defend - defstart);
       justended = false;
       var newlump = newLump();
       newlump.text = text; 
       defstart = -1;
     }
   }
   
   return {
     ID_ATTRIBUTE: "rsf:id",
     
     getPrefix: function(id) {
      var colpos = id.indexOf(':');
      return colpos === -1? id : id.substring(0, colpos);
      },
     
     SplitID: function(id) {
       var colpos = id.indexOf(':');
       if (colpos === -1) {
         this.prefix = id;
         }
       else {
         this.prefix = id.substring(0, colpos);
         this.suffix = id.substring(colpos + 1);
        }
     },
     XMLLump: function (lumpindex, nestingdepth) {
       return {
         //rsfID: "",
         text: "",
         downmap: {},
         attributemap: {},
         finallump: {},
         nestingdepth: nestingdepth,
         lumpindex: lumpindex,
         parent: t
       };
     },
     
     XMLViewTemplate: function() {
       return {
         globalmap: {},
         lumps: [],
         roottagindex: -1
       };
     },
     
       // TODO: find faster encoder
     XMLEncode: function (text) {
       return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
       },
     
     dumpAttributes: function(attrcopy) {
       var togo = [];
       for (var attrname in attrcopy) {
         togo[togo.length] = " " + attrname + "=\"" + RSF.XMLEncode(attrcopy[attrname]) + "\"";
         }
       return togo.join("");
       },
     
     parseTemplate: function(template) {
       t = RSF.XMLViewTemplate();
       init();       
   
       var idpos = template.indexOf(RSF.ID_ATTRIBUTE);
       if (idpos === -1) return t;
       var brackpos = template.lastIndexOf('<', idpos);
       parser = new XMLP(template.substring(brackpos));
    
       parseloop: while(true) {
        var iEvent = parser.next();
            
        switch(iEvent) {
        case XMLP._ELM_B:
          processDefaultTag()
          var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
          processTagStart(false, text);
          break;
        case XMLP._ELM_E:
          processDefaultTag()
          processTagEnd();
          break;
        case XMLP._ELM_EMP:
          processDefaultTag()
          var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());    
          processTagStart(true, text);
          break;
        case XMLP._TEXT:
        case XMLP._ENTITY:
        case XMLP._PI:
        case XMLP._CDATA:
        case XMLP._COMMENT:
          if (defstart === -1) {
            defstart = parser.getContentBegin();
          }
          defend = parser.getContentEnd();
          break;
        case XMLP._ERROR:
          //alert("error: " + parser.getContent());
          break;
        case XMLP._NONE:
          break parseloop;
        }
     
       }
       return t;
//       alert("document complete: " + chars.length + " chars");
     
     }
   };
    
} ();

var RSF = RSF || {};

fluid.mixin(RSF, RSFParser);