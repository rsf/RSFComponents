    /* _Cal is **IMPL** for Calendar */

    YAHOO.widget.Calendar2up_PUC_Cal = function(id, containerId, monthyear, selected) {
      if (arguments.length > 0)
      {
        this.init(id, containerId, monthyear, selected);
      }
    }

    YAHOO.widget.Calendar2up_PUC_Cal.prototype = new YAHOO.widget.Calendar2up_Cal();

    /** "Forward" reference here to localisation block rendered into the 
    HTML document **/
    YAHOO.widget.Calendar2up_PUC_Cal.prototype.customConfig = function() {
      this.Config.Locale.MONTHS_SHORT = PUC_MONTHS_SHORT;
      this.Config.Locale.MONTHS_LONG =  PUC_MONTHS_LONG;
      this.Config.Locale.WEEKDAYS_1CHAR = PUC_WEEKDAYS_1CHAR;
      this.Config.Locale.WEEKDAYS_SHORT = PUC_WEEKDAYS_SHORT;
      this.Config.Locale.WEEKDAYS_MEDIUM = PUC_WEEKDAYS_MEDIUM;
      this.Config.Locale.WEEKDAYS_LONG = PUC_WEEKDAYS_LONG;
      this.Config.Options.START_WEEKDAY = PUC_FIRST_DAY_OF_WEEK;
    }

    /** Plain object is **UI** for Calendar, of type YAHOO.widget **/

    YAHOO.widget.Calendar2up_PUC = function(id, containerId, monthyear, selected) {
      if (arguments.length > 0)
      {
        this.buildWrapper(containerId);
        this.init(2, id, containerId, monthyear, selected);
      }
    }

    YAHOO.widget.Calendar2up_PUC.prototype = new YAHOO.widget.Calendar2up();

    YAHOO.widget.Calendar2up_PUC.prototype.constructChild = 
      function(id, containerId, monthyear, selected) {
        var cal = new YAHOO.widget.Calendar2up_PUC_Cal(id, containerId, monthyear, selected);
        return cal;
      };

    /* End YAHOO setup defs */

    YAHOO.namespace("example.calendar");

  function yahoo_showCalendar(cal, dateLink) {
//      YAHOO.example.calendar.cal2.hide();
      
    var pos = YAHOO.util.Dom.getXY(dateLink);
    cal.outerContainer.style.display='block';
    YAHOO.util.Dom.addClass(cal.outerContainer, "annotation-front");
    YAHOO.util.Dom.setXY(cal.outerContainer, [pos[0],pos[1]+dateLink.offsetHeight+1]);
  }

  function yahoo_setDate_Dropdowns(cal, selMonth, selDay) {
    var date1 = cal.getSelectedDates()[0];
    selMonth.selectedIndex = date1.getMonth();
    selDay.selectedIndex = date1.getDate() - 1;
    cal.hide();
  }

  function yahoo_changeDate_Dropdowns(cal, selMonth, selDay) {
    var month = selMonth.selectedIndex;
    var day = selDay.selectedIndex + 1;
      // NB this line specific for 2up - uses undocumented list "pages" of Calendar
    var year = cal.pages[0].pageDate.getFullYear();

    cal.select((month+1) + "/" + day + "/" + year);
    cal.setMonth(month);
    cal.render();
  }


  function yahoo_dateControlChanged(cal, trueDate) {
    var controlDate = cal.getSelectedDates()[0];
    var converted = controlDate.toISO8601String();
    trueDate.value = converted;
    }

  var getAJAXUpdater = function (nameBase, transitbase, AJAXURL, setValueValid) {
    var shortbinding = transitbase + "short";
    var longbinding = transitbase + "long";
    var truebinding = transitbase + "date";
    // Assumes a FieldDateTransit for which we require to read the "long" format
    var callback = {
      success: function(response) {
        YAHOO.log("Response success: " + response + " " + response.responseText);
        var UVB = RSF.accumulateUVBResponse(response.responseXML);
       
        var longresult = UVB.EL[longbinding];
        var trueresult = UVB.EL[truebinding];
        YAHOO.log("Got responseXML " + response.responseXML + " binding " + 
          longbinding + " result " + longresult);
        setValueValid(!UVB.isError, trueresult, longresult);
        }
      };

//    var fireConnection = function(body) {
//      connection = YAHOO.util.Connect.asyncRequest('POST', AJAXURL, callback, body);
//      }
    
    return function() {
      var dateFieldID = nameBase + "date-field";
      var dateField = $it(dateFieldID);
     
      var body = RSF.getUVBSubmissionBody(dateField, [truebinding, longbinding]);
         YAHOO.log("Firing AJAX request " + body);
      RSF.queueAJAXRequest(longbinding, "POST", AJAXURL, body, callback);
    }
  };

