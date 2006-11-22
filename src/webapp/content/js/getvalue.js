
var ns4 = (document.layers);
var ie4 = (document.all && !document.getElementById);
var ie5 = (document.all && document.getElementById);
var ns6 = (!document.all && document.getElementById);

function getElementGlob(dokkument, id) {
   var obj;
   if(ns4) obj = dokkument.layers[id];
   else if(ie4) obj = dokkument.all[id];
     else if(ie5 || ns6) obj = dokkument.getElementById(id);
   return obj;
}

function getElement(id) {
  return getElementGlob(document, id);
  }

// Gets the value of an element in the current document with the given ID
function getValue(id) {
  return ns4? getElement(id).document : getElement(id).firstChild.nodeValue;
}

// Gets the value of an element in the same repetitive domain as "baseid" 
// with the local id of "targetid".
function getRelativeValue(baseid, targetid) {
  colpos = baseid.lastIndexOf(':');
  return getValue(baseid.substring(0, colpos + 1) + targetid);
}