var DynamicListInput = function() {
  
  function $it(elementID) {
    return document.getElementById(elementID);
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
    existrows[i] = true;
    var rowid = deriveRowId(nameBase, i);
    var removeid = rowid + ':remove';
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
        var nextrowid = deriveRowId(nameBase, nextrowind);
        var lastrowind = lastRowInd(existrows);
        var lastrow = $it(deriveRowId(nameBase, lastrowind));
        
        var duprow = RSF.duplicateBranch(sampleel, nextrowid, lastrow);
        
        assignRemoveClick(nameBase, nextrowind, existrows);
        $it(nextrowid + ':input').value = "";
        ++nextrowind;
      };
    }
    
  };
}();