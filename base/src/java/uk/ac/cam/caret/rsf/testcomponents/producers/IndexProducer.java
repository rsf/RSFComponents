package uk.ac.cam.caret.rsf.testcomponents.producers;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


import uk.ac.cam.caret.rsf.testcomponents.beans.ComponentChoiceBean;
import uk.ac.cam.caret.rsf.testcomponents.beans.DataBean;
import uk.org.ponder.rsf.components.UICommand;
import uk.org.ponder.rsf.components.UIContainer;
import uk.org.ponder.rsf.components.UIForm;
import uk.org.ponder.rsf.components.UIInput;
import uk.org.ponder.rsf.components.UISelect;
import uk.org.ponder.rsf.evolvers.DateInputEvolver;
import uk.org.ponder.rsf.evolvers.TextInputEvolver;
import uk.org.ponder.rsf.flow.ARIResult;
import uk.org.ponder.rsf.flow.jsfnav.NavigationCase;
import uk.org.ponder.rsf.flow.jsfnav.NavigationCaseReporter;
import uk.org.ponder.rsf.view.ComponentChecker;
import uk.org.ponder.rsf.view.DefaultView;
import uk.org.ponder.rsf.view.ViewComponentProducer;
import uk.org.ponder.rsf.viewstate.SimpleViewParameters;
import uk.org.ponder.rsf.viewstate.ViewParameters;

/**
 * Demonstrates modular RSF components.
 * 
 * @author Antranig Basman (antranig@caret.cam.ac.uk)
 * 
 */

public class IndexProducer implements ViewComponentProducer, DefaultView,
    NavigationCaseReporter {

  public static final String VIEW_ID = "test-components-index";
  private DateInputEvolver dateevolver;
  private TextInputEvolver textevolver;
  private DataBean databean;
  private ComponentChoiceBean choicebean;
  private Locale locale;

  public String getViewID() {
    return VIEW_ID;
  }

  public void setDateEvolver(DateInputEvolver dateevolver) {
    this.dateevolver = dateevolver;
  }

  public void setTextEvolver(TextInputEvolver textevolver) {
    this.textevolver = textevolver;
  }

  // This would not be injected in an OTP implementation
  public void setDataBean(DataBean databean) {
    this.databean = databean;
  }

  public void setChoiceBean(ComponentChoiceBean choicebean) {
    this.choicebean = choicebean;
  }

  public void setLocale(Locale locale) {
    this.locale = locale;
  }
  
  public void fillComponents(UIContainer tofill, ViewParameters viewparamso,
      ComponentChecker checker) {

    UIForm cform = UIForm.make(tofill, "components-form");

    UIInput date1 = UIInput.make(cform, "date-1:", "#{dataBean.date1}");
    dateevolver.evolveDateInput(date1, databean.date1);
    UIInput date2 = UIInput.make(cform, "date-2:", "#{dataBean.date2}");
    dateevolver.evolveDateInput(date2, databean.date2);

    UIInput text = UIInput.make(cform, "rich-text:", "#{dataBean.text}");
    textevolver.evolveTextInput(text);

    UICommand.make(cform, "submit", "#{dataBean.update}");

    UIForm tform = UIForm.make(tofill, "text-select-form");
    List texts = choicebean.getTextEvolvers();
    makeEvolveSelect(tform, texts, "text-select",
        "#{componentChoice.textEvolverIndex}");

    UIForm dform = UIForm.make(tofill, "date-select-form");

    List dates = choicebean.getDateEvolvers();
    makeEvolveSelect(dform, dates, "date-select",
        "#{componentChoice.dateEvolverIndex}");

    UIForm lform = UIForm.make(tofill, "locale-select-form");
    
    Locale[] s = Locale.getAvailableLocales();
    String[] locnames = new String[s.length];
    for (int i = 0; i < s.length; ++ i) {
      locnames[i] = s[i].toString();
    }
    UISelect.make(lform, "locale-select", locnames, "#{componentChoice.locale}", locale.toString());
    UICommand.make(lform, "submit-locale");
  }

  private void makeEvolveSelect(UIForm tform, List texts, String selectID,
      String EL) {
    int ctexts = texts.size();
    String[] choices = new String[ctexts];
    String[] choicenames = new String[ctexts];

    for (int i = 0; i < ctexts; ++i) {
      choices[i] = Integer.toString(i);
      String classname = texts.get(i).getClass().getName();
      int dotpos = classname.lastIndexOf('.');
      classname = classname.substring(dotpos + 1, classname.length()
          - "Evolver".length());
      choicenames[i] = classname;
    }
    UISelect.make(tform, selectID, choices, choicenames, EL, null);
    UICommand.make(tform, "submit-" + selectID);

  }

  public List reportNavigationCases() {
    List togo = new ArrayList();
    togo.add(new NavigationCase("updated", new SimpleViewParameters(
        ResultsProducer.VIEW_ID), ARIResult.FLOW_ONESTEP));
    return togo;
  }

}
