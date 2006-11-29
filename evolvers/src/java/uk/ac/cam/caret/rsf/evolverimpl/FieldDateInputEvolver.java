/*
 * Created on 24 Oct 2006
 */
package uk.ac.cam.caret.rsf.evolverimpl;

import java.util.Date;

import uk.org.ponder.beanutil.BeanGetter;
import uk.org.ponder.dateutil.FieldDateTransit;
import uk.org.ponder.dateutil.LocalSDF;
import uk.org.ponder.htmlutil.DateSymbolJSEmitter;
import uk.org.ponder.htmlutil.HTMLUtil;
import uk.org.ponder.rsf.builtin.UVBProducer;
import uk.org.ponder.rsf.components.ELReference;
import uk.org.ponder.rsf.components.UIELBinding;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInput;
import uk.org.ponder.rsf.components.UIJointContainer;
import uk.org.ponder.rsf.components.UIOutput;
import uk.org.ponder.rsf.components.UIVerbatim;
import uk.org.ponder.rsf.evolvers.DateInputEvolver;
import uk.org.ponder.rsf.util.RSFUtil;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParameters;
import uk.org.ponder.rsf.viewstate.ViewStateHandler;
import uk.org.ponder.stringutil.StringGetter;
import uk.org.ponder.stringutil.StringHolder;

public class FieldDateInputEvolver implements DateInputEvolver {
  public static final String COMPONENT_ID = "date-field-input:";
  
  private DateSymbolJSEmitter jsemitter;

  private StringGetter title = new StringHolder("Select Date");

  private String transitbase = "fieldDateTransit";

  private BeanGetter rbg;
  
  private ViewStateHandler vsh;

  private String JSInitName = "RSF_Calendar.initYahooCalendar_Datefield";
  
  public void setViewStateHandler(ViewStateHandler vsh) {
    this.vsh = vsh;
  }

  public void setJSEmitter(DateSymbolJSEmitter jsemitter) {
    this.jsemitter = jsemitter;
  }
  
  public void setTitle(StringGetter title) {
    this.title  = title;
  }

  public void setTransitBase(String transitbase) {
    this.transitbase  = transitbase;
  }
  
  public void setRequestBeanGetter(BeanGetter rbg) {
    this.rbg = rbg;
  }
  
  public void setJSInitName(String JSInitName) {
    this.JSInitName  = JSInitName;
  }
  
  public UIJointContainer evolveDateInput(UIInput toevolve, Date value) {
    UIJointContainer togo = new UIJointContainer(toevolve.parent, toevolve.ID, 
        COMPONENT_ID);
    
    toevolve.parent.remove(toevolve);
    
    String ttbo = transitbase + "." + togo.getFullID();
    FieldDateTransit transit = null;
    if (value != null) {
      transit = (FieldDateTransit) rbg.getBean(ttbo);
      transit.setDate(value);
    }

    String ttb = ttbo + ".";    
    
    String jsblock = jsemitter.emitDateSymbols();
    UIVerbatim.make(togo, "datesymbols", jsblock);
   
//    String truedateval = value == null? null : LocalSDF.w3cformat.format(value);
//    
//    UIInput.make(togo, "true-date", toevolve.valuebinding.value, 
//        truedateval);
    
    UIInput field = UIInput.make(togo, "date-field", ttb + "short", transit.getShort());
    field.mustapply = true;
    UIInput truedate = UIInput.make(togo, "true-date", ttb + "date", 
         LocalSDF.w3cformat.format(value));
    truedate.willinput = false;
    UIOutput.make(togo, "date-container");
    UIOutput.make(togo, "date-link");
    UIOutput.make(togo, "date-annotation", null, ttb + "shortFormat");
    
    ViewParameters uvbparams = new SimpleViewParameters(UVBProducer.VIEW_ID);
    
//    String readbinding = ttb + "long";
    
    String initdate = HTMLUtil.emitJavascriptCall(JSInitName, 
        new String[] {togo.getFullID(), title.get(), ttb, 
        vsh.getFullURL(uvbparams)});
    
    UIVerbatim.make(togo, "init-date", initdate);

    UIForm form = RSFUtil.findBasicForm(togo);
    
    form.parameters.add(new UIELBinding(toevolve.valuebinding.value, 
        new ELReference(ttb + "date")));

    return togo;
  }

}