/** An object coordinating updates of the textual field value. trueDate and
dateField are both <input>, annotation is a <div> **/
  var registerDateFieldUpdateHandler = function (nameBase, transitbase, AJAXURL) {
    var annotation = $it(nameBase + "date-annotation");
    var truevalue = $it(nameBase + "true-value");
    var format = annotation.innerHTML;
    var dateFieldID = nameBase + "date-field";
    var dateField = $it(dateFieldID);
    
    dateField.onfocus = function() {
      YAHOO.util.Dom.replaceClass(annotation, "annotation-inactive", "annotation-active");
      }
    dateField.onblur = function() {
      YAHOO.util.Dom.replaceClass(annotation, "annotation-active", "annotation-inactive");
    }
    
    var fieldvalue;

	var setValueValid = function(isvalid, truevalue, longvalue) {
//	  alert("isvalid " + isvalid + " " + annotation + " " + annotation.innerHTML);
	  if (isvalid) {
//	    var newspan = document.createElement("span");
//	    newspan.innerHTML = "08 November 2006";
//	    newspan.setAttribute("class", "annotation-active annotation-complete");
//	    dateLink.appendChild(newspan);
	    annotation.innerHTML = longvalue;
	    truevalue.value = truevalue;
	    YAHOO.util.Dom.replaceClass(annotation, "annotation-incomplete", "annotation-complete");
	  }
	  else {
	    annotation.innerHTML = format;
	    YAHOO.util.Dom.replaceClass(annotation, "annotation-complete", "annotation-incomplete");
	    }
      };
    if (AJAXURL) {
      var valueChanged = getAJAXUpdater(nameBase, transitbase, AJAXURL, setValueValid);
      }
    else {
      var valueChanged = function() {
        var trueDate = new Date(2006, 11, 8);
        setValueValid(fieldvalue == "08/11/06", trueDate.toISO8601String(), "08 November 2006");
        };
      }
    
    var fieldChange = function() {
      var newvalue = dateField.value;
      if (newvalue != fieldvalue) {
        YAHOO.log("fieldChange: " + fieldvalue + " " + newvalue);
        fieldvalue = newvalue;
        valueChanged();      
        }
      };
    
    dateField.onkeyup = fieldChange;
    dateField.onChange = fieldChange;
  }

	
  function $it(elementID) {
    return document.getElementById(elementID);
    }

/** Base initialisation for the calendar controls.
 * Parses a JS Date object into a form suitable to initialise the control,
 * Adds event handler to the launching link, and adds the global "dismiss"
 * event listener to the global document. 
 * Returns the constructed JS widget object.
 */

  function initYahooCalendar_base(value, nameBase, controlIDs, title) {
    var containerID = nameBase + "date-container";

    var thisMonth = value.getMonth();
    var thisDay = value.getDate();
    var thisYear = value.getFullYear();
  
    var newcal = 
      new YAHOO.widget.Calendar2up_PUC("YAHOO.calendar."+containerID,
      containerID, (thisMonth+1)+"/"+thisYear, (thisMonth+1)+"/"+thisDay+"/"+thisYear);
  
    var dateLinkID = nameBase + "date-link";
    var dateLink = $it(dateLinkID);
  
    dateLink.onclick = function() { 
      yahoo_showCalendar(newcal, this);
    };
    
    controlIDs.push(dateLinkID);
    controlIDs.push(containerID);
	    
    newcal.title = title;
	 
    var conthash = new Object();
    for (var x in controlIDs) {
      conthash[controlIDs[x]] = 1;
      }

    YAHOO.util.Event.addListener(document, "click", 
      function(e) {
        yahoo_documentClick(e, newcal, conthash);
      });
  
    return newcal;
    }

  function initYahooCalendar_Datefield(nameBase, title, transitbase, AJAXURL) {
    var dateFieldID = nameBase + "date-field";
    var dateField = $it(dateFieldID);

    var trueDate = $it(nameBase + "true-date");
    var valuestring = trueDate.value;
    var value = new Date();
    if (valuestring.length != 0) {
      value.setISO8601(valuestring);
    }
  
    controlIDs = [dateFieldID];
  
    var newcal = initYahooCalendar_base(value, nameBase, controlIDs, title);
    
//    var annotation = $it(nameBase + "date-annotation");
    var dateLink = $it(nameBase + "date-link");
    dateLink.style.display="inline";
    
    registerDateFieldUpdateHandler(nameBase, transitbase, AJAXURL);
    dateField.onChange();
  
    newcal.render();
  }

  function initYahooCalendar_Dropdowns(nameBase, title) {
    var today = new Date();

    var thisMonth = today.getMonth();
    var thisDay = today.getDate();
    var thisYear = today.getFullYear();

    var selMonthID = nameBase + "select-month";
    var selDayID = nameBase + "select-day";

    var selMonth = $it(selMonthID);
    var selDay = $it(selDayID);

    var controlIDs = [selMonthID, selDayID];

    var newcal = initYahooCalendar_base(today, nameBase, controlIDs, title);

    newcal.setChildFunction("onSelect", 
      function() {
        yahoo_setDate_Dropdowns(newcal, selMonth, selDay);
        });
          
    selMonth.selectedIndex = thisMonth;
    selDay.selectedIndex = thisDay-1;

    selMonth.onchange = function() {
	  yahoo_changeDate_Dropdowns(newcal, this, selDay);
	  };
	    
	selDay.onchange = function() {
	  yahoo_changeDate_Dropdowns(newcal, selMonth, this);
	  };

//      YAHOO.example.calendar.cal1.addRenderer("1/1,1/6,5/1,8/15,10/3,10/31,12/25,12/26", YAHOO.example.calendar.cal1.pages[0].renderCellStyleHighlight1);
     newcal.render();
   }

/** The global "dismiss" listener which ensures that any click away
from the controls of an active calendar dismisses its popup **/

  function yahoo_documentClick(e, cal, IDs) { 
    var target = YAHOO.util.Event.getTarget(e);
	  
    var found = false;
    while(target) {
      if (IDs[target.id]) {
	      found = true;
	      }
	    target = target.parentNode;
      }
    if (!found) {
      cal.hide();
      }
//	alert("click " + e); 
    }
	

