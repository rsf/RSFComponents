
// RSF.js - primitive definitions for parsing RSF-rendered forms and bindings

// definitions placed in RSF namespace, following approach recommended in 
// http://www.dustindiaz.com/namespace-your-javascript/

var RSF = function() {

  var ns4 = (document.layers);
  var ie4 = (document.all && !document.getElementById);
  var ie5 = (document.all && document.getElementById);
  var ns6 = (!document.all && document.getElementById);
  return {
    getElementGlob: function (dokkument, id) {
      var obj;
      if(ns4) obj = dokkument.layers[id];
      else if(ie4) obj = dokkument.all[id];
      else if(ie5 || ns6) obj = dokkument.getElementById(id);
      return obj;
      }

    getElement: function (id) {
      return getElementGlob(document, id);
      }

    // Gets the value of an element in the current document with the given ID
    getValue: function (id) {
      return ns4? getElement(id).document : getElement(id).firstChild.nodeValue;
    }

    // Gets the value of an element in the same repetitive domain as "baseid" 
    // with the local id of "targetid".
    getRelativeValue: function (baseid, targetid) {
      colpos = baseid.lastIndexOf(':');
      return getValue(baseid.substring(0, colpos + 1) + targetid);
      }

    // Gets the ID of an element in the same repetitive domain as "baseid" 
    // with the local id of "targetid".
    getRelativeID: function (baseid, targetid) {
      colpos = baseid.lastIndexOf(':');
      return baseid.substring(0, colpos + 1) + targetid;
    }
  }
}();