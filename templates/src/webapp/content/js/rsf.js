// RSF.js - primitive definitions for parsing RSF-rendered forms and bindings

// definitions placed in RSF namespace, following approach recommended in 
// http://www.dustindiaz.com/namespace-your-javascript/

var RSF = function() {

  function invalidate(invalidated, EL, entry) {
      if (!EL) {
        YAHOO.log("invalidate null EL: " + invalidated + " " + entry);
      }
      var stack = RSF.parseEL(EL);
      invalidated[stack[0]] = entry;
      invalidated[stack[1]] = entry;
      invalidated.list.push(entry);
      YAHOO.log("invalidate " + EL);
    };

  function isInvalidated(invalidated, EL) {
    if (!EL) {
      YAHOO.log("isInvalidated null EL: " + invalidated);
    }
    var stack = RSF.parseEL(EL);
    var togo = invalidated[stack[0]] || invalidated[stack[1]];
    YAHOO.log("isInvalidated "+EL+" " + togo); 
    return togo;
    }

  var requestactive = false;
  var queuemap = new Object();
  
  function packAJAXRequest(method, url, parameters, callback) {
    return {method: method, url: url, parameters: parameters, callback: callback};
    }
    
  function wrapCallbacks(callbacks, wrapper) {
    var togo = new Object();
    for (var i in callbacks) {
      togo[i] = wrapper(callbacks[i]);
//      YAHOO.log("For " + i + " wrapped to " + togo[i]);
      }
    return togo;
    }
    
  // private defs for addEvent - see attribution comments below
  var addEventguid = 1;
  
  function handleEvent(event) {
    event = event || fixEvent(window.event);
    var returnValue = true;
    var handlers = this.events[event.type];

    for (var i in handlers) {
      if (!Object.prototype[i]) {
        this.$$handler = handlers[i];
        if (this.$$handler(event) === false) returnValue = false;
        }
      }

    if (this.$$handler) this.$$handler = null;
    return returnValue;
    }

  function fixEvent(event) {
    event.preventDefault = fixEvent.preventDefault;
    event.stopPropagation = fixEvent.stopPropagation;
    return event;
    }
    
  fixEvent.preventDefault = function() {
    this.returnValue = false;
    }
    
  fixEvent.stopPropagation = function() {
    this.cancelBubble = true;
    }
  

  return {
    // Following definitions taken from PPK's "Event handling challenge" winner
    // thread comments at 
    // http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
    // Primary purpose: Leak avoidance in IE through closure-DOM circles
    // written by Dean Edwards, 2005
    // with input from Tino Zijdel - crisp@xs4all.nl
    // http://dean.edwards.name/weblog/2005/10/add-event/
    addEvent: function (element, type, handler) {
      if (element.addEventListener)
        element.addEventListener(type, handler, false);
      else {
        if (!handler.$$guid) handler.$$guid = addEventguid++;
        if (!element.events) element.events = {};
        var handlers = element.events[type];
        if (!handlers) {
          handlers = element.events[type] = {};
          if (element['on' + type]) handlers[0] = element['on' + type];
          element['on' + type] = handleEvent;
          }
        handlers[handler.$$guid] = handler;
        }
      }    

    removeEvent: function (element, type, handler) {
      if (element.removeEventListener)
        element.removeEventListener(type, handler, false);
      else if (element.events && element.events[type] && handler.$$guid)
        delete element.events[type][handler.$$guid];
      }

    queueAJAXRequest: function(token, method, url, parameters, callback) {
      YAHOO.log("queueAJAXRequest: token " + token);
      if (requestactive) {
        YAHOO.log("Request is active, queuing for token " + token);
        queuemap[token] = packAJAXRequest(method, url, parameters, callback);
        }
      else {
        requestactive = true;
        RSF.issueAJAXRequest(method, url, parameters, wrapCallbacks(callback, 
          wrapCallback));
        }
        
      function wrapCallback(callback) {
        return function(args) {
//          YAHOO.log("wrapCallback begin callback " + callback + " args " + args);
          requestactive = false;
          callback(args);
          YAHOO.log("Callback concluded");
          for (var i in queuemap) {
            YAHOO.log("Examining for token " + i);
            if (requestactive) return;
            var queued = queuemap[i];
            delete queuemap[i];
            RSF.queueAJAXRequest(token, queued.method, queued.url, queued.parameters, 
              queued.callback);
            }
          };
        }
      },
    
  
    issueAJAXRequest: function(method, url, parameters, callback) {
      var alertContents = function() {
        if (http_request.readyState == 4) {
          if (http_request.status == 200) {
            YAHOO.log("AJAX request success status: " + http_request.status);
            callback.success(http_request);
            } 
          else {
            YAHOO.log("AJAX request error status: " + http_request.status);
            }
          }
        }
      var http_request = false;
      if (window.XMLHttpRequest) { // Mozilla, Safari,...
        http_request = new XMLHttpRequest();
        if (method == "POST" && http_request.overrideMimeType) {
         	// set type accordingly to anticipated content type
            //http_request.overrideMimeType('text/xml');
          http_request.overrideMimeType('text/xml');
          }
        } 
        else if (window.ActiveXObject) { // IE
          try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
            } 
          catch (e) {
            try {
               http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
          }
        }
      if (!http_request) {
        YAHOO.log('Cannot create XMLHTTP instance');
        return false;
      }
      
      http_request.onreadystatechange = alertContents;
      http_request.open(method, url, true);
      http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      http_request.setRequestHeader("Content-length", parameters.length);
      http_request.setRequestHeader("Connection", "close");
      http_request.send(parameters);
      },

  
  
    // From FossilizedConverter.java 
    // key = componentid-fossil, value=[i|o]uitype-name#{bean.member}oldvalue 
    // and
    // key = [deletion|el]-binding, value = [e|o]#{el.lvalue}rvalue 

    parseFossil: function (fossil) {
      fossilex = /(.)(.*)#\{(.*)\}(.*)/;
      var matches = fossil.match(fossilex);
      var togo = new Object();
      togo.input = matches[1] != 'o';
      togo.uitype = matches[2];
      togo.lvalue = matches[3];
      togo.oldvalue = matches[4];
      return togo;
      },

    parseBinding: function (binding, deletion) {
      bindingex = /(.)#\{(.*)\}(.*)/;
      var matches = binding.match(bindingex);
      var togo = new Object();
      togo.EL = matches[1] == 'e';
      togo.lvalue = matches[2];
      togo.rvalue = matches[3];
      togo.isdeletion = deletion == "deletion";
      return togo;
      },

    encodeElement: function(key, value) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(value);
      },
  /** Renders an OBJECT binding, i.e. assigning a concrete value to an EL path **/
    renderBinding: function(lvalue, rvalue) {
      YAHOO.log("renderBinding: " + lvalue + " " + rvalue);
      var binding = RSF.encodeElement("el-binding", "o#{" + lvalue + "}" + rvalue);
      YAHOO.log("Rendered: " + binding);
      return binding;
      },

    renderUVBQuery: function(readEL) {
      return RSF.renderBinding("UVBBean.paths", readEL);
      },
    renderUVBAction: function() {
      return RSF.renderActionBinding("UVBBean.populate");
      },
    renderActionBinding: function (methodbinding) {
      return RSF.encodeElement("Fast track action", methodbinding);
      },
    getUVBResponseID: function(readEL) {
      return ":"+readEL+":";
      },
    /** Accepts a submitting element (<input>) and a list of EL paths to be
     * queried */
    getUVBSubmissionBody: function(element, queryEL) {
      var queries = new Array();
      queries.push(RSF.getPartialSubmissionBody(element));
      for (var i in queryEL) {
        queries.push(RSF.renderUVBQuery(queryEL[i]));
        }
      queries.push(RSF.renderUVBAction());
	  return queries.join("&");      
      },    
    /** Accumulates a response from the UVBView into a compact object 
     * representation.<b>
     * @return o, where o.EL is a map from the requested EL set to the text value
     * returned from the request model, and o.message is a list of {target, text}
     * for any TargettedMessages generated during the request cycle.
     */
    accumulateUVBResponse: function(responseDOM) {
      var togo = new Object();
      togo.EL = new Object();
      togo.message = new Array();
      togo.isError = false;
      
      var values = responseDOM.getElementsByTagName("value");
      for (var i in values) {
        var value = values[i];
//        YAHOO.log("value " + i + " " + value[i]);
        if (!value.getAttribute) continue;
        var id = value.getAttribute("id");
        var text = RSF.getElementText(value);
        YAHOO.log("Value id " + id + " text " + text);
        if (id.substring(0, 4) == "tml:") {
          var target = value.getAttribute("target");
          var severity = value.getAttribute("severity");
          togo.message.push( {target: target, severity: severity, text: text});
          if (severity == "error") {
            togo.isError = true;
            }
          }
        else {
          togo.EL[id] = text;
          }
        }
        return togo;
      },
    /** Return the element text from the supplied DOM node as a single String */
    getElementText: function(element) {
      var nodes = element.childNodes;
      var text = "";
      for (var i in nodes) {
        var child = nodes[i];
        if (child.nodeType == 3) {
          text = text + child.nodeValue;
          }
        }
//      YAHOO.log("text " + text);
      return text; 
    },
      
    findForm: function (element) {
      while(element) {
	    if (element.nodeName.toLowerCase() == "form") return element;
        element = element.parentNode;
        }
      },  
    /** Returns an decreasingly nested set of paths starting with the supplied
     *  EL, thus for path1.path2.path3 will return the list 
     *  {path1.path2.path3,  path1.path2,  path1} */
    parseEL: function(EL) {
      var togo = new Array();
      togo.push(EL);
      while (true) {
        var lastdotpos = EL.lastIndexOf(".");
        if (lastdotpos == -1) break;
        EL = EL.substring(0, lastdotpos);
        togo.push(EL);
        }
      return togo;      
      },
    /** Returns a set of DOM elements (currently of type <input>) 
     * corresponding to the set involved in the EL cascade formed by
     * submission of the supplied element.
     * @param container A DOM element (probably <div>) to be searched for
     * upstream bindings
     * @param element The primary submitting control initiating the cascade.
     */
    getUpstreamElements: function (element) {
      var container = RSF.findForm(element);
      var inputs = container.getElementsByTagName("input");
      var name = element.name;
  
      var fossil;
      var bindings = new Array(); // an array of parsed bindings
  
      var bindingex = /(.*)-binding/;
  
      for (var i in inputs) {
        var input = inputs[i];
        if (input.name) {
          YAHOO.log("Discovered input name " + input.name + " value " + input.value);
          if (input.name == element.name + "-fossil") {
            fossil = RSF.parseFossil(input.value);
            fossil.element = input;
            YAHOO.log("Own Fossil " + fossil.lvalue + " oldvalue " + fossil.oldvalue);
            }
          var matches = input.name.match(bindingex);
          if (matches != null) {
            var binding = RSF.parseBinding(input.value, matches[0]);
            YAHOO.log("Binding lvalue " + binding.lvalue + " " + binding.rvalue);
            binding.element = input;
            bindings.push(binding);
            }
          }
        }
      // a map of EL expressions to DOM elements
      var invalidated = new Object();
      invalidated.list = new Array();
      invalidate(invalidated, fossil.lvalue, fossil.element);
      YAHOO.log("Beginning invalidation sweep from initial lvalue " + fossil.lvalue);
   
      // silly O(n^2) algorithm - writing graph algorithms in Javascript is a pain!
      while (true) {
        var expanded = false;
        for (var i in bindings) {
          var binding = bindings[i];
          if (isInvalidated(invalidated, binding.rvalue)) {
            invalidate(invalidated, binding.lvalue, binding.element);
            expanded = true;
            }
            delete bindings[i];
          }
        if (!expanded) break;
        }
      return invalidated.list;
      }, // end getUpstreamElements
      /** Return the body of a "partial submission" POST corresponding to the
     * section of a form contained within argument "container" rooted at
     * the supplied "element", "as if" that form section were to be submitted
     * with element's value set to "value" */ 
    getPartialSubmissionBody: function(element) {
      var upstream = RSF.getUpstreamElements(element);
      var body = new Array();
      body.push(RSF.encodeElement(element.name, element.value));
      for (var i in upstream) {
        var upel = upstream[i];
     
        var fossilex = /(.*)-fossil/;
        var value = upel.value;
        if (upel.name.match(fossilex)) {
          value = 'j' + value.substring(1);
          }
        YAHOO.log("Upstream " + i + " value " + value + " el " + upel );
        body.push(RSF.encodeElement(upel.name, value));
        }
      return body.join("&");
      },
    /** Return the ID of another element in the same container as the
    * "base", only with the local ID (rsf:id) given by "targetiD"
    */
    getRelativeID: function(baseid, targetid) {
      colpos = baseid.lastIndexOf(':');
      return baseid.substring(0, colpos + 1) + targetid;
      }
      
      
    }; // end return internal "Object"
  }(); // end namespace RSF