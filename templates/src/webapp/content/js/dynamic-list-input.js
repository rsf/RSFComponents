var DynamicListInput = function() {
  
  function $it(elementID) {
    return document.getElementById(elementID);
  }
  
  function insertAfter(newChild, refChild) {
    var nextSib = refChild.nextSibling;
    if (!nextSib) {
      refChild.parentNode.appendChild(newChild);
      }
    else {
      refChild.parentNode.insertBefore(newChild, nextSib);
      }
    }
  
  // Rewrite the ids of ALL recursively descended rsf-allocated nodes to
  // reflect the change in namebBase
  function rewriteIDs(element, newBranchId) {
    console.log("newBranchId" + newBranchId);
    var colpos = newBranchId.lastIndexOf(':');
    var nameBase = newBranchId.substring(0, colpos + 1);
    var localID = newBranchId.substring(colpos + 1);
    console.log("nameBase " + nameBase);
    
    var elid = element.getAttribute('id');
     console.log("rewriting for " + element);
    if (elid) {
      console.log("Passing id " + elid);
    //      nameBase:dynamic-list-input-row::1:remove
      if (elid.indexOf(nameBase) == 0) {
      var colpos = elid.indexOf(':', nameBase.length);
      var newid = nameBase + localID + (colpos == -1? "" : elid.substring(colpos));
      console.log ("Rewritten " + elid + " to " + newid);
      element.setAttribute('id', newid);
      }
    }
   
    if (element.childNodes) {
      for (var i = 0; i < element.childNodes.length; ++ i) {
        var child = element.childNodes[i];
        if (child.nodeType == 1) {
          console.log("Passing node" + child);
          rewriteIDs(child, newBranchId);
          }
        }
      }
    }
  
  function deriveRowId(nameBase, index) {
    return nameBase + 'dynamic-list-input-row::' + index;
    }
  
  function lastRowInd(existrows) {
    var maxi = -1;
    for (var i in existrows) {
      if (i > maxi) maxi = i;
      }
    return maxi;
    }
  
  function assignRemoveClick(nameBase, i, existrows) {
    console.log("assignRemoveClick " + i);
    existrows[i] = true;
    var rowid = deriveRowId(nameBase, i);
    var removeid = rowid + ':remove';
    console.log("Seeking id " + removeid);
    var removec = $it(removeid);
  
    removec.onclick = function () {
      var rowel = $it(rowid);
      rowel.parentNode.removeChild(rowel);
      delete existrows[i];
      };
    }
  
  return {
    init_DynamicListInput: function(nameBase, rowcount) {
      var existrows = new Object();
      for (var i = 0; i < rowcount; ++ i) {
        assignRemoveClick(nameBase, i, existrows);
      }
      var sampleid = deriveRowId(nameBase, 0);
      var sampleel = $it(sampleid);
      var addid = nameBase + "add-row";
      var addel = $it(addid);
      var nextrowind = rowcount;
      addel.onclick = function() {
        var duprow = sampleel.cloneNode(true);
        var nextrowid = deriveRowId(nameBase, nextrowind);
        rewriteIDs(duprow, nextrowid);

        var lastrowind = lastRowInd(existrows);
        var lastrow = $it(deriveRowId(nameBase, lastrowind));
        insertAfter(duprow, lastrow);
        assignRemoveClick(nameBase, nextrowind, existrows);
        $it(nextrowid + ':input').value = "";
        ++nextrowind;
      };
    }
    
  };
}();